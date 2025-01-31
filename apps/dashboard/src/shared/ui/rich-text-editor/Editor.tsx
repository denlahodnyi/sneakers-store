'use client';
import { type LexicalEditor, type EditorState, ParagraphNode } from 'lexical';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { HeadingNode } from '@lexical/rich-text';
import {
  LexicalComposer,
  type InitialConfigType,
} from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { Box } from '@mui/material';

import EditorToolbarPlugin from './EditorToolbarPlugin';
import editorTheme from './editorTheme';
import './styles.css';

export type Editor = LexicalEditor;

export interface EditorProps {
  initialState?: InitialConfigType['editorState'];
  onChange: (
    editorState: EditorState,
    editor: LexicalEditor,
    tags: Set<string>,
  ) => void;
}

export const parseStringifiedEditorState = (
  json: string,
  editor: LexicalEditor,
) => {
  return editor.parseEditorState(json);
};

export const stringifyEditorState = (editorState: EditorState) => {
  return JSON.stringify(editorState);
};

const onError = (error: Error) => {
  console.error(error);
};

const nodes = [ParagraphNode, HeadingNode, ListNode, ListItemNode, LinkNode];

export function Editor({ onChange, initialState }: EditorProps) {
  // FYI: Generated html styles may depend on current page styles, so the final
  // view will be different. To fix it we need to add inline style to generated html
  const initialConfig: InitialConfigType = {
    namespace: 'MyEditor',
    theme: editorTheme,
    editorState: initialState,
    nodes,
    onError,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Box
        sx={(theme) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: `${theme.shape.borderRadius}px`,
        })}
      >
        <Box
          sx={(theme) => ({
            borderBottom: `1px solid ${theme.palette.divider}`,
          })}
        >
          <EditorToolbarPlugin />
        </Box>
        <div className="relative">
          <RichTextPlugin
            ErrorBoundary={LexicalErrorBoundary}
            contentEditable={
              <ContentEditable
                aria-placeholder="Enter some text..."
                className="min-h-[100px] p-2 outline-0"
                placeholder={
                  <div className="absolute left-2 top-2 text-gray-400">
                    Enter some text...
                  </div>
                }
              />
            }
          />
        </div>
      </Box>
      <HistoryPlugin />
      <OnChangePlugin onChange={onChange} />
      <LinkPlugin />
      <ListPlugin />
      <TabIndentationPlugin />
    </LexicalComposer>
  );
}
