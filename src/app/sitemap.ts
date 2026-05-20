import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: "https://www.myonepager.ch/", lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: "https://www.myonepager.ch/ueber-uns", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://www.myonepager.ch/bestellen", lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
