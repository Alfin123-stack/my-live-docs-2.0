'use client';

import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';

import { updateSnippet } from '@/lib/actions/room.actions';

const SAVE_DEBOUNCE_MS = 5000;
const SNIPPET_LENGTH = 140;

/**
 * Menyimpan cuplikan singkat isi dokumen ke metadata room (Fase 3 #13), di-debounce 5
 * detik dan hanya dikirim kalau teksnya benar-benar berubah — supaya tidak memanggil
 * Server Action di setiap ketikan.
 */
export default function SnippetPlugin({ roomId }: { roomId: string }) {
  const [editor] = useLexicalComposerContext();
  const lastSavedRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const text = $getRoot().getTextContent().trim().replace(/\s+/g, ' ').slice(0, SNIPPET_LENGTH);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (text === lastSavedRef.current) return;
          lastSavedRef.current = text;
          // Silent by design — autosave latar belakang, kegagalan tidak perlu mengganggu user.
          updateSnippet({ roomId, snippet: text }).catch(() => {});
        }, SAVE_DEBOUNCE_MS);
      });
    });
  }, [editor, roomId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
