'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $createListNode, $createListItemNode } from '@lexical/list';

import { TEMPLATES, type TemplateId } from '@/lib/editor/templates';

/**
 * Template dokumen (Fase 3 #12) diterapkan di CLIENT, bukan di-seed server-side saat
 * `createRoom()`. Alasannya: storage dokumen di sini adalah Yjs (dijembatani
 * @liveblocks/react-lexical), dan cara aman untuk menghasilkan update Yjs yang valid
 * adalah lewat editor Lexical yang benar-benar berjalan (browser) — bukan dikonstruksi
 * manual di server tanpa runtime editor.
 *
 * Alurnya: AddDocumentBtn membuat room kosong lalu redirect ke
 * `/documents/[id]?template=<id>`. Plugin ini jalan sekali saat editor mount, HANYA
 * mengisi kalau dokumen masih benar-benar kosong (jaga-jaga refresh/share link dengan
 * query masih nempel tidak pernah menimpa isi yang sudah ada).
 */
export default function TemplatePlugin() {
  const [editor] = useLexicalComposerContext();
  const searchParams = useSearchParams();
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;
    const templateId = searchParams.get('template') as TemplateId | null;
    if (!templateId || !(templateId in TEMPLATES)) return;
    applied.current = true;

    editor.update(() => {
      const root = $getRoot();
      const isEmpty = root.getChildrenSize() <= 1 && root.getTextContent().trim() === '';
      if (!isEmpty) return;

      root.clear();
      for (const block of TEMPLATES[templateId].blocks) {
        if (block.type === 'heading') {
          const heading = $createHeadingNode(block.tag);
          if (block.text) heading.append($createTextNode(block.text));
          root.append(heading);
        } else if (block.type === 'quote') {
          const quote = $createQuoteNode();
          if (block.text) quote.append($createTextNode(block.text));
          root.append(quote);
        } else if (block.type === 'list') {
          const list = $createListNode(block.ordered ? 'number' : 'bullet');
          for (const item of block.items) {
            const listItem = $createListItemNode();
            listItem.append($createTextNode(item));
            list.append(listItem);
          }
          root.append(list);
        } else {
          const paragraph = $createParagraphNode();
          if (block.text) paragraph.append($createTextNode(block.text));
          root.append(paragraph);
        }
      }
    });

    // Bersihkan ?template= dari URL supaya reload berikutnya tidak mencoba isi ulang.
    const url = new URL(window.location.href);
    url.searchParams.delete('template');
    window.history.replaceState({}, '', url.toString());
  }, [editor, searchParams]);

  return null;
}
