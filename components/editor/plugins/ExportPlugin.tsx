'use client';

import { useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { FileDown, Printer } from 'lucide-react';
import { useTranslations } from 'next-intl';

function slugify(title: string) {
  const slug = (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug || 'document';
}

// Export Markdown: murni client-side, tidak menyentuh Liveblocks/MongoDB.
// Export PDF: pakai window.print() + styles/print.css (Save as PDF bawaan browser),
// bukan render server-side — lebih murah dan tidak butuh dependency (Puppeteer dkk).
export default function ExportPlugin({ title }: { title: string }) {
  const [editor] = useLexicalComposerContext();
  const t = useTranslations('Editor');

  const exportMarkdown = useCallback(() => {
    let markdown = '';
    editor.getEditorState().read(() => {
      markdown = $convertToMarkdownString(TRANSFORMERS);
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(title)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [editor, title]);

  const exportPdf = useCallback(() => {
    window.print();
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={exportMarkdown}
        aria-label={t('exportMarkdown')}
        title={t('exportMarkdown')}
        className="icon-btn"
      >
        <FileDown className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={exportPdf}
        aria-label={t('exportPdf')}
        title={t('exportPdf')}
        className="icon-btn hidden sm:inline-flex"
      >
        <Printer className="size-4" aria-hidden />
      </button>
    </>
  );
}
