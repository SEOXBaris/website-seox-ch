import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HUBSPOT_API = "https://api.hubapi.com";
const GRAPH = "https://graph.facebook.com/v22.0";

// 1) Webhook-Verifizierung (Meta ruft GET mit hub.challenge auf)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.META_LEAD_VERIFY_TOKEN) {
    return new Response(challenge || "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

type FieldData = { name: string; values: string[] };

async function hs(path: string, init: RequestInit) {
  const token = process.env.HUBSPOT_PAK;
  return fetch(`${HUBSPOT_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
}

async function upsertHubspotContact(props: Record<string, string>, noteBody: string) {
  if (!process.env.HUBSPOT_PAK || !props.email) return;
  let contactId: string | null = null;
  const create = await hs("/crm/v3/objects/contacts", { method: "POST", body: JSON.stringify({ properties: props }) });
  if (create.ok) {
    contactId = (await create.json()).id;
  } else if (create.status === 409) {
    const err = await create.json().catch(() => ({}));
    const existing = err?.message?.match(/Existing ID:\s*(\d+)/)?.[1];
    if (existing) {
      await hs(`/crm/v3/objects/contacts/${existing}`, { method: "PATCH", body: JSON.stringify({ properties: props }) });
      contactId = existing;
    }
  }
  if (contactId && noteBody) {
    await hs("/crm/v3/objects/notes", {
      method: "POST",
      body: JSON.stringify({
        properties: { hs_note_body: noteBody, hs_timestamp: Date.now() },
        associations: [{ to: { id: contactId }, types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }] }],
      }),
    }).catch(() => {});
  }
  return contactId;
}

async function notify(subject: string, lines: string[]) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL || "guendogdu@seox.ch";
  if (!key) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "myonepager <onboarding@resend.dev>", to: [to], subject, text: lines.join("\n") }),
  }).catch(() => {});
}

// 2) Lead-Eingang verarbeiten
export async function POST(req: Request) {
  const pageToken = process.env.META_PAGE_TOKEN;
  let body: { entry?: Array<{ changes?: Array<{ field?: string; value?: { leadgen_id?: string; form_id?: string } }> }> };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: true }); }

  const leadIds: string[] = [];
  for (const entry of body.entry || []) {
    for (const ch of entry.changes || []) {
      if (ch.field === "leadgen" && ch.value?.leadgen_id) leadIds.push(ch.value.leadgen_id);
    }
  }

  // Immer 200 an Meta zurückgeben; Verarbeitung best-effort
  if (!pageToken) {
    console.warn("[meta-leads] META_PAGE_TOKEN fehlt — Lead-Daten können nicht abgerufen werden", leadIds);
    return NextResponse.json({ ok: true, pending: leadIds.length });
  }

  for (const id of leadIds) {
    try {
      const r = await fetch(`${GRAPH}/${id}?fields=field_data,created_time,form_id&access_token=${encodeURIComponent(pageToken)}`);
      const lead = await r.json();
      if (lead.error) { console.error("[meta-leads] fetch error", lead.error?.message); continue; }
      const fd: FieldData[] = lead.field_data || [];
      const get = (...keys: string[]) => {
        for (const k of keys) {
          const f = fd.find((x) => x.name.toLowerCase().includes(k));
          if (f && f.values?.[0]) return f.values[0];
        }
        return "";
      };
      const email = get("email");
      const fullName = get("full_name", "name");
      const sp = fullName.indexOf(" ");
      const firstname = get("first_name") || (sp > 0 ? fullName.slice(0, sp) : fullName);
      const lastname = get("last_name") || (sp > 0 ? fullName.slice(sp + 1) : "");
      const phone = get("phone");
      const company = get("company", "firma");

      const props: Record<string, string> = {};
      if (firstname) props.firstname = firstname;
      if (lastname) props.lastname = lastname;
      if (email) props.email = email;
      if (phone) props.phone = phone;
      if (company) props.company = company;
      props.hs_lead_source = "Meta Lead Ad";

      const noteLines = [
        "Neuer Meta Lead-Ad Eintrag",
        `Formular: ${lead.form_id || "—"}`,
        `Eingang: ${lead.created_time || "—"}`,
        "",
        ...fd.map((f) => `${f.name}: ${(f.values || []).join(", ")}`),
      ];
      const contactId = await upsertHubspotContact(props, noteLines.join("\n"));
      await notify(`Neuer Meta-Lead: ${fullName || email || id}`, [
        ...noteLines, "", contactId ? `HubSpot-Contact-ID: ${contactId}` : "(HubSpot nicht konfiguriert)",
      ]);
    } catch (e) {
      console.error("[meta-leads] processing error", e);
    }
  }
  return NextResponse.json({ ok: true, processed: leadIds.length });
}
