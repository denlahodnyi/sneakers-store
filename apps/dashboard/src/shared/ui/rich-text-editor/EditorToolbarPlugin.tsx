'use client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { $isAtNodeEnd } from '@lexical/selection';
import {
  FormatAlignCenter,
  FormatAlignJustify,
  FormatAlignLeft,
  FormatAlignRight,
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatUnderlined,
  Redo,
  Undo,
} from '@mui/icons-material';
import {
  Divider,
  IconButton,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  toggleButtonGroupClasses,
} from '@mui/material';
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  type RangeSelection,
  type TextNode,
  type ElementNode,
  $isElementNode,
  type ElementFormatType,
  type TextFormatType,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';

const LowPriority = 1;

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    margin: theme.spacing(0.5),
    border: 0,
    borderRadius: theme.shape.borderRadius,
    [`&.${toggleButtonGroupClasses.disabled}`]: {
      border: 0,
    },
  },
  [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]:
    {
      marginLeft: -1,
      borderLeft: '1px solid transparent',
    },
}));

function CustomDivider() {
  return <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />;
}

export default function EditorToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [formats, setFormats] = useState<TextFormatType[]>([]);
  const [align, setAlign] = useState<ElementFormatType>('left');

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // const node = getSelectedNode(selection);
      const node = selection.getNodes().at(-1);
      const parent = node?.getParent();
      // Update text format
      setFormats(
        [
          selection.hasFormat('bold') && 'bold',
          selection.hasFormat('italic') && 'italic',
          selection.hasFormat('underline') && 'underline',
          selection.hasFormat('strikethrough') && 'strikethrough',
        ].filter(Boolean),
      );

      const selectedAlign = $isElementNode(node)
        ? node.getFormatType()
        : parent?.getFormatType() || 'left';
      setAlign(selectedAlign);
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const handleFormatBtnClick = (
    e: React.MouseEvent<HTMLElement>,
    value: TextFormatType,
  ) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, value);
  };

  return (
    <div ref={toolbarRef} className="flex">
      <div className="flex items-center">
        <IconButton
          aria-label="Undo"
          className="toolbar-item spaced"
          disabled={!canUndo}
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
        >
          <Undo />
        </IconButton>
        <IconButton
          aria-label="Redo"
          className="toolbar-item"
          disabled={!canRedo}
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined);
          }}
        >
          <Redo />
        </IconButton>
      </div>

      <CustomDivider />

      <StyledToggleButtonGroup aria-label="text formatting">
        <ToggleButton
          aria-label="Format Bold"
          selected={formats.includes('bold')}
          value="bold"
          onClick={handleFormatBtnClick}
        >
          <FormatBold />
        </ToggleButton>
        <ToggleButton
          aria-label="Format Italics"
          selected={formats.includes('italic')}
          value="italic"
          onClick={handleFormatBtnClick}
        >
          <FormatItalic />
        </ToggleButton>
        <ToggleButton
          aria-label="Format Underline"
          selected={formats.includes('underline')}
          value="underline"
          onClick={handleFormatBtnClick}
        >
          <FormatUnderlined />
        </ToggleButton>
        <ToggleButton
          aria-label="Format Strikethrough"
          selected={formats.includes('strikethrough')}
          value="strikethrough"
          onClick={handleFormatBtnClick}
        >
          <FormatStrikethrough />
        </ToggleButton>
      </StyledToggleButtonGroup>

      <CustomDivider />

      <StyledToggleButtonGroup
        exclusive
        aria-label="element formatting"
        value={align}
        onChange={(e, value) => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value);
        }}
      >
        <ToggleButton aria-label="Left Align" value="left">
          <FormatAlignLeft />
        </ToggleButton>
        <ToggleButton aria-label="Center Align" value="center">
          <FormatAlignCenter />
        </ToggleButton>
        <ToggleButton aria-label="Right Align" value="right">
          <FormatAlignRight />
        </ToggleButton>
        <ToggleButton aria-label="Justify Align" value="justify">
          <FormatAlignJustify />
        </ToggleButton>
      </StyledToggleButtonGroup>
    </div>
  );
}

export function getSelectedNode(
  selection: RangeSelection,
): TextNode | ElementNode {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}
