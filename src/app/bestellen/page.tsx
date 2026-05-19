import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { PageScripts } from "@/components/PageScripts";
import { OrderWizard } from "./Wizard";

export const metadata: Metadata = {
  title: "Bestellen — Deine Webseite in 6 Schritten | myonepager.ch",
  description: "Bestelle deine professionelle Webseite. Wähle Paket, ergänze optionale Module, gib uns dein Briefing und schicke die Bestellung ab — alles in 6 einfachen Schritten.",
  robots: { index: true, follow: true },
};

export default function BestellenPage({ searchParams }: { searchParams: Promise<{ paket?: string; modus?: string }> }) {
  return (
    <>
      <Section name="Header" />
      <main className="order-page">
        <div className="container">
          <OrderWizardWrapper searchParams={searchParams} />
        </div>
      </main>
      <Section name="Footer" />
      <PageScripts />
    </>
  );
}

async function OrderWizardWrapper({ searchParams }: { searchParams: Promise<{ paket?: string; modus?: string }> }) {
  const sp = await searchParams;
  return <OrderWizard initialPaket={sp.paket} initialModus={sp.modus} />;
}
