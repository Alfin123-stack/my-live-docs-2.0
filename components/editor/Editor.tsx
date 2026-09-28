'use client';

import Theme from './plugins/Theme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { FloatingComposer, FloatingThreads, liveblocksConfig, LiveblocksPlugin, useIsEditorReady } from '@liveblocks/react-lexical'
import Loader from '../Loader';
import { DocumentCover } from '../DocumentCover';
import { coverForKey } from '@/lib/landing-assets';

import FloatingToolbarPlugin from './plugins/FloatingToolbarPlugin'
import SlashCommandPlugin from './plugins/SlashCommandPlugin'
import OutlinePlugin from './plugins/OutlinePlugin'
import ExportPlugin from './plugins/ExportPlugin'
import VersionHistoryPanel from './VersionHistoryPanel'
import TemplatePlugin from './plugins/TemplatePlugin'
import SnippetPlugin from './plugins/SnippetPlugin'
import { useThreads } from '@liveblocks/react/suspense';
import Comments from '../Comments';
import { DeleteModal } from '../DeleteModal';
import ShortcutsDialog from './ShortcutsDialog';

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.

function Placeholder() {
  const t = useTranslations('Editor');
  return <div className="editor-placeholder">{t('placeholder')}</div>;
}

export function Editor({
  roomId,
  currentUserType,
  isOwner,
  title,
}: {
  roomId: string;
  currentUserType: UserType;
  isOwner: boolean;
  title: string;
}) {
  const isEditorReady = useIsEditorReady();
  const cover = coverForKey(roomId);
  const { threads } = useThreads();
  const reduceMotion = useReducedMotion();

  const initialConfig = liveblocksConfig({
    namespace: 'Editor',
    // QuoteNode wajib terdaftar karena toolbar memakai $createQuoteNode.
    // ListNode/ListItemNode (Fase 7): bullet/numbered list dari toolbar & template dokumen —
    // Theme.ts + styles/editor.css sudah siap sejak awal, node-nya saja yang belum didaftarkan.
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
    onError: (error: Error) => {
      console.error(error);
      throw error;
    },
    theme: Theme,
    editable: currentUserType === 'editor',
  });

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container flex min-h-0 w-full flex-1 flex-col">
        {/* Stagger halus setelah Header (Fase 7): toolbar dulu, canvas dokumen menyusul —
            supaya halaman terasa "menata diri" bukan flash sekaligus. */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="toolbar-wrapper flex min-w-full items-center justify-between gap-2"
        >
          <ToolbarPlugin />
          <div className="flex shrink-0 items-center gap-2 py-1.5">
            <ExportPlugin title={title} />
            <VersionHistoryPanel />
            <OutlinePlugin />
            <ShortcutsDialog />
            {isOwner && <DeleteModal roomId={roomId} redirectOnDelete />}
          </div>
        </motion.div>

        <div className="editor-wrapper flex flex-col items-center justify-start">
          {!isEditorReady ? <Loader /> : (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 flex w-full max-w-[800px] flex-col gap-3 lg:mb-10"
            >
              {/* Sampul lukisan — sama dengan sampul kartu dokumen di dashboard. */}
              <div className="editor-cover" aria-hidden>
                <DocumentCover cover={cover} sizes="(min-width: 800px) 800px, 100vw" priority />
              </div>
              <div className="editor-inner relative h-fit min-h-[calc(100dvh-360px)] w-full sm:min-h-[1100px]">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="editor-input h-full" />
                }
                placeholder={<Placeholder />}
                ErrorBoundary={LexicalErrorBoundary}
              />
              {currentUserType === 'editor' && <FloatingToolbarPlugin />}
              {currentUserType === 'editor' && <SlashCommandPlugin />}
              {currentUserType === 'editor' && <TemplatePlugin />}
              {currentUserType === 'editor' && <SnippetPlugin roomId={roomId} />}
              <HistoryPlugin />
              <AutoFocusPlugin />
              <ListPlugin />
              </div>
            </motion.div>
          )}

          <LiveblocksPlugin>
            <FloatingComposer className="w-[min(350px,calc(100vw-24px))]" />
            <FloatingThreads threads={threads} />
            <Comments />
          </LiveblocksPlugin>
        </div>
      </div>
    </LexicalComposer>
  );
}
