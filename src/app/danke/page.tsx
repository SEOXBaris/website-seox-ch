import type { Metadata } from "next";
import Script from "next/script";
import { Section } from "@/components/Section";
import { PageScripts } from "@/components/PageScripts";

export const metadata: Metadata = {
  title: "Danke — wir melden uns bei dir | SEOX",
  description: "Vielen Dank für deine Anfrage. Wir bauen deine persönliche Demo-Webseite und melden uns innerhalb von 24 Stunden.",
  robots: { index: false, follow: true },
};

export default function DankePage() {
  return (
    <>
      <Section name="Header" />

      <main className="thanks-page">
        <div className="container">
          <div className="thanks-hero">
            <div className="thanks-check" aria-hidden="true">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="9 12 11 14 15 9" />
              </svg>
            </div>
            <span className="thanks-tag">Anfrage eingegangen</span>
            <h1>Danke — wir bauen jetzt <em>Deine Demo</em>.</h1>
            <p className="thanks-lead">
              Deine Anfrage ist bei uns angekommen. Wir melden uns innerhalb von
              <strong> 24 Stunden</strong> mit deiner persönlichen Demo-Webseite und
              den nächsten Schritten.
            </p>
            <div className="thanks-cta-row">
              <a href="/" className="btn btn-outline">Zurück zur Startseite</a>
              <a href="/#portfolio" className="btn btn-primary">Referenzen ansehen</a>
            </div>
          </div>

          <div className="thanks-next">
            <h2>So geht es jetzt weiter</h2>
            <ol className="thanks-steps">
              <li>
                <span className="thanks-step-num">1</span>
                <div>
                  <h3>Bestätigung per E-Mail</h3>
                  <p>Du erhältst innerhalb von wenigen Minuten eine Eingangs-Bestätigung. Falls keine Mail kommt: bitte den Spam-Ordner prüfen.</p>
                </div>
              </li>
              <li>
                <span className="thanks-step-num">2</span>
                <div>
                  <h3>Demo-Erstellung in 24 Stunden</h3>
                  <p>Unser Team analysiert deine Branche und baut eine konkrete Demo-Webseite, abgestimmt auf dein Business und deine Zielgruppe.</p>
                </div>
              </li>
              <li>
                <span className="thanks-step-num">3</span>
                <div>
                  <h3>Persönliches Beratungsgespräch</h3>
                  <p>Wir besprechen die Demo, gehen auf deine Fragen ein und zeigen dir, welches Paket am besten passt. Unverbindlich.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </main>

      <Section name="Footer" />
      <PageScripts />

      <Script id="conversion-track" strategy="afterInteractive">
        {`
          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'form_submission_thanks',
              form_id: 'contactForm',
              page_location: window.location.href,
              page_title: document.title,
              conversion_type: 'demo_request'
            });
          }
        `}
      </Script>
    </>
  );
}
