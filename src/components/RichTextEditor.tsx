import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { RichTextEditorUI } from './rte/RichTextEditorUI';
import React, { useEffect, useReducer, useMemo } from 'react';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  debounceDelay?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value: htmlContent, onChange: onHtmlChange, debounceDelay = 300 }) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0); // useReducer to force re-render

  const debouncedOnHtmlChange = useDebouncedCallback(onHtmlChange, debounceDelay);

  const editor = useEditor({
    onTransaction: () => {
      forceUpdate(); // Trigger re-render on any editor transaction
    },
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["http", "https"],
          isAllowedUri: (url, ctx) => {
            return ctx.defaultValidate(url) && ctx.protocols.some(protocol => url.startsWith(protocol.toString() + '://'));
          },
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
      Image.configure({
        // inline: true, // Allows images to be inline with text
        inline: false, // Allows images to be block-level
        allowBase64: true, // IMPORTANT: Allows embedding Base64 images
      }),
    ],
    content: htmlContent, // Use HTML directly
    onUpdate: ({ editor }) => {
      debouncedOnHtmlChange(editor.getHTML());
    },
    // Fix for SSR hydration mismatch, prevents Tiptap from rendering immediately on the server
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'outline-none h-full overflow-y-auto',
      },
    },
  });

  /**
   * This `useEffect` hook is crucial for synchronizing the `htmlContent` prop with the Tiptap editor's internal state.
   * Tiptap manages its own content imperatively. When the `htmlContent` prop changes, we need to explicitly tell Tiptap
   * to update its content using `editor.commands.setContent()`.
   *
   * The conditional check (`htmlContent !== editor.getHTML()`) is vital to prevent unnecessary
   * programmatic updates to the editor. It ensures `setContent` is only called when the incoming `htmlContent` prop
   * genuinely differs from the editor's current content, optimizing performance and preventing potential cursor/selection issues.
   *
   * `emitUpdate: false` is used to prevent Tiptap's `onUpdate` callback (which calls `debouncedOnHtmlChange`) from firing
   * when the content is programmatically set. This is crucial to avoid an infinite re-render loop where `setContent`
   * triggers `onUpdate`, which updates the `htmlContent` prop, which then triggers this `useEffect` again.
   *
   * `setMeta('addToHistory', false)` is used for the initial content set to prevent it from being added to the undo history,
   * ensuring the Undo button is disabled on initialization.
   */
  useEffect(() => {
    if (editor && htmlContent !== editor.getHTML()) {
      editor.chain().focus().setMeta('addToHistory', false).setContent(htmlContent, { emitUpdate: false }).run();
    }
  }, [htmlContent, editor]);

  // By wrapping EditorContent in useMemo, we create a memoized version of the editor's content area.
  // The dependency array `[editor]` ensures that this element is only re-created if the core `editor` instance itself changes.
  // Since the `editor` instance is stable throughout the component's lifecycle, this effectively prevents the content area
  // from re-rendering when the parent `RichTextEditor` component forces an update (via `forceUpdate`) to refresh the toolbar's state.
  // This isolates the re-render to only the `RichTextEditorUI` and its children (the toolbar), providing a significant performance boost
  // by avoiding unnecessary rendering of the document itself on every keystroke or selection change.
  const editorContent = useMemo(() => (
    <EditorContent editor={editor} className="flex-1 h-full" />
  ), [editor]);

  if (!editor) {
    return null;
  }

  const handleSetLink = (url: string | null): boolean => {
    if (editor) {
      if (url) {
        return editor.chain().focus().setLink({ href: url }).run();
      } else {
        return editor.chain().focus().unsetLink().run();
      }
    }
    return false;
  };

  return (
    <RichTextEditorUI
      onToggleBold={() => editor.chain().focus().toggleBold().run()}
      isBoldActive={editor.isActive('bold')}
      onToggleItalic={() => editor.chain().focus().toggleItalic().run()}
      isItalicActive={editor.isActive('italic')}
      onToggleUnderline={() => editor.chain().focus().toggleUnderline().run()}
      isUnderlineActive={editor.isActive('underline')}
      onToggleStrike={() => editor.chain().focus().toggleStrike().run()}
      isStrikeActive={editor.isActive('strike')}
      onToggleBulletList={() => editor.chain().focus().toggleBulletList().run()}
      isBulletListActive={editor.isActive('bulletList')}
      onToggleOrderedList={() => editor.chain().focus().toggleOrderedList().run()}
      isOrderedListActive={editor.isActive('orderedList')}
      onToggleBlockquote={() => editor.chain().focus().toggleBlockquote().run()}
      isBlockquoteActive={editor.isActive('blockquote')}
      onToggleCodeBlock={() => editor.chain().focus().toggleCodeBlock().run()}
      onSetLink={handleSetLink}
      isLinkActive={editor.isActive('link')}
      currentLink={editor.getAttributes('link').href || null}
      onAddImage={(src: string) => editor.chain().focus().setImage({ src }).run()}
      isCodeBlockActive={editor.isActive('codeBlock')}
      onSetHeading={(level) => editor.chain().focus().toggleHeading({ level }).run()}
      onSetParagraph={() => editor.chain().focus().setParagraph().run()}
      onSetAlign={(textAlign) => editor.chain().focus().setTextAlign(textAlign).run()}
      onUndo={() => editor.chain().focus().undo().run()}
      onRedo={() => editor.chain().focus().redo().run()}
      canUndo={editor.can().undo()}
      canRedo={editor.can().redo()}
    >
      {/* The memoized editor content is passed here as a child */}
      {editorContent}
    </RichTextEditorUI>
  );
};

export default React.memo(RichTextEditor);
