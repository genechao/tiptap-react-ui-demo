import React, { useState, type ElementType, type ReactNode } from 'react';
// floating-ui specific: Import necessary hooks from @floating-ui/react for positioning and interactions.
import { useFloating, useClick, useDismiss, useInteractions, offset, flip, shift } from '@floating-ui/react';
import { ChevronDown } from 'lucide-react';

interface ToolbarButtonProps {
  icon: ElementType;
  isActive?: boolean;
  onClick: () => void;
  tooltip?: string;
  disabled?: boolean;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon: Icon, isActive, onClick, tooltip, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex h-8 w-8 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:bg-[var(--color-rte-ui-muted)] disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? 'bg-[var(--color-rte-ui-accent)] ring-1 ring-inset ring-[var(--color-rte-ui-ring)]' : ''}`}
    title={tooltip}
  >
    <Icon className="h-4 w-4" />
  </button>
);

interface ToolbarDropdownOption {
  id: string;
  name: string;
  icon: ElementType;
  onClick: () => void;
}

interface ToolbarDropdownButtonProps {
  icon: ElementType;
  options: ToolbarDropdownOption[];
  tooltip?: string;
}

export const ToolbarDropdownButton: React.FC<ToolbarDropdownButtonProps> = ({ icon: Icon, options, tooltip }) => {
  const [isOpen, setIsOpen] = useState(false);

  // floating-ui specific: `useFloating` hook to manage the floating element's state and position.
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    // floating-ui specific: Middleware to enhance positioning logic.
    middleware: [
      offset(4), // Add some space between the button and the dropdown.
      flip(),    // Flip the dropdown to the opposite side if it overflows.
      shift(),   // Shift the dropdown along the axis to keep it in view.
    ],
  });

  // floating-ui specific: `useClick` hook to handle click interactions to open/close the dropdown.
  const click = useClick(context);
  // floating-ui specific: `useDismiss` hook to handle closing the dropdown when clicking outside or pressing Escape.
  const dismiss = useDismiss(context);
  // floating-ui specific: `useInteractions` hook to combine and apply interaction props to the elements.
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  // This useEffect can be used if you are not using a library like floating-ui for handling outside clicks.
  // const dropdownRef = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
  //       setIsOpen(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [dropdownRef]);

  return (
    <div>
      <button
        // floating-ui specific: `ref` for the reference element (the button).
        ref={refs.setReference}
        // floating-ui specific: Props to handle click interactions.
        {...getReferenceProps()}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:bg-[var(--color-rte-ui-muted)]"
        title={tooltip}
      >
        <Icon className="h-4 w-4" />
        <ChevronDown className="h-3 w-3 text-[var(--color-rte-ui-muted-foreground)] ml-0.5" />
      </button>
      {isOpen && (
        <div
          // floating-ui specific: `ref` for the floating element (the dropdown).
          ref={refs.setFloating}
          // floating-ui specific: Style object for positioning the dropdown.
          style={floatingStyles}
          // floating-ui specific: Props to handle dismiss interactions.
          {...getFloatingProps()}
          className="w-40 rounded-md border border-[var(--color-rte-ui-border)] bg-[var(--color-rte-ui-popover)] text-[var(--color-rte-ui-popover-foreground)] shadow-lg z-50"
        >
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm rounded-none hover:bg-[var(--color-rte-ui-muted)] focus-visible:bg-[var(--color-rte-ui-muted)] focus-visible:outline-none"
            >
              <option.icon className="h-4 w-4" />
              <span>{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface ToolbarGroupProps {
  children: ReactNode;
  hasDivider?: boolean;
}

export const ToolbarGroup: React.FC<ToolbarGroupProps> = ({ children, hasDivider }) => (
  <>
    <div className="flex items-center gap-px">
      {children}
    </div>
    {hasDivider && (
      // `flex-shrink-0` sets the `flex-shrink` CSS property to `0`, which means the item will maintain its original size (in this case, `w-px`) and will not shrink, ensuring the divider remains visible and consistent even when the container is crowded.
      <div className="h-6 w-px bg-[var(--color-rte-ui-border)] mx-1 flex-shrink-0"></div>
    )}
  </>
);

/* 
  Responsive Toolbar Implementation Options:

  1. Horizontal Scrolling:
     - This method is not used here because `overflow-x-auto` creates a new "clipping context".
     - Any child element with `position: absolute` (like our dropdown menu) is clipped by the boundaries of the scrolling container.
     - This happens because the `overflow` property establishes a new block formatting context, and the absolutely positioned dropdown is contained within this context. Its position is relative to the container, and it cannot escape the container's bounds, even with a high `z-index`.
     - A robust, pure-CSS solution is not feasible. The correct way to solve this is to either use JavaScript to calculate the dropdown's position relative to the viewport (`position: fixed`) or to use a React Portal, which renders the dropdown menu in a different part of the DOM, outside of the clipping parent.

  2. Wrapping:
     - To implement, add the `flex-wrap` class to the container div below.
     - Pros: All buttons are visible on smaller screens without scrolling.
     - Cons: The toolbar height will change, which could cause layout shifts. Dropdown menus might also be pushed off-screen on certain screen sizes, requiring careful handling of their positioning.
     - Complexity: Medium. While adding `flex-wrap` is easy, ensuring dropdowns remain visible and the UI remains stable adds complexity.

  3. "More" Menu:
     - To implement, you would need to conditionally render some buttons inside a separate dropdown based on screen size.
     - Pros: Provides the most compact and stable layout.
     - Cons: Adds complexity with state management and responsive logic.
     - Complexity: Medium to High.
  
  Floating UI:
  - Using a library like `@floating-ui/react` is a robust solution for handling dropdown positioning. It automatically handles viewport boundaries, ensuring menus don't get clipped or go off-screen.
  - This approach solves the positioning issues for both the "Horizontal Scrolling" and "Wrapping" options, as it dynamically calculates the best position for the dropdown.
  - It also simplifies the implementation of a "More" menu by handling the complex positioning logic of the dropdown.
*/

interface ToolbarProps {
  children: ReactNode;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children }) => {
  return (
    <div className="flex flex-wrap items-center gap-px border-b border-[var(--color-rte-ui-border)] p-1">
      {children}
    </div>
  );
};
