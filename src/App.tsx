import { useState, useCallback } from 'react'
import RichTextEditor from './components/RichTextEditor'
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover'

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

  // State for the message after clicking Copy HTML to Clipboard
  const [copied, setCopied] = useState(false)
  // State to control the popover's open/closed state
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // Copy HTML to Clipboard click handler
  const handleCopyClick = () => {
    // Copy HTML content to clipboard
    navigator.clipboard.writeText(htmlContent)
      .then(() => {
        setCopied(true) // Show "Copied!" message
        setIsPopoverOpen(true) // Open the popover

        setTimeout(() => {
          setCopied(false) // Hide "Copied!" message
          setIsPopoverOpen(false) // Close the popover
        }, 2000) // Display for 2 seconds
      })
      .catch(err => alert('Failed to copy: ' + err))
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-6">Tiptap React UI Demo</h1>
      <RichTextEditor value={htmlContent} onChange={handleRichTextChange} debounceDelay={300} />

      <div className="mt-4 flex items-center space-x-2">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              onClick={handleCopyClick}
              className="rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/90 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-foreground text-background hover:bg-foreground/90 h-10 px-4 py-2"
            >
              Copy HTML to Clipboard
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-fit">
            <div className={`text-sm text-green-600 ${copied ? 'opacity-100' : 'opacity-0'}`}>Copied!</div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default App
