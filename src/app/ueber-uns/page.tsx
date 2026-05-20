import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { PageScripts } from "@/components/PageScripts";

export const metadata: Metadata = {
  title: "Über uns — die Agentur hinter myonepager.ch | SEOX",
  description:
    "myonepager.ch ist ein Service von SEOX — der Schweizer Agentur für SEO, GEO und digitales Marketing. Über 25 Jahre Erfahrung, über 1'000 Top-1-Rankings.",
  alternates: { canonical: "/ueber-uns" },
  robots: { index: true, follow: true },
};

const team = [
  { name: "Baris Gündogdu", role: "Gründer · SEO, SEA & Growth" },
  { name: "Aleksandar Bozic", role: "Product & Technical PM" },
  { name: "Dina Djordjevic", role: "Projektmanagement" },
  { name: "Zoran Mirkovic", role: "Team Lead" },
  { name: "Sveta Dobricic", role: "Frontend- & Backend-Entwicklung" },
  { name: "Milan Stoimirov", role: "Entwicklung" },
  { name: "Nevena Vicentic", role: "Design" },
  { name: "Milos Milojevic", role: "Frontend-Entwicklung" },
];

const stats = [
  { num: "25+", label: "Jahre Erfahrung" },
  { num: "1'000+", label: "Top-1-Rankings" },
  { num: "46+", label: "Kundenprojekte" },
];

const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("");

export default function UeberUnsPage() {
  return (
    <>
      <Section name="Header" />

      <main className="ueber-page">
        <div className="container">
          <header className="ueber-hero">
            <div className="section-tag">Über uns</div>
            <h1>Die Agentur hinter Deiner Webseite</h1>
            <p className="ueber-lead">
              myonepager.ch ist ein Service von <strong>SEOX</strong> — der Schweizer Agentur für SEO,
              GEO und digitales Marketing. Wir bauen keine hübschen Webseiten, die niemand findet,
              sondern Seiten, die ranken und Anfragen bringen.
            </p>
          </header>

          <div className="ueber-stats">
            {stats.map((s) => (
              <div key={s.label} className="ueber-stat">
                <span className="ueber-stat-num">{s.num}</span>
                <span className="ueber-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <section className="section">
          <div className="container ueber-story">
            <div className="ueber-story-block">
              <h2>Kein Name — ein Netzwerk</h2>
              <p>
                SEOX ist kein Name, es ist ein Netzwerk. Ein Netzwerk aus digitalen Profis, die
                SEO &amp; Content, Performance-Marketing und Web-Analyse nicht nur beherrschen, sondern
                leben. Angeführt von Baris Gündogdu, der schon Marken wie local.ch, search.ch und
                Swisscom auf Erfolgskurs gebracht hat.
              </p>
            </div>
            <div className="ueber-story-block">
              <h2>Unsere Mission: Dein Erfolg</h2>
              <p>
                Wir holen das Maximum aus Deinem Online-Auftritt heraus — in klassischen Suchmaschinen
                und in der neuen KI-Suche. Dafür kombinieren wir GEO, SEO, SEA, Content, Social Media
                und unsere eigene Technologie zu einer Strategie, die messbar wirkt.
              </p>
            </div>
            <div className="ueber-story-block">
              <h2>Was uns anders macht</h2>
              <p>
                Vergiss 0815-Webagenturen, die nebenbei SEO machen. Wir sind GEO/SEO-Profis durch und
                durch — und haben mit <strong>aimaco.ai</strong> sogar unser eigenes AI-Visibility-Tool
                entwickelt. Unser Fokus: hochwertiger Traffic, ob über Google oder KI-Systeme wie
                ChatGPT, Perplexity und Google AI Overviews.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="text-center">
              <div className="section-tag">Das Team</div>
              <h2 className="section-title">Die Menschen hinter SEOX</h2>
              <p className="section-subtitle">
                Ein Team aus leidenschaftlichen Spezialisten für Strategie, Technik, Content und Design.
              </p>
            </div>
            <div className="ueber-team">
              {team.map((m) => (
                <div key={m.name} className="ueber-team-card">
                  <span className="ueber-avatar" aria-hidden="true">{initials(m.name)}</span>
                  <div className="ueber-team-name">{m.name}</div>
                  <div className="ueber-team-role">{m.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="text-center">
              <div className="section-tag">Standorte</div>
              <h2 className="section-title">Wo Du uns findest</h2>
              <p className="section-subtitle">
                Wir betreuen Unternehmen in der ganzen Deutschschweiz — remote oder vor Ort.
              </p>
            </div>
            <div className="ueber-locations">
              <div className="ueber-location">
                <div className="ueber-location-tag">Headquarter</div>
                <h3>Kreuzlingen</h3>
                <p>SEOX GmbH<br />Sonnenstrasse 4<br />8280 Kreuzlingen</p>
              </div>
              <div className="ueber-location">
                <div className="ueber-location-tag">Office</div>
                <h3>Zürich</h3>
                <p>Thurgauerstrasse 132<br />8152 Opfikon</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="ueber-cta">
              <h2>Bereit für Deine Webseite?</h2>
              <p>In einem kostenlosen Erstgespräch zeigen wir Dir, was möglich ist — unverbindlich.</p>
              <div className="ueber-cta-row">
                <a href="/bestellen" className="btn btn-primary">Jetzt starten</a>
                <a href="/#kontakt" className="btn btn-outline">Kostenlose Beratung</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Section name="Footer" />
      <PageScripts />
    </>
  );
}
