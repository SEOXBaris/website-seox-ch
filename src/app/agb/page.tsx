import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { PageScripts } from "@/components/PageScripts";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen | SEOX Schweiz",
  description: "AGB für Webseiten-Dienstleistungen der SEOX GmbH.",
  robots: { index: false, follow: true },
};

export default function AGBPage() {
  return (
    <>
      <Section name="Header" />
      <main className="legal-page">
        <div className="container">
          <h1>Allgemeine Geschäftsbedingungen</h1>

          <h2>1. Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Beziehung zwischen der SEOX GmbH
            (nachfolgend &laquo;Anbieterin&raquo;) und ihren Kundinnen und Kunden für sämtliche von
            der Anbieterin erbrachten Leistungen rund um Webseiten, SEO, GEO, SEA und Content. Mit
            Vertragsabschluss akzeptiert die Kundschaft diese AGB.
          </p>

          <h2>2. Vertragsabschluss</h2>
          <p>
            Der Vertrag kommt mit Annahme der Offerte durch die Kundschaft zustande (schriftlich,
            per E-Mail oder durch Bestellung über die Website). Mündliche Abreden werden erst durch
            schriftliche Bestätigung der Anbieterin verbindlich.
          </p>

          <h2>3. Leistungsumfang</h2>
          <p>
            Der konkrete Leistungsumfang ergibt sich aus der individuellen Offerte bzw. dem
            gewählten Paket (Starter, Business, Premium). Optionale Module (SEO, GEO, SEA, Content)
            werden separat ausgewiesen.
          </p>

          <h2>4. Preise und Zahlung</h2>
          <p>
            Sämtliche Preise verstehen sich in Schweizer Franken (CHF) und exkl. MwSt., sofern
            nicht anders angegeben. Rechnungen sind innert 14 Tagen ab Rechnungsdatum ohne Abzug
            zur Zahlung fällig. Bei Leasing-Modellen wird monatlich nachschüssig fakturiert.
          </p>

          <h2>5. Mitwirkungspflicht der Kundschaft</h2>
          <p>
            Die Kundschaft stellt der Anbieterin sämtliche für die Leistungserbringung notwendigen
            Informationen, Texte, Bilder und Zugänge rechtzeitig zur Verfügung. Verzögerungen aus
            mangelnder Mitwirkung gehen zulasten der Kundschaft.
          </p>

          <h2>6. Urheberrecht und Nutzungsrechte</h2>
          <p>
            Die von der Anbieterin erstellten Werke (Designs, Texte, Code) bleiben bis zur
            vollständigen Bezahlung deren Eigentum. Mit vollständiger Zahlung erhält die Kundschaft
            ein nicht-ausschliessliches, zeitlich und örtlich unbeschränktes Nutzungsrecht für den
            vereinbarten Zweck.
          </p>

          <h2>7. Gewährleistung und Haftung</h2>
          <p>
            Die Anbieterin haftet ausschliesslich für nachgewiesenermassen grobfahrlässig oder
            vorsätzlich verursachte Schäden. Eine Haftung für entgangenen Gewinn, indirekte Schäden
            oder Folgeschäden ist ausgeschlossen, soweit gesetzlich zulässig.
          </p>

          <h2>8. Kündigung</h2>
          <p>
            Monatliche Abonnemente sind mit einer Frist von einem Monat auf das Ende eines Monats
            kündbar, sofern nicht eine fixe Mindestvertragsdauer vereinbart wurde. Einmalprojekte
            enden mit der Abnahme der Leistung.
          </p>

          <h2>9. Datenschutz</h2>
          <p>
            Es gilt die separate <a href="/datenschutz">Datenschutzerklärung</a>.
          </p>

          <h2>10. Anwendbares Recht und Gerichtsstand</h2>
          <p>
            Es gilt ausschliesslich schweizerisches Recht unter Ausschluss der Kollisionsnormen
            und des UN-Kaufrechts. Ausschliesslicher Gerichtsstand ist Zürich, Schweiz.
          </p>

          <p className="legal-meta">Stand: Mai 2026</p>
        </div>
      </main>
      <Section name="Footer" />
      <PageScripts />
    </>
  );
}
