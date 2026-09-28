import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LiveDocs",
    short_name: "LiveDocs",
    description: "Real-time collaborative document editor.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#592eff",
    icons: [
      { src: "/assets/images/logo.png", sizes: "96x96", type: "image/png" },
      { src: "/assets/images/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/assets/images/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
