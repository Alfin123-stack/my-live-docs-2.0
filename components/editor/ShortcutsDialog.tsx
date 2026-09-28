'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Keyboard } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SHORTCUTS: Array<{ keys: string; labelKey: string }> = [
  { keys: 'Ctrl/Cmd + B', labelKey: 'shortcutBold' },
  { keys: 'Ctrl/Cmd + I', labelKey: 'shortcutItalic' },
  { keys: 'Ctrl/Cmd + U', labelKey: 'shortcutUnderline' },
  { keys: 'Ctrl/Cmd + Z', labelKey: 'shortcutUndo' },
  { keys: 'Ctrl/Cmd + Shift + Z', labelKey: 'shortcutRedo' },
  { keys: '/', labelKey: 'shortcutSlash' },
  { keys: '?', labelKey: 'shortcutHelp' },
];

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
}

export default function ShortcutsDialog() {
  const t = useTranslations('Editor');
  const [open, setOpen] = useState(false);

  // "?" membuka overlay, TAPI hanya kalau fokus sedang tidak di area mengetik
  // (input, textarea, atau contenteditable) — supaya tidak mengganggu user yang
  // sedang menulis "?" di dalam dokumen.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !isTypingTarget(e.target) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('shortcutsTitle')}
        title={t('shortcutsHint')}
        className="icon-btn"
      >
        <Keyboard className="size-4" aria-hidden />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('shortcutsTitle')}</DialogTitle>
          </DialogHeader>
          <ul className="mt-2 space-y-2">
            {SHORTCUTS.map((s) => (
              <li key={s.keys} className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">{t(s.labelKey)}</span>
                <kbd className="rounded border border-hairline bg-recessed px-2 py-0.5 font-mono text-xs text-muted">
                  {s.keys}
                </kbd>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
