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

  return NextResponse.json({ ok: true, contactId });
}
