"use client";

import { useReducer, useState } from "react";
import { useRouter } from "next/navigation";

type PaketId = "1pager" | "essential" | "professional" | "enterprise";
type Modus = "leasing" | "einmalig";

interface Paket {
  id: PaketId;
  name: string;
  leasing: number | null;
  einmalig: number | null;
  einmaligLabel: string;
  leasingLabel: string;
  inquiry: boolean;
  pages: string;
  desc: string;
}

const PAKETE: Paket[] = [
  { id: "1pager",       name: "1 Pager",       leasing: 199, einmalig: 899,  leasingLabel: "CHF 199/Mt.", einmaligLabel: "ab CHF 899",  inquiry: false, pages: "1 Landingpage",  desc: "Fokussiert auf ein Conversion-Ziel." },
  { id: "essential",    name: "Essential",     leasing: 399, einmalig: 1499, leasingLabel: "CHF 399/Mt.", einmaligLabel: "CHF 1'499",   inquiry: false, pages: "bis 5 Seiten",   desc: "Multi-Page Website für kleine Betriebe." },
  { id: "professional", name: "Professional",  leasing: 599, einmalig: 2899, leasingLabel: "CHF 599/Mt.", einmaligLabel: "CHF 2'899",   inquiry: false, pages: "bis 10 Seiten",  desc: "Erweiterte CR, Heatmaps und Blog." },
  { id: "enterprise",   name: "Enterprise",    leasing: null, einmalig: null, leasingLabel: "auf Anfrage", einmaligLabel: "auf Anfrage", inquiry: true,  pages: "30+ Seiten",     desc: "Premium-Setup mit A/B-Tests, Schulung und Source-Code." },
];

interface Addon { id: string; name: string; price: number; unit: string; desc: string; }
const ADDONS_LEASING: Addon[] = [
  { id: "seo_starter",    name: "SEO Starter",      price: 399, unit: "/Mt.", desc: "3 Keywords, On-/Off-Page, monatlicher Ranking-Report." },
  { id: "seo_pro",        name: "SEO Professional", price: 799, unit: "/Mt.", desc: "10 Keywords, Content-Strategie, Link-Building." },
  { id: "sea_starter",    name: "SEA Starter",      price: 299, unit: "/Mt.", desc: "Google Ads bis CHF 1'500 Media. Media exkl." },
  { id: "sea_pro",        name: "SEA Professional", price: 599, unit: "/Mt.", desc: "Google Ads bis CHF 5'000 Media + Remarketing." },
  { id: "geo",            name: "GEO-Optimierung",  price: 349, unit: "/Mt.", desc: "Sichtbarkeit in ChatGPT, Perplexity und Gemini." },
  { id: "content_social", name: "Content & Social", price: 499, unit: "/Mt.", desc: "4 Blog-Beiträge + 8 Social-Media-Posts/Monat." },
];
const ADDONS_EINMALIG: Addon[] = [
  { id: "seo_kickstart_light", name: "SEO Kickstart Light", price: 1599, unit: " einmalig", desc: "Bis zu 100 Keyword-Analysen + On-Page Top-Seiten + Basis-Audit. Empfohlen für 1 Pager & Essential." },
  { id: "seo_kickstart_pro",   name: "SEO Kickstart Pro",   price: 2490, unit: " einmalig", desc: "Bis zu 1'000 Keyword-Analysen + alle Seiten On-Page + technisches Audit. Empfohlen ab Professional." },
  { id: "sea_kickstart_light", name: "SEA Kickstart Light", price: 1699, unit: " einmalig", desc: "Bis zu 3 Kampagnen + 30 Keywords + Basis-Conversion-Tracking (Media exkl.). Empfohlen für 1 Pager & Essential." },
  { id: "sea_kickstart_pro",   name: "SEA Kickstart Pro",   price: 2590, unit: " einmalig", desc: "Bis zu 10 Kampagnen + 100 Keywords + volles Conversion-Tracking + Remarketing (Media exkl.). Empfohlen ab Professional." },
  { id: "geo_setup",           name: "GEO-Setup",           price: 1490, unit: " einmalig", desc: "Schema Markup, strukturierte Daten, AI-Snippets. Geeignet für alle Pakete." },
];

interface State {
  step: number;
  paket: PaketId;
  modus: Modus;
  addons: string[];
  industry: string;
  websiteUrl: string;
  hasContent: "ja" | "teilweise" | "nein" | "";
  briefing: string;
  wishDate: string;
  preferredContact: "email" | "phone" | "videocall";
  salutation: "Herr" | "Frau" | "—";
  firstname: string;
  lastname: string;
  company: string;
  email: string;
  phone: string;
  agbAccepted: boolean;
}

type Action =
  | { type: "SET"; field: keyof State; value: string | boolean | number | string[] }
  | { type: "TOGGLE_ADDON"; id: string }
  | { type: "NEXT" }
  | { type: "PREV" };

const init = (paket?: string, modus?: string): State => ({
  step: 1,
  paket: (["1pager", "essential", "professional", "enterprise"].includes(paket ?? "") ? paket : "essential") as PaketId,
  modus: (["leasing", "einmalig"].includes(modus ?? "") ? modus : "leasing") as Modus,
  addons: [],
  industry: "",
  websiteUrl: "",
  hasContent: "",
  briefing: "",
  wishDate: "",
  preferredContact: "email",
  salutation: "—",
  firstname: "",
  lastname: "",
  company: "",
  email: "",
  phone: "",
  agbAccepted: false,
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET":
      return { ...state, [action.field]: action.value };
    case "TOGGLE_ADDON":
      return {
        ...state,
        addons: state.addons.includes(action.id)
          ? state.addons.filter((x) => x !== action.id)
          : [...state.addons, action.id],
      };
    case "NEXT":
      return { ...state, step: Math.min(state.step + 1, 6) };
    case "PREV":
      return { ...state, step: Math.max(state.step - 1, 1) };
  }
}

function selectedPaket(s: State): Paket {
  return PAKETE.find((p) => p.id === s.paket)!;
}

function addonList(s: State): Addon[] {
  return s.modus === "leasing" ? ADDONS_LEASING : ADDONS_EINMALIG;
}

function chfFormat(n: number): string {
  return "CHF " + n.toLocaleString("de-CH").replace(/’|,/g, "'");
}

function priceSummary(s: State): { paketPrice: string; addonsPrice: string; total: string; recurring: boolean } {
  const p = selectedPaket(s);
  const addons = addonList(s).filter((a) => s.addons.includes(a.id));

  if (p.inquiry) {
    return { paketPrice: "auf Anfrage", addonsPrice: addons.length ? addons.map((a) => chfFormat(a.price) + a.unit).join(" + ") : "—", total: "auf Anfrage", recurring: s.modus === "leasing" };
  }
  const base = (s.modus === "leasing" ? p.leasing : p.einmalig) ?? 0;
  const addonsSum = addons.reduce((sum, a) => sum + a.price, 0);
  const total = base + addonsSum;
  const unit = s.modus === "leasing" ? "/Mt." : " einmalig";
  return {
    paketPrice: chfFormat(base) + unit,
    addonsPrice: addons.length ? chfFormat(addonsSum) + unit : "—",
    total: chfFormat(total) + unit,
    recurring: s.modus === "leasing",
  };
}

type Bonus = { name: string; value: number };

function bonusesFor(s: State): Bonus[] {
  if (s.modus !== "leasing") return [];
  if (s.paket !== "essential" && s.paket !== "professional" && s.paket !== "enterprise") return [];
  const light = s.paket === "essential";
  const out: Bonus[] = [];
  if (s.addons.some((id) => id === "seo_starter" || id === "seo_pro")) {
    out.push(light ? { name: "SEO Kickstart Light", value: 1599 } : { name: "SEO Kickstart Pro", value: 2490 });
  }
  if (s.addons.some((id) => id === "sea_starter" || id === "sea_pro")) {
    out.push(light ? { name: "SEA Kickstart Light", value: 1699 } : { name: "SEA Kickstart Pro", value: 2590 });
  }
  return out;
}

function canAdvance(s: State): boolean {
  switch (s.step) {
    case 1: return !!s.paket && !!s.modus;
    case 2: return true; // Add-Ons optional
    case 3: return s.industry.trim().length > 1 && s.hasContent !== "";
    case 4: return true; // Wunschtermin + Kontaktart optional
    case 5: return s.firstname.trim().length > 1 && s.email.includes("@") && s.agbAccepted;
    default: return false;
  }
}

const STEP_LABELS = [
  "Paket wählen",
  "Zusatzleistungen",
  "Briefing",
  "Wunschtermin",
  "Kontaktdaten",
  "Bestätigen",
];

export function OrderWizard({ initialPaket, initialModus }: { initialPaket?: string; initialModus?: string }) {
  const [state, dispatch] = useReducer(reducer, init(initialPaket, initialModus));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const summary = priceSummary(state);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const p = selectedPaket(state);
    const addons = addonList(state).filter((a) => state.addons.includes(a.id));

    const bonuses = bonusesFor(state);

    const messageLines = [
      "Bestellung über myonepager.ch/bestellen",
      "",
      `Paket: ${p.name} (${state.modus})`,
      `Preis Basispaket: ${summary.paketPrice}`,
      addons.length ? `Zusatzleistungen: ${addons.map((a) => `${a.name} (${chfFormat(a.price)}${a.unit})`).join(", ")}` : "Zusatzleistungen: keine",
      bonuses.length ? `Gratis-Boni: ${bonuses.map((b) => `${b.name} (Wert ${chfFormat(b.value)})`).join(", ")}` : null,
      `Gesamt: ${summary.total}`,
      "",
    ].filter((l): l is string => l !== null);

    const tailLines = [
      `Branche: ${state.industry || "—"}`,
      `Aktuelle Website: ${state.websiteUrl || "—"}`,
      `Inhalte vorhanden: ${state.hasContent || "—"}`,
      `Wunschtermin: ${state.wishDate || "—"}`,
      `Bevorzugter Kontakt: ${state.preferredContact}`,
      "",
      "Briefing:",
      state.briefing || "—",
    ];
    messageLines.push(...tailLines);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: state.firstname,
          lastname: state.lastname,
          email: state.email,
          phone: state.phone,
          company: state.company,
          industry: state.industry,
          website: state.websiteUrl,
          message: messageLines.join("\n"),
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t.slice(0, 200));
      }
      router.push("/danke?source=bestellen");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Absenden");
      setSubmitting(false);
    }
  }

  return (
    <div className="order-wizard">
      <header className="ow-head">
        <span className="ow-eyebrow">Bestellung · {state.modus === "leasing" ? "Leasing" : "Einmaliger Kauf"}</span>
        <h1>Deine Webseite in 6 Schritten</h1>
        <p>Wähle dein Paket, ergänze optionale Module und schicke die Bestellung ab — wir melden uns innert 24 Stunden.</p>
      </header>

      <div className="ow-progress" role="progressbar" aria-valuenow={state.step} aria-valuemin={1} aria-valuemax={6}>
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          return (
            <div key={n} className={`ow-step ${n === state.step ? "active" : ""} ${n < state.step ? "done" : ""}`}>
              <span className="ow-step-num">{n < state.step ? "✓" : n}</span>
              <span className="ow-step-label">{label}</span>
            </div>
          );
        })}
      </div>

      <div className="ow-card">
        {/* ============ STEP 1: PAKET ============ */}
        {state.step === 1 && (
          <section>
            <div className="ow-section-head">
              <span className="ow-step-tag">Schritt 1 von 6</span>
              <h2>Welches Paket passt zu dir?</h2>
              <p>Du kannst jederzeit wechseln. Modus wählen, Paket klicken — Details siehst du im nächsten Schritt.</p>
            </div>

            <div className="ow-modus-toggle" role="tablist">
              <button type="button" className={state.modus === "leasing" ? "active" : ""} onClick={() => dispatch({ type: "SET", field: "modus", value: "leasing" })}>Leasing (monatlich)</button>
              <button type="button" className={state.modus === "einmalig" ? "active" : ""} onClick={() => dispatch({ type: "SET", field: "modus", value: "einmalig" })}>Einmaliger Kauf</button>
            </div>

            <div className="ow-paket-grid">
              {PAKETE.map((p) => {
                const price = state.modus === "leasing" ? p.leasingLabel : p.einmaligLabel;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`ow-paket-card ${state.paket === p.id ? "selected" : ""}`}
                    onClick={() => dispatch({ type: "SET", field: "paket", value: p.id })}
                  >
                    <div className="ow-paket-name">{p.name}</div>
                    <div className="ow-paket-pages">{p.pages}</div>
                    <div className="ow-paket-price">{price}</div>
                    <p className="ow-paket-desc">{p.desc}</p>
                    {state.paket === p.id && <span className="ow-paket-check" aria-hidden="true">✓</span>}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ============ STEP 2: ZUSATZLEISTUNGEN ============ */}
        {state.step === 2 && (
          <section>
            <div className="ow-section-head">
              <span className="ow-step-tag">Schritt 2 von 6</span>
              <h2>Optionale Zusatzleistungen</h2>
              <p>Erweitere dein Paket gezielt um SEO, Ads oder Content. Komplett optional — du kannst alles auch später dazubuchen.</p>
            </div>

            {state.modus === "leasing" && (selectedPaket(state).id === "essential" || selectedPaket(state).id === "professional" || selectedPaket(state).id === "enterprise") && (
              <div className="ow-bonus-hint">
                <span className="ow-bonus-icon">🎁</span>
                {(() => {
                  const active = bonusesFor(state);
                  const light = selectedPaket(state).id === "essential";
                  const seo = light ? "SEO Kickstart Light (Wert CHF 1'599)" : "SEO Kickstart Pro (Wert CHF 2'490)";
                  const sea = light ? "SEA Kickstart Light (Wert CHF 1'699)" : "SEA Kickstart Pro (Wert CHF 2'590)";
                  if (active.length) {
                    return <><strong>Gratis inklusive:</strong> {active.map((b) => `${b.name} (Wert ${chfFormat(b.value)})`).join(" + ")}.</>;
                  }
                  return <>Bei Buchung eines SEO-Moduls erhältst du {seo} <strong>gratis</strong> — bei einem SEA-Modul {sea} <strong>gratis</strong> dazu.</>;
                })()}
              </div>
            )}

            <div className="ow-addons-list">
              {addonList(state).map((a) => {
                const checked = state.addons.includes(a.id);
                return (
                  <label key={a.id} className={`ow-addon ${checked ? "checked" : ""}`}>
                    <input type="checkbox" checked={checked} onChange={() => dispatch({ type: "TOGGLE_ADDON", id: a.id })} />
                    <div className="ow-addon-body">
                      <div className="ow-addon-head">
                        <span className="ow-addon-name">{a.name}</span>
                        <span className="ow-addon-price">{chfFormat(a.price)}{a.unit}</span>
                      </div>
                      <p className="ow-addon-desc">{a.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        )}

        {/* ============ STEP 3: BRIEFING ============ */}
        {state.step === 3 && (
          <section>
            <div className="ow-section-head">
              <span className="ow-step-tag">Schritt 3 von 6</span>
              <h2>Was machst du?</h2>
              <p>Kurz und knapp — damit wir die Webseite auf deine Branche zuschneiden können.</p>
            </div>

            <div className="ow-form-grid">
              <label className="ow-field full">
                <span>Branche / Tätigkeit *</span>
                <input type="text" value={state.industry} onChange={(e) => dispatch({ type: "SET", field: "industry", value: e.target.value })} placeholder="z.B. Steuerberatung, Coiffeur, Coach, Restaurant …" />
              </label>

              <label className="ow-field full">
                <span>Bestehende Webseite (optional)</span>
                <input type="url" value={state.websiteUrl} onChange={(e) => dispatch({ type: "SET", field: "websiteUrl", value: e.target.value })} placeholder="https://" />
              </label>

              <fieldset className="ow-field full">
                <legend>Inhalte (Texte / Bilder) vorhanden? *</legend>
                <div className="ow-radio-row">
                  {(["ja", "teilweise", "nein"] as const).map((v) => (
                    <label key={v} className={`ow-radio ${state.hasContent === v ? "active" : ""}`}>
                      <input type="radio" name="hasContent" value={v} checked={state.hasContent === v} onChange={() => dispatch({ type: "SET", field: "hasContent", value: v })} />
                      <span>{v === "ja" ? "Ja, vollständig" : v === "teilweise" ? "Teilweise" : "Nein, alles neu"}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="ow-field full">
                <span>Was soll die Webseite erreichen? (Briefing)</span>
                <textarea rows={5} value={state.briefing} onChange={(e) => dispatch({ type: "SET", field: "briefing", value: e.target.value })} placeholder="Ziel, Zielgruppe, Mitbewerber, Tonalität, Wunschfunktionen — alles was du uns mitgeben möchtest." />
              </label>
            </div>
          </section>
        )}

        {/* ============ STEP 4: WUNSCHTERMIN & KONTAKT-ART ============ */}
        {state.step === 4 && (
          <section>
            <div className="ow-section-head">
              <span className="ow-step-tag">Schritt 4 von 6</span>
              <h2>Wann startet ihr am liebsten?</h2>
              <p>Falls es einen Wunschtermin oder bevorzugten Kontakt-Kanal gibt — sag uns Bescheid.</p>
            </div>

            <div className="ow-form-grid">
              <label className="ow-field">
                <span>Wunschstart-Termin (optional)</span>
                <input type="date" value={state.wishDate} onChange={(e) => dispatch({ type: "SET", field: "wishDate", value: e.target.value })} />
              </label>

              <fieldset className="ow-field full">
                <legend>Bevorzugter Kontakt</legend>
                <div className="ow-radio-row">
                  {(["email", "phone", "videocall"] as const).map((v) => (
                    <label key={v} className={`ow-radio ${state.preferredContact === v ? "active" : ""}`}>
                      <input type="radio" name="contact" value={v} checked={state.preferredContact === v} onChange={() => dispatch({ type: "SET", field: "preferredContact", value: v })} />
                      <span>{v === "email" ? "E-Mail" : v === "phone" ? "Telefon" : "Video-Call"}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>
        )}

        {/* ============ STEP 5: KONTAKT ============ */}
        {state.step === 5 && (
          <section>
            <div className="ow-section-head">
              <span className="ow-step-tag">Schritt 5 von 6</span>
              <h2>Deine Kontaktdaten</h2>
              <p>Damit wir uns innert 24 Stunden mit konkreten nächsten Schritten bei dir melden können.</p>
            </div>

            <div className="ow-form-grid">
              <label className="ow-field">
                <span>Anrede</span>
                <select value={state.salutation} onChange={(e) => dispatch({ type: "SET", field: "salutation", value: e.target.value })}>
                  <option>—</option><option>Herr</option><option>Frau</option>
                </select>
              </label>
              <label className="ow-field">
                <span>Vorname *</span>
                <input type="text" value={state.firstname} onChange={(e) => dispatch({ type: "SET", field: "firstname", value: e.target.value })} />
              </label>
              <label className="ow-field">
                <span>Nachname</span>
                <input type="text" value={state.lastname} onChange={(e) => dispatch({ type: "SET", field: "lastname", value: e.target.value })} />
              </label>
              <label className="ow-field">
                <span>Firma</span>
                <input type="text" value={state.company} onChange={(e) => dispatch({ type: "SET", field: "company", value: e.target.value })} />
              </label>
              <label className="ow-field">
                <span>E-Mail *</span>
                <input type="email" value={state.email} onChange={(e) => dispatch({ type: "SET", field: "email", value: e.target.value })} />
              </label>
              <label className="ow-field">
                <span>Telefon</span>
                <input type="tel" value={state.phone} onChange={(e) => dispatch({ type: "SET", field: "phone", value: e.target.value })} />
              </label>

              <label className="ow-field full ow-checkbox-field">
                <input type="checkbox" checked={state.agbAccepted} onChange={(e) => dispatch({ type: "SET", field: "agbAccepted", value: e.target.checked })} />
                <span>Ich akzeptiere die <a href="/agb" target="_blank" rel="noopener">AGB</a> und die <a href="/datenschutz" target="_blank" rel="noopener">Datenschutzbestimmungen</a>. *</span>
              </label>
            </div>
          </section>
        )}

        {/* ============ STEP 6: ZUSAMMENFASSUNG ============ */}
        {state.step === 6 && (
          <section>
            <div className="ow-section-head">
              <span className="ow-step-tag">Schritt 6 von 6</span>
              <h2>Alles checken und absenden</h2>
              <p>Sieht alles passend aus? Dann jetzt absenden — wir melden uns innert 24 Stunden mit dem nächsten Schritt.</p>
            </div>

            <div className="ow-summary">
              <SummaryRow label="Paket" value={`${selectedPaket(state).name} · ${state.modus === "leasing" ? "Leasing" : "Einmaliger Kauf"}`} />
              <SummaryRow label="Preis Paket" value={summary.paketPrice} />
              <SummaryRow label="Zusatzleistungen" value={summary.addonsPrice} />
              {bonusesFor(state).map((b) => (
                <SummaryRow key={b.name} label="🎁 Gratis-Bonus" value={`${b.name} (Wert ${chfFormat(b.value)})`} />
              ))}
              <SummaryRow label="Gesamt" value={summary.total} highlight />
              <SummaryRow label="Branche" value={state.industry || "—"} />
              <SummaryRow label="Inhalte" value={state.hasContent || "—"} />
              <SummaryRow label="Wunschtermin" value={state.wishDate || "—"} />
              <SummaryRow label="Kontakt" value={`${state.salutation === "—" ? "" : state.salutation + " "}${state.firstname} ${state.lastname} · ${state.email}${state.phone ? " · " + state.phone : ""}`} />
            </div>

            {error && <div className="ow-error">{error}</div>}
          </section>
        )}

        {/* ============ NAV ============ */}
        <div className="ow-nav">
          <button type="button" className="btn btn-outline" onClick={() => dispatch({ type: "PREV" })} disabled={state.step === 1 || submitting}>
            ← Zurück
          </button>
          {state.step < 6 ? (
            <button type="button" className="btn btn-primary" onClick={() => dispatch({ type: "NEXT" })} disabled={!canAdvance(state)}>
              Weiter →
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Wird gesendet …" : "Bestellung absenden →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`ow-summary-row ${highlight ? "highlight" : ""}`}>
      <span className="ow-summary-label">{label}</span>
      <span className="ow-summary-value">{value}</span>
    </div>
  );
}
