import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HUBSPOT_API = "https://api.hubapi.com";
const NOTE_TO_CONTACT_ASSOC = 202;

type ContactPayload = {
  firstname?: string;
  lastname?: string;
  email?: string;
  company?: string;
  phone?: string;
  industry?: string;
  website?: string;
  message?: string;
};

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

  const { firstname, lastname, email, company, phone, industry, website, message } = body;
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

  return NextResponse.json({ ok: true, contactId });
}
