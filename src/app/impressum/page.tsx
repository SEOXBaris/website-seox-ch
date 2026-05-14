import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { PageScripts } from "@/components/PageScripts";

export const metadata: Metadata = {
  title: "Impressum | SEOX Schweiz",
  description: "Impressum und Anbieterkennzeichnung für myonepager.ch — SEOX GmbH, Zürich.",
  robots: { index: false, follow: true },
};

export default function ImpressumPage() {
  return (
    <>
      <Section name="Header" />
      <main className="legal-page">
        <div className="container">
          <h1>Impressum</h1>

          <h2>Anbieterin</h2>
          <p>
            SEOX GmbH<br />
            Badenerstrasse 549<br />
            8048 Zürich<br />
            Schweiz
          </p>

          <h2>Kontakt</h2>
          <p>
            E-Mail: <a href="mailto:info@seox.ch">info@seox.ch</a><br />
            Telefon: <a href="tel:+41442441888">+41 44 244 18 88</a><br />
            Website: <a href="https://seox.ch" target="_blank" rel="noopener noreferrer">seox.ch</a>
          </p>

          <h2>Vertretungsberechtigt</h2>
          <p>Baris Gündogdu, Geschäftsführer</p>

          <h2>Handelsregister</h2>
          <p>
            Eingetragen im Handelsregister des Kantons Zürich.<br />
            UID: CHE-[bitte ergänzen].<br />
            Handelsregister-Nr.: CH-[bitte ergänzen].
          </p>

          <h2>Haftung für Inhalte</h2>
          <p>
            Die Inhalte dieser Website wurden mit grösster Sorgfalt erstellt. Für die Richtigkeit,
            Vollständigkeit und Aktualität der Inhalte übernimmt SEOX GmbH jedoch keine Gewähr.
            Eine Haftung für Schäden, die aus der Nutzung der bereitgestellten Informationen
            entstehen, ist ausgeschlossen, soweit gesetzlich zulässig.
          </p>

          <h2>Haftung für Links</h2>
          <p>
            Diese Website enthält Links zu externen Webseiten Dritter, auf deren Inhalte SEOX GmbH
            keinen Einfluss hat. Für diese fremden Inhalte kann keine Gewähr übernommen werden.
            Verantwortlich für die Inhalte verlinkter Seiten ist stets deren Anbieterin oder Betreiber.
          </p>

          <h2>Urheberrecht</h2>
          <p>
            Sämtliche Inhalte dieser Website (Texte, Bilder, Grafiken, Logos, Quellcode) sind, soweit
            nicht anders gekennzeichnet, urheberrechtlich geschützt. Eine Verwendung ausserhalb des
            privaten Rahmens bedarf der vorgängigen schriftlichen Zustimmung der SEOX GmbH.
          </p>

          <h2>Anwendbares Recht und Gerichtsstand</h2>
          <p>
            Es gilt ausschliesslich schweizerisches Recht unter Ausschluss der Kollisionsnormen.
            Gerichtsstand ist Zürich, Schweiz.
          </p>

          <p className="legal-meta">Stand: Mai 2026</p>
        </div>
      </main>
      <Section name="Footer" />
      <PageScripts />
    </>
  );
}
