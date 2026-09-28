'use client';

import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $createParagraphNode, $getSelection, $isRangeSelection, type ElementNode, type TextNode } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { Heading1, Heading2, Heading3, Quote, Pilcrow, List, ListOrdered } from 'lucide-react';

class SlashOption extends MenuOption {
  title: string;
  icon: React.ReactNode;
  run: () => void;
  constructor(title: string, icon: React.ReactNode, run: () => void) {
    super(title);
    this.title = title;
    this.icon = icon;
    this.run = run;
  }
}

// Command/slash menu: ketik "/" untuk ganti blok saat ini jadi heading/quote/list/paragraf.
// List (Fase 7) memakai INSERT_*_LIST_COMMAND, bukan $setBlocksType seperti heading/quote —
// pola ini sama persis dengan yang dipakai Lexical playground resminya untuk ComponentPicker.
// Tidak ada opsi table/image karena node-nya belum terdaftar di Editor.tsx.
export default function SlashCommandPlugin() {
  const [editor] = useLexicalComposerContext();
  const [query, setQuery] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', { minLength: 0 });

  const options = useMemo(() => {
    const setBlock = (create: () => ElementNode) => () =>
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) $setBlocksType(selection, create);
      });

    const all = [
      new SlashOption('Heading 1', <Heading1 className="size-4" aria-hidden />, setBlock(() => $createHeadingNode('h1'))),
      new SlashOption('Heading 2', <Heading2 className="size-4" aria-hidden />, setBlock(() => $createHeadingNode('h2'))),
      new SlashOption('Heading 3', <Heading3 className="size-4" aria-hidden />, setBlock(() => $createHeadingNode('h3'))),
      new SlashOption('Quote', <Quote className="size-4" aria-hidden />, setBlock(() => $createQuoteNode())),
      new SlashOption('Bulleted list', <List className="size-4" aria-hidden />, () =>
        editor.update(() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined))
      ),
      new SlashOption('Numbered list', <ListOrdered className="size-4" aria-hidden />, () =>
        editor.update(() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined))
      ),
      new SlashOption('Text', <Pilcrow className="size-4" aria-hidden />, setBlock(() => $createParagraphNode())),
    ];

    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter((o) => o.title.toLowerCase().includes(q));
  }, [editor, query]);

  const onSelectOption = useCallback(
    (option: SlashOption, nodeToRemove: TextNode | null, closeMenu: () => void) => {
      editor.update(() => {
        nodeToRemove?.remove();
        option.run();
        closeMenu();
      });
    },
    [editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin<SlashOption>
      onQueryChange={setQuery}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) =>
        anchorElementRef.current && options.length
          ? createPortal(
              <div className="z-50 w-56 overflow-hidden rounded-popover border border-hairline bg-card p-1 shadow-adora">
                {options.map((option, i) => (
                  <button
                    type="button"
                    key={option.key}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-ink-soft transition ${
                      selectedIndex === i ? 'bg-recessed text-violet-ink' : ''
                    }`}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    onClick={() => selectOptionAndCleanUp(option)}
                  >
                    {option.icon}
                    {option.title}
                  </button>
                ))}
              </div>,
              anchorElementRef.current
            )
          : null
      }
    />
  );
}
