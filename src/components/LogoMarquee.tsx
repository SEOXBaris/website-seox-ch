type Item = { name: string; src: string };

const items: Item[] = [
  { name: "UBS", src: "/logos/UBS.svg" },
  { name: "Sanitas", src: "/logos/Sanitas.svg" },
  { name: "BEKB | BCBE", src: "/logos/BEKB.svg" },
  { name: "CSS", src: "/logos/css.svg" },
  { name: "Vertt", src: "/logos/Vertt.svg" },
  { name: "EnBW", src: "/logos/EnBW.svg" },
  { name: "Thyssenkrupp", src: "/logos/ThyssenKrupp.svg" },
  { name: "SIXT", src: "/logos/SIXT.svg" },
  { name: "Swisscom", src: "/logos/Swisscom.svg" },
  { name: "search.ch", src: "/logos/Search.ch.svg" },
  { name: "local.ch", src: "/logos/Local.ch.svg" },
  { name: "Adobe", src: "/logos/Adobe.svg" },
  { name: "bellvita", src: "/logos/Bellvita.svg" },
  { name: "SBB CFF FFS", src: "/logos/SBB.svg" },
];

function LogoItem({ item, ariaHidden = false }: { item: Item; ariaHidden?: boolean }) {
  return (
    <div className="logo-marquee-cell" aria-hidden={ariaHidden || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.src}
        alt={ariaHidden ? "" : item.name}
        loading="lazy"
        height={36}
      />
    </div>
  );
}

export function LogoMarquee() {
  return (
    <section className="logo-marquee">
      <div className="container">
        <p className="logo-marquee-label">Vertrauen von führenden Schweizer &amp; internationalen Marken</p>
      </div>
      <div className="logo-marquee-track-wrap" aria-hidden="true">
        <div className="logo-marquee-track">
          {items.map((item) => (
            <LogoItem key={item.src} item={item} />
          ))}
          {items.map((item) => (
            <LogoItem key={`dup-${item.src}`} item={item} ariaHidden />
          ))}
        </div>
      </div>
    </section>
  );
}
