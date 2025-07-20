import React, { type ReactNode } from 'react';
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarDropdownButton } from './Toolbar';
import { Bold, Italic, Pilcrow, List, ListOrdered, Quote, Code, Undo, Redo, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link, Image, Underline, Strikethrough } from 'lucide-react';

interface RichTextEditorUIFeatures {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  headings?: boolean;
  paragraph?: boolean;
  bulletList?: boolean;
  orderedList?: boolean;
  blockquote?: boolean;
  codeBlock?: boolean;
  link?: boolean;
  image?: boolean;
  alignment?: boolean;
  undoRedo?: boolean;
}

interface RichTextEditorUIProps {
  children: ReactNode;
  onToggleBold: () => void;
  isBoldActive: boolean;
  onToggleItalic: () => void;
  isItalicActive: boolean;
  onToggleUnderline: () => void;
  isUnderlineActive: boolean;
  onToggleStrike: () => void;
  isStrikeActive: boolean;
  onToggleBulletList: () => void;
  isBulletListActive: boolean;
  onToggleOrderedList: () => void;
  isOrderedListActive: boolean;
  onToggleBlockquote: () => void;
  isBlockquoteActive: boolean;
  onToggleCodeBlock: () => void;
  isCodeBlockActive: boolean;
  onSetHeading: (level: 1 | 2 | 3 | 4 | 5 | 6) => void;
  onSetParagraph: () => void;
  onSetAlign: (textAlign: 'left' | 'center' | 'right' | 'justify') => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  features?: RichTextEditorUIFeatures;
}

export const RichTextEditorUI: React.FC<RichTextEditorUIProps> = ({
  children,
  onToggleBold,
  isBoldActive,
  onToggleItalic,
  isItalicActive,
  onToggleUnderline,
  isUnderlineActive,
  onToggleStrike,
  isStrikeActive,
  onToggleBulletList,
  isBulletListActive,
  onToggleOrderedList,
  isOrderedListActive,
  onToggleBlockquote,
  isBlockquoteActive,
  onToggleCodeBlock,
  isCodeBlockActive,
  onSetHeading,
  onSetParagraph,
  onSetAlign,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  features,
}) => {
  const defaultFeatures: RichTextEditorUIFeatures = {
    bold: true,
    italic: true,
    strikethrough: true,
    underline: true,
    headings: true,
    paragraph: true,
    bulletList: true,
    orderedList: true,
    blockquote: true,
    codeBlock: true,
    link: true,
    image: true,
    alignment: true,
    undoRedo: true,
  };

  const mergedFeatures = { ...defaultFeatures, ...features };

  return (
    <div className="rounded-md border border-[var(--color-rte-ui-border)] bg-[var(--color-rte-ui-background)] text-[var(--color-rte-ui-foreground)] flex flex-col h-full">
      <Toolbar>
        {(mergedFeatures.bold || mergedFeatures.italic || mergedFeatures.underline || mergedFeatures.strikethrough) && (
          <ToolbarGroup hasDivider>
            {mergedFeatures.bold && (
              <ToolbarButton
                icon={Bold}
                isActive={isBoldActive}
                onClick={onToggleBold}
                tooltip="Bold"
              />
            )}
            {mergedFeatures.italic && (
              <ToolbarButton
                icon={Italic}
                isActive={isItalicActive}
                onClick={onToggleItalic}
                tooltip="Italic"
              />
            )}
            {mergedFeatures.underline && (
              <ToolbarButton
                icon={Underline}
                isActive={isUnderlineActive}
                onClick={onToggleUnderline}
                tooltip="Underline"
              />
            )}
            {mergedFeatures.strikethrough && (
              <ToolbarButton
                icon={Strikethrough}
                isActive={isStrikeActive}
                onClick={onToggleStrike}
                tooltip="Strikethrough"
              />
            )}
          </ToolbarGroup>
        )}

        {(mergedFeatures.headings || mergedFeatures.paragraph || mergedFeatures.bulletList || mergedFeatures.orderedList || mergedFeatures.blockquote || mergedFeatures.codeBlock) && (
          <ToolbarGroup hasDivider>
            {mergedFeatures.headings && (
              <ToolbarDropdownButton
                icon={Pilcrow}
                options={[
                  { id: 'paragraph', name: 'Paragraph', icon: Pilcrow, onClick: onSetParagraph },
                  { id: 'heading1', name: 'Heading 1', icon: Heading1, onClick: () => onSetHeading(1) },
                  { id: 'heading2', name: 'Heading 2', icon: Heading2, onClick: () => onSetHeading(2) },
                  { id: 'heading3', name: 'Heading 3', icon: Heading3, onClick: () => onSetHeading(3) },
                  { id: 'heading4', name: 'Heading 4', icon: Heading4, onClick: () => onSetHeading(4) },
                  { id: 'heading5', name: 'Heading 5', icon: Heading5, onClick: () => onSetHeading(5) },
                  { id: 'heading6', name: 'Heading 6', icon: Heading6, onClick: () => onSetHeading(6) },
                ]}
                tooltip="Headings"
              />
            )}
            {mergedFeatures.bulletList && (
              <ToolbarButton
                icon={List}
                isActive={isBulletListActive}
                onClick={onToggleBulletList}
                tooltip="Bullet List"
              />
            )}
            {mergedFeatures.orderedList && (
              <ToolbarButton
                icon={ListOrdered}
                isActive={isOrderedListActive}
                onClick={onToggleOrderedList}
                tooltip="Numbered List"
              />
            )}
            {mergedFeatures.blockquote && (
              <ToolbarButton
                icon={Quote}
                isActive={isBlockquoteActive}
                onClick={onToggleBlockquote}
                tooltip="Blockquote"
              />
            )}
            {mergedFeatures.codeBlock && (
              <ToolbarButton
                icon={Code}
                isActive={isCodeBlockActive}
                onClick={onToggleCodeBlock}
                tooltip="Code Block"
              />
            )}
          </ToolbarGroup>
        )}

        {(mergedFeatures.link || mergedFeatures.image) && (
          <ToolbarGroup hasDivider>
            {mergedFeatures.link && (
              <ToolbarButton
                icon={Link}
                onClick={() => console.log("Link clicked")}
                tooltip="Link"
              />
            )}
            {mergedFeatures.image && (
              <ToolbarButton
                icon={Image}
                onClick={() => console.log("Image clicked")}
                tooltip="Image"
              />
            )}
          </ToolbarGroup>
        )}

        {mergedFeatures.alignment && (
          <ToolbarGroup hasDivider>
            <ToolbarDropdownButton
              icon={AlignLeft}
              options={[
                { id: 'left', name: 'Align Left', icon: AlignLeft, onClick: () => onSetAlign('left') },
                { id: 'center', name: 'Align Center', icon: AlignCenter, onClick: () => onSetAlign('center') },
                { id: 'right', name: 'Align Right', icon: AlignRight, onClick: () => onSetAlign('right') },
                { id: 'justify', name: 'Justify', icon: AlignJustify, onClick: () => onSetAlign('justify') },
              ]}
              tooltip="Align"
            />
          </ToolbarGroup>
        )}

        {mergedFeatures.undoRedo && (
          <ToolbarGroup>
            <ToolbarButton
              icon={Undo}
              onClick={onUndo}
              tooltip="Undo"
              disabled={!canUndo}
            />
            <ToolbarButton
              icon={Redo}
              onClick={onRedo}
              tooltip="Redo"
              disabled={!canRedo}
            />
          </ToolbarGroup>
        )}
      </Toolbar>
      <div className="p-4 prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 h-[300px]">
        {children}
      </div>
    </div>
  );
};
