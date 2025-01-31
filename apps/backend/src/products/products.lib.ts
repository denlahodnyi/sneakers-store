import { ParagraphNode } from 'lexical';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { HeadingNode } from '@lexical/rich-text';
import { createHeadlessEditor } from '@lexical/headless';
import { $generateHtmlFromNodes } from '@lexical/html';
import { JSDOM } from 'jsdom';

function setupDom() {
  const dom = new JSDOM();

  const _window = global.window;
  const _document = global.document;

  global.window = dom.window as unknown as typeof _window;
  global.document = dom.window.document;

  return () => {
    global.window = _window;
    global.document = _document;
  };
}

const nodes = [ParagraphNode, HeadingNode, ListNode, ListItemNode, LinkNode];

export function productDescrToHtml(editorStringifiedState: string) {
  const cleanup = setupDom();
  const editor = createHeadlessEditor({
    nodes,
    onError: () => undefined,
  });
  editor.setEditorState(editor.parseEditorState(editorStringifiedState));
  const htmlString = editor.read(() => {
    return $generateHtmlFromNodes(editor, null);
  });
  cleanup();
  return htmlString;
}
