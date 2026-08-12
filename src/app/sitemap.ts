import type { MetadataRoute } from "next";

/** Indexable public owners only (homepage + conversion entry). */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: "https://raiderdigital.dev/",
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://raiderdigital.dev/project-intake",
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
