import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "LiveDocs — real-time collaborative documents";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return renderOgImage(locale);
}
