/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $isRootOrShadowRoot,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from '@lexical/rich-text';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { $findMatchingParent } from '@lexical/utils';
import React from 'react';
import { useTranslations } from 'next-intl';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

export default function ToolbarPlugin() {
  const t = useTranslations('Editor');
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const activeBlock = useActiveBlock();

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, $updateToolbar]);

  function toggleBlock(type: 'h1' | 'h2' | 'h3' | 'quote') {
    const selection = $getSelection();

    if (activeBlock === type) {
      return $setBlocksType(selection, () => $createParagraphNode());
    }

    if (type === 'h1') {
      return $setBlocksType(selection, () => $createHeadingNode('h1'));
    }

    if (type === 'h2') {
      return $setBlocksType(selection, () => $createHeadingNode('h2'));
    }

    if (type === 'h3') {
      return $setBlocksType(selection, () => $createHeadingNode('h3'));
    }

    if (type === 'quote') {
      return $setBlocksType(selection, () => $createQuoteNode());
    }
  }

  // List (Fase 7): terpisah dari toggleBlock() di atas karena
  // INSERT_*_LIST_COMMAND/REMOVE_LIST_COMMAND memicu siklus update-nya sendiri —
  // tidak aman dipanggil di dalam editor.update() seperti $setBlocksType.
  function toggleList(type: 'bullet' | 'number') {
    if (activeBlock === type) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      return;
    }
    editor.dispatchCommand(
      type === 'bullet' ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
      undefined,
    );
  }

  return (
    <div className="toolbar" ref={toolbarRef} role="toolbar" aria-label={t('toolbarLabel')}>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label={t('toolbarUndo')}
      >
        <i className="format undo" />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label={t('toolbarRedo')}
      >
        <i className="format redo" />
      </button>
      <Divider />
      <button
        onClick={() => editor.update(() => toggleBlock('h1'))}
        data-active={activeBlock === 'h1' ? '' : undefined}
        aria-label={t('toolbarH1')}
        aria-pressed={activeBlock === 'h1'}
        className={
          'toolbar-item spaced ' + (activeBlock === 'h1' ? 'active' : '')
        }
      >
        <i className="format h1" />
      </button>
      <button
        onClick={() => editor.update(() => toggleBlock('h2'))}
        data-active={activeBlock === 'h2' ? '' : undefined}
        aria-label={t('toolbarH2')}
        aria-pressed={activeBlock === 'h2'}
        className={
          'toolbar-item spaced ' + (activeBlock === 'h2' ? 'active' : '')
        }
      >
        <i className="format h2" />
      </button>
      <button
        onClick={() => editor.update(() => toggleBlock('h3'))}
        data-active={activeBlock === 'h3' ? '' : undefined}
        aria-label={t('toolbarH3')}
        aria-pressed={activeBlock === 'h3'}
        className={
          'toolbar-item spaced ' + (activeBlock === 'h3' ? 'active' : '')
        }
      >
        <i className="format h3" />
      </button>
      <Divider />
      <button
        onClick={() => toggleList('bullet')}
        data-active={activeBlock === 'bullet' ? '' : undefined}
        aria-label={t('toolbarBulletList')}
        aria-pressed={activeBlock === 'bullet'}
        className={
          'toolbar-item spaced ' + (activeBlock === 'bullet' ? 'active' : '')
        }
      >
        <i className="format bullet-list" />
      </button>
      <button
        onClick={() => toggleList('number')}
        data-active={activeBlock === 'number' ? '' : undefined}
        aria-label={t('toolbarNumberedList')}
        aria-pressed={activeBlock === 'number'}
        className={
          'toolbar-item spaced ' + (activeBlock === 'number' ? 'active' : '')
        }
      >
        <i className="format number-list" />
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        className={'toolbar-item spaced ' + (isBold ? 'active' : '')}
        aria-label={t('toolbarBold')}
        aria-pressed={isBold}
      >
        <i className="format bold" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        className={'toolbar-item spaced ' + (isItalic ? 'active' : '')}
        aria-label={t('toolbarItalic')}
        aria-pressed={isItalic}
      >
        <i className="format italic" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
        className={'toolbar-item spaced ' + (isUnderline ? 'active' : '')}
        aria-label={t('toolbarUnderline')}
        aria-pressed={isUnderline}
      >
        <i className="format underline" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        }}
        className={'toolbar-item spaced ' + (isStrikethrough ? 'active' : '')}
        aria-label={t('toolbarStrike')}
        aria-pressed={isStrikethrough}
      >
        <i className="format strikethrough" />
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        }}
        className="toolbar-item spaced"
        aria-label={t('toolbarAlignLeft')}
      >
        <i className="format left-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
        }}
        className="toolbar-item spaced"
        aria-label={t('toolbarAlignCenter')}
      >
        <i className="format center-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
        }}
        className="toolbar-item spaced"
        aria-label={t('toolbarAlignRight')}
      >
        <i className="format right-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
        }}
        className="toolbar-item"
        aria-label={t('toolbarAlignJustify')}
      >
        <i className="format justify-align" />
      </button>{' '}
    </div>
  );
}

function useActiveBlock() {
  const [editor] = useLexicalComposerContext();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return editor.registerUpdateListener(onStoreChange);
    },
    [editor],
  );

  const getSnapshot = useCallback(() => {
    return editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return null;

      const anchor = selection.anchor.getNode();
      let element =
        anchor.getKey() === 'root'
          ? anchor
          : $findMatchingParent(anchor, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchor.getTopLevelElementOrThrow();
      }

      if ($isHeadingNode(element)) {
        return element.getTag();
      }

      if ($isListNode(element)) {
        return element.getListType();
      }

      return element.getType();
    });
  }, [editor]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
