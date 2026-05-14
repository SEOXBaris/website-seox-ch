import { Section } from "@/components/Section";
import { PageScripts } from "@/components/PageScripts";

export default function HomePage() {
  return (
    <>
      <a href="#hero" className="skip-nav">Zum Inhalt springen</a>
      <Section name="Header" />
      <Section name="Hero" />
      <Section name="Problem" />
      <Section name="Loesung" />
      <Section name="Features" />
      <Section name="BeforeAfter" />
      <Section name="ALPS" />
      <Section name="Pricing" />
      <Section name="Configurator" />
      <Section name="Process" />
      <Section name="Portfolio" />
      <Section name="Testimonials" />
      <Section name="FAQ" />
      <Section name="CTA" />
      <Section name="ChatbotFab" />
      <Section name="ChatbotWindow" />
      <Section name="Footer" />
      <PageScripts />
    </>
  );
}
