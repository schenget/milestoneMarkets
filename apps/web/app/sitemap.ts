import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://milestonemarkets.example";
  return [
    "",
    "/blog",
    "/daily",
    "/countries/ghana",
    "/countries/kenya",
    "/countries/nigeria",
    "/android"
  ].map((p) => ({ url: `${base}${p}`, changeFrequency: "daily", priority: p === "" ? 1 : 0.7 }));
}
