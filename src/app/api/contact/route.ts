import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HUBSPOT_API = "https://api.hubapi.com";
const NOTE_TO_CONTACT_ASSOC = 202;
const META_PIXEL_ID = "376009897763234";
const META_GRAPH = "https://graph.facebook.com/v21.0";

type ContactPayload = {
  firstname?: string;
  lastname?: string;
  email?: string;
  company?: string;
  phone?: string;
  industry?: string;
  website?: string;
  message?: string;
  fbEventId?: string;
  fbPurchaseEventId?: string;
  orderValue?: number;
  isOrder?: boolean;
};

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

// Meta Conversions API — server-side mirror of the Pixel events (dedupe via event_id)
async function sendMetaCapi(opts: {
  eventName: string;
  eventId?: string;
  email?: string;
  phone?: string;
  firstname?: string;
  lastname?: string;
  sourceUrl: string;
  clientIp?: string;
  userAgent?: string;
  customData?: Record<string, unknown>;
}) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) return; // CAPI optional — Pixel deckt Client-Seite ab
  const user_data: Record<string, unknown> = {};
  if (opts.email) user_data.em = [sha256(opts.email.trim().toLowerCase())];
  if (opts.phone) {
    const digits = opts.phone.replace(/[^0-9]/g, "");
    if (digits) user_data.ph = [sha256(digits)];
  }
  if (opts.firstname) user_data.fn = [sha256(opts.firstname.trim().toLowerCase())];
  if (opts.lastname) user_data.ln = [sha256(opts.lastname.trim().toLowerCase())];
  if (opts.clientIp) user_data.client_ip_address = opts.clientIp;
  if (opts.userAgent) user_data.client_user_agent = opts.userAgent;

  const body = {
    data: [
      {
        event_name: opts.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: opts.eventId,
        action_source: "website",
        event_source_url: opts.sourceUrl,
        user_data,
        custom_data: opts.customData || {},
      },
    ],
  };

  await fetch(`${META_GRAPH}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {}); // non-fatal
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function hsFetch(path: string, token: string, init: RequestInit) {
  return fetch(`${HUBSPOT_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

export async function POST(req: Request) {
  const token = process.env.HUBSPOT_PAK;
  if (!token) return bad("Server not configured (HUBSPOT_PAK missing)", 500);

  let body: ContactPayload;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON body");
  }

  const { firstname, lastname, email, company, phone, industry, website, message,
          fbEventId, fbPurchaseEventId, orderValue, isOrder } = body;
  if (!email) return bad("E-Mail ist Pflicht");
  if (!firstname) return bad("Vorname ist Pflicht");

  const properties: Record<string, string> = {};
  if (firstname) properties.firstname = firstname;
  if (lastname) properties.lastname = lastname;
  if (email) properties.email = email;
  if (company) properties.company = company;
  if (phone) properties.phone = phone;
  if (industry) properties.industry = industry;
  if (website) properties.website = website;

  let contactId: string | null = null;

  // 1) Try to create
  const createRes = await hsFetch("/crm/v3/objects/contacts", token, {
    method: "POST",
    body: JSON.stringify({ properties }),
  });

  if (createRes.ok) {
    const contact = await createRes.json();
    contactId = contact.id;
  } else if (createRes.status === 409) {
    // 2) Contact exists — update by email
    const errorBody = await createRes.json().catch(() => ({}));
    const existingId: string | undefined = errorBody?.message?.match(/Existing ID:\s*(\d+)/)?.[1];
    if (!existingId) return bad("HubSpot conflict, could not parse existing id", 502);
    const patchRes = await hsFetch(`/crm/v3/objects/contacts/${existingId}`, token, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    if (!patchRes.ok) {
      const t = await patchRes.text();
      return bad(`HubSpot PATCH failed: ${t.slice(0, 300)}`, 502);
    }
    contactId = existingId;
  } else {
    const t = await createRes.text();
    return bad(`HubSpot POST failed: ${t.slice(0, 300)}`, 502);
  }

  // 3) Attach a note with the free-text message + form context
  if (contactId && message) {
    const noteBody = [
      "Neue Demo-Anfrage über myonepager.ch",
      "",
      `Branche: ${industry || "—"}`,
      `Aktuelle Website: ${website || "—"}`,
      "",
      "Nachricht:",
      message,
    ].join("\n");

    await hsFetch("/crm/v3/objects/notes", token, {
      method: "POST",
      body: JSON.stringify({
        properties: {
          hs_note_body: noteBody,
          hs_timestamp: Date.now(),
        },
        associations: [
          {
            to: { id: contactId },
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: NOTE_TO_CONTACT_ASSOC,
              },
            ],
          },
        ],
      }),
    }).catch(() => {}); // non-fatal
  }

  // 4) Notification email via Resend (non-fatal — CRM already has the lead)
  const resendKey = process.env.RESEND_API_KEY;
  const notifyTo = process.env.NOTIFY_EMAIL || "guendogdu@seox.ch";
  if (resendKey && contactId) {
    const contactUrl = `https://app-eu1.hubspot.com/contacts/25245949/record/0-1/${contactId}`;
    const fullName = `${firstname || ""} ${lastname || ""}`.trim() || email;
    const subject = `Neue Demo-Anfrage: ${fullName}${company ? " (" + company + ")" : ""}`;

    const rows: Array<[string, string]> = [
      ["Name", fullName!],
      ["E-Mail", email!],
      ["Firma", company || "—"],
      ["Telefon", phone || "—"],
      ["Branche", industry || "—"],
      ["Aktuelle Website", website || "—"],
    ];

    const html = `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Inter,sans-serif;background:#f6f7f9;padding:24px;color:#0b0b0b;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,.06);">
<div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#d4238a;font-weight:600;">Neue Demo-Anfrage · myonepager.ch</div>
<h1 style="margin:8px 0 24px;font-size:22px;line-height:1.3;">${fullName}${company ? ` · <span style="color:#666;font-weight:400">${company}</span>` : ""}</h1>
<table style="width:100%;border-collapse:collapse;font-size:14px;">
${rows.map(([k, v]) => `<tr><td style="padding:8px 0;color:#666;width:140px;vertical-align:top;">${k}</td><td style="padding:8px 0;color:#0b0b0b;">${v}</td></tr>`).join("")}
</table>
${message ? `<div style="margin-top:24px;padding:16px;background:#f6f7f9;border-radius:10px;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message.replace(/</g, "&lt;")}</div>` : ""}
<a href="${contactUrl}" style="display:inline-block;margin-top:24px;padding:10px 18px;background:#d4238a;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Im HubSpot CRM ansehen →</a>
<div style="margin-top:24px;font-size:12px;color:#999;">Eingegangen via myonepager.ch · Contact-ID ${contactId}</div>
</div></body></html>`;

    const plain = [
      "Neue Demo-Anfrage auf myonepager.ch",
      "",
      ...rows.map(([k, v]) => `${k}: ${v}`),
      ...(message ? ["", "Nachricht:", message] : []),
      "",
      `CRM-Link: ${contactUrl}`,
    ].join("\n");

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "myonepager <onboarding@resend.dev>",
        to: [notifyTo],
        reply_to: email,
        subject,
        html,
        text: plain,
      }),
    }).catch(() => {}); // non-fatal
  }

  // 5) Meta Conversions API (server-side) — gespiegelt zum Pixel, dedupe via event_id
  const sourceUrl = isOrder ? "https://www.myonepager.ch/bestellen" : "https://www.myonepager.ch/";
  const clientIp = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || undefined;
  const userAgent = req.headers.get("user-agent") || undefined;

  await sendMetaCapi({
    eventName: "Lead",
    eventId: fbEventId,
    email, phone, firstname, lastname,
    sourceUrl, clientIp, userAgent,
    customData: { content_name: isOrder ? "Bestellung" : "Kontaktformular" },
  });

  if (isOrder && typeof orderValue === "number" && orderValue > 0) {
    await sendMetaCapi({
      eventName: "Purchase",
      eventId: fbPurchaseEventId,
      email, phone, firstname, lastname,
      sourceUrl, clientIp, userAgent,
      customData: { value: orderValue, currency: "CHF", content_name: "Bestellung" },
    });
  }

  return NextResponse.json({ ok: true, contactId });
}
