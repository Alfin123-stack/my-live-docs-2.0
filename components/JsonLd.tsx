/**
 * Menyisipkan JSON-LD. Karakter `<` di-escape (\u003c) supaya string apa pun di
 * dalam data tidak bisa menutup tag <script> (praktik XSS-safe yang
 * direkomendasikan Next.js).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
