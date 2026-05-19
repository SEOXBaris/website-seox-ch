const TOKEN = process.env.NEXT_PUBLIC_LOGODEV_TOKEN || "";

type Item = { name: string; domain: string };

const items: Item[] = [
  { name: "Swisscom", domain: "swisscom.com" },
  { name: "SIXT", domain: "sixt.ch" },
  { name: "local.ch", domain: "local.ch" },
  { name: "HR Beauty", domain: "hrbeauty.ch" },
  { name: "Better You", domain: "betteryou.com" },
  { name: "Parvaris", domain: "parvaris.com" },
  { name: "The Gentlemen's Clinic", domain: "gentlemensclinic.com" },
  { name: "Kafi-Shop", domain: "kafi-shop.ch" },
  { name: "Haarholic", domain: "haarholic.com" },
  { name: "Céline Decarli", domain: "celinedecarli.com" },
  { name: "HFLU", domain: "hflu.ch" },
  { name: "FSWI", domain: "fswi.ch" },
  { name: "SIMAKOM", domain: "simakom.ch" },
  { name: "Henna Tattoo", domain: "hennatattoo.ch" },
  { name: "Viscom Engineering", domain: "viscomag.ch" },
  { name: "Myssak Aesthetics", domain: "myssak-aesthetics.de" },
  { name: "Schloss Langenstein", domain: "schloss-langenstein.com" },
  { name: "Swimatic", domain: "swimatic.ch" },
  { name: "verkaufedeinauto.ch", domain: "verkaufedeinauto.ch" },
  { name: "OM Seminare", domain: "onlinemarketingseminare.ch" },
];

function logoUrl(domain: string) {
  return `https://img.logo.dev/${domain}?token=${TOKEN}&size=200&format=png&theme=dark&retina=true`;
}

function LogoItem({ item, ariaHidden = false }: { item: Item; ariaHidden?: boolean }) {
  return (
    <div className="logo-marquee-cell" aria-hidden={ariaHidden || undefined}>
      <img
        src={logoUrl(item.domain)}
        alt={ariaHidden ? "" : item.name}
        loading="lazy"
        width={120}
        height={48}
      />
    </div>
  );
}

export function LogoMarquee() {
  return (
    <section className="logo-marquee">
      <div className="container">
        <p className="logo-marquee-label">Vertrauen von 46+ Schweizer Marken</p>
      </div>
      <div className="logo-marquee-track-wrap" aria-hidden="true">
        <div className="logo-marquee-track">
          {items.map((item) => (
            <LogoItem key={item.domain} item={item} />
          ))}
          {items.map((item) => (
            <LogoItem key={`dup-${item.domain}`} item={item} ariaHidden />
          ))}
        </div>
      </div>
    </section>
  );
}
