import React, { type ReactNode, useState, useEffect, useRef } from 'react';
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarDropdownButton } from './Toolbar';
import { Bold, Italic, Pilcrow, List, ListOrdered, Quote, Code, Undo, Redo, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link, Image, Underline, Strikethrough } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from '../ui/popover';

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
  onSetLink: (url: string | null) => boolean;
  isLinkActive: boolean;
  currentLink: string | null;
  onAddImage: (src: string) => boolean;
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
  onSetLink,
  isLinkActive,
  currentLink,
  onAddImage,
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
  const [linkInput, setLinkInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input

  // This useEffect synchronizes the internal `linkInput` state with the `currentLink` prop.
  // It's crucial for ensuring that when the popover opens, the input field correctly
  // displays the currently active link from the editor. This is a common pattern for
  // initializing internal component state from props, especially for uncontrolled components.
  // Note: If the `currentLink` prop changes while the user is actively typing in the input,
  // their input will be overwritten. This is an accepted trade-off for this demo's simplicity.
  useEffect(() => {
    setLinkInput(currentLink || '');
  }, [currentLink]);

  // Handler for the hidden file input change event
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): boolean => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const success = onAddImage(reader.result as string); // Pass Base64 string to parent handler
        if (!success) {
          console.error("Failed to add image to editor.");
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file); // Read the file as a Base64 Data URL
      return true; // Indicate that file reading has started
    }
    return false; // Indicate no file was selected or processed
  };

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
              <Popover>
                <PopoverTrigger asChild>
                  <ToolbarButton
                    icon={Link}
                    isActive={isLinkActive}
                    onClick={() => { /* PopoverTrigger handles click */ }}
                    tooltip="Link"
                  />
                </PopoverTrigger>
                <PopoverContent className="p-2 w-fit">
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      placeholder="Enter URL"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      className="h-9 w-32 sm:w-96 md:w-128 lg:w-160 rounded-md border border-[var(--color-rte-ui-input)] bg-[var(--color-rte-ui-background)] px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-rte-ui-muted-foreground)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-rte-ui-ring)] disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <PopoverClose asChild>
                      <button
                        onClick={(e) => {
                          const success = onSetLink(linkInput);
                          if (!success) {
                            e.preventDefault(); // Prevent PopoverClose from closing
                          }
                        }}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-rte-ui-ring)] disabled:pointer-events-none disabled:opacity-50 bg-[var(--color-rte-ui-primary)] text-[var(--color-rte-ui-primary-foreground)] shadow hover:bg-[var(--color-rte-ui-primary)]/90 h-9 px-4 py-2"
                      >
                        Set
                      </button>
                    </PopoverClose>
                    {isLinkActive && (
                      <PopoverClose asChild>
                        <button
                          onClick={() => onSetLink(null)}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-rte-ui-ring)] disabled:pointer-events-none disabled:opacity-50 border border-[var(--color-rte-ui-input)] bg-[var(--color-rte-ui-background)] shadow-sm hover:bg-[var(--color-rte-ui-accent)] hover:text-[var(--color-rte-ui-accent-foreground)] h-9 px-4 py-2"
                        >
                          Unlink
                        </button>
                      </PopoverClose>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
            {mergedFeatures.image && (
              <ToolbarButton
                icon={Image}
                onClick={() => fileInputRef.current?.click()} // Trigger click on hidden input
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
                { id: 'justify', name: 'Align Justify', icon: AlignJustify, onClick: () => onSetAlign('justify') },
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
      {/* Hidden file input for image upload */}
      <input
        type="file"
        accept="image/*" // Accept only image files
        onChange={handleImageUpload}
        ref={fileInputRef}
        style={{ display: 'none' }} // Hide the input visually
      />
      <div className="p-4 prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 h-[300px]">
        {children}
      </div>
    </div>
  );
};
