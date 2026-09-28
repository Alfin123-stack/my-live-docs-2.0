'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { $isHeadingNode, type HeadingTagType } from '@lexical/rich-text';
import { useTranslations } from 'next-intl';
import { ListTree } from 'lucide-react';

type OutlineItem = { key: string; text: string; tag: HeadingTagType };

// Outline dibangun murni dari heading di EditorState — tidak ada data/permintaan baru,
// jadi tidak menambah beban ke Liveblocks/MongoDB.
export default function OutlinePlugin() {
  const [editor] = useLexicalComposerContext();
  const t = useTranslations('Editor');
  const [items, setItems] = useState<OutlineItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const readOutline = () => {
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const next: OutlineItem[] = [];
        for (const child of root.getChildren()) {
          if ($isHeadingNode(child)) {
            next.push({ key: child.getKey(), text: child.getTextContent(), tag: child.getTag() });
          }
        }
        setItems(next);
      });
    };
    readOutline();
    return editor.registerUpdateListener(readOutline);
  }, [editor]);

  const scrollTo = useCallback(
    (key: string) => {
      const el = editor.getElementByKey(key);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [editor]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('outlineTitle')}
        aria-pressed={open}
        className="icon-btn hidden lg:inline-flex"
      >
        <ListTree className="size-4" aria-hidden />
      </button>

      {open && (
        <div className="fixed right-4 top-24 z-30 hidden max-h-[70vh] w-64 overflow-y-auto rounded-panel border border-hairline bg-card p-3 shadow-adora lg:block">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{t('outlineTitle')}</p>
          {items.length === 0 && <p className="text-sm text-muted">{t('outlineEmpty')}</p>}
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item.key}>
                <button type="button" onClick={() => scrollTo(item.key)} className={outlineItemClass(item.tag)}>
                  {item.text || '\u2026'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function outlineItemClass(tag: HeadingTagType) {
  const base = 'block w-full truncate rounded px-2 py-1 text-left text-sm text-ink-soft transition hover:bg-recessed hover:text-violet-ink';
  if (tag === 'h1') return `${base} font-medium`;
  if (tag === 'h2') return `${base} pl-4`;
  return `${base} pl-6 text-muted`;
}
