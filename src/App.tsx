import { useState, useCallback } from 'react'

import RichTextEditor from './components/RichTextEditor'

function App() {
  // State for the rich text editor's HTML content
  const [htmlContent, setHtmlContent] = useState("")

  // Memoize `handleRichTextChange` to prevent unnecessary re-renders of `RichTextEditor`.
  // This is crucial if `RichTextEditor` is a memoized component (e.g., using React.memo)
  // as it ensures the `onHtmlChange` prop maintains reference equality across renders,
  // allowing React to skip re-rendering the editor when other state in `App` changes.
  const handleRichTextChange = useCallback((newHtml: string) => {
    setHtmlContent(newHtml)
  }, [])

  return (
    <>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-6">Tiptap React UI Demo</h1>
        <RichTextEditor value={htmlContent} onChange={handleRichTextChange} debounceDelay={300} />
      </div>
    </>
  )
}

export default App
