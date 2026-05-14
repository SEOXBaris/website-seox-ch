import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { PageScripts } from "@/components/PageScripts";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | SEOX Schweiz",
  description: "Datenschutzerklärung für myonepager.ch — Bearbeitung von Personendaten, Tracking via GTM/GA4, Rechte der betroffenen Personen.",
  robots: { index: false, follow: true },
};

export default function DatenschutzPage() {
  return (
    <>
      <Section name="Header" />
      <main className="legal-page">
        <div className="container">
          <h1>Datenschutzerklärung</h1>
          <p>
            Diese Datenschutzerklärung informiert über die Bearbeitung von Personendaten beim Besuch
            der Website myonepager.ch. Verantwortlich im Sinne des revidierten Schweizer
            Datenschutzgesetzes (revDSG) ist:
          </p>
          <p>
            SEOX GmbH<br />
            Badenerstrasse 549, 8048 Zürich<br />
            <a href="mailto:info@seox.ch">info@seox.ch</a>
          </p>

          <h2>Welche Daten werden bearbeitet?</h2>
          <ul>
            <li><strong>Zugriffsdaten</strong> (IP-Adresse, User-Agent, Referrer, Datum/Uhrzeit) werden vom Hosting-Anbieter Vercel automatisch für den Betrieb der Website verarbeitet.</li>
            <li><strong>Formulardaten</strong>, falls du das Kontaktformular benutzt: Name, E-Mail, Nachricht. Diese werden ausschliesslich zur Bearbeitung deiner Anfrage genutzt.</li>
            <li><strong>Nutzungsdaten</strong> über das Google Tag Manager und Google Analytics 4 (siehe unten).</li>
          </ul>

          <h2>Cookies und Tracking</h2>
          <p>
            Diese Website nutzt Google Tag Manager (Container-ID <code>GTM-K7P9WXMP</code>), der
            Google Analytics 4 (Mess-ID <code>G-ZXJ8M0WV1P</code>) lädt. Damit werden anonymisierte
            Nutzungsstatistiken erhoben (Seitenaufrufe, Verweildauer, Geräteklasse, ungefährer Standort).
            Eine direkte Identifikation einzelner Personen ist nicht möglich.
          </p>
          <p>
            Du kannst die Erfassung durch Google Analytics jederzeit über das
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer"> Browser-Add-on von Google </a>
            unterbinden.
          </p>

          <h2>Rechtsgrundlagen und Zweck</h2>
          <p>
            Die Bearbeitung erfolgt auf Basis berechtigter Interessen (Betrieb und Verbesserung
            der Website) sowie deiner ausdrücklichen Einwilligung, wo erforderlich. Daten werden
            nur so lange gespeichert, wie es für den jeweiligen Zweck nötig ist oder gesetzliche
            Aufbewahrungspflichten dies verlangen.
          </p>

          <h2>Weitergabe an Dritte</h2>
          <p>
            Wir geben Personendaten nur an Dritte weiter, wenn dies für die Vertragserfüllung
            erforderlich ist, du eingewilligt hast oder wir gesetzlich dazu verpflichtet sind.
            Eingesetzte Dienstleister: Vercel (Hosting), Google (Analytics, Tag Manager).
          </p>

          <h2>Deine Rechte</h2>
          <p>
            Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
            Bearbeitung und Widerspruch. Eine Anfrage richtest du formlos an
            <a href="mailto:info@seox.ch"> info@seox.ch</a>.
          </p>

          <h2>Änderungen</h2>
          <p>
            Diese Datenschutzerklärung kann angepasst werden, um aktuelle rechtliche
            Anforderungen widerzuspiegeln. Es gilt jeweils die auf dieser Seite veröffentlichte Fassung.
          </p>

          <p className="legal-meta">Stand: Mai 2026</p>
        </div>
      </main>
      <Section name="Footer" />
      <PageScripts />
    </>
  );
}
