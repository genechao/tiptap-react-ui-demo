// A simple, educational implementation of a Popover component.
// We use the Floating UI library to handle the complex logic of positioning
// the popover, ensuring it remains anchored to its trigger and intelligently
// avoids screen edges by "flipping" or "shifting" as needed. This component
// is designed to be a learning tool for understanding how popovers work.

// --- Component Overview ---

// `Popover`: The main wrapper component that provides context and state. It can be
//            controlled or uncontrolled. To control it, pass `open` and `onOpenChange`
//            props. For uncontrolled usage, you can set the initial state with `defaultOpen`.

// `PopoverTrigger`: The element that the user clicks to open the popover. It can be a
//                   default button or a custom component passed via the `asChild` prop.
//                   When using `asChild` with a custom component, ensure that the custom
//                   component forwards its ref using `React.forwardRef` to its underlying
//                   DOM element. This is crucial for correct positioning.

// `PopoverContent`: The container for the content that is displayed when the popover is open.

// `PopoverClose`: A button that dismisses the popover when clicked. It can be a default
//                 button or a custom component passed via the `asChild` prop.

// --- Example Usage ---
//
// import { Popover, PopoverTrigger, PopoverContent, PopoverClose,
// } from "@/components/ui/popover";
//
// function MyComponent() {
//   return (
//     <Popover>
//       <PopoverTrigger>Open Popover</PopoverTrigger>
//       <PopoverContent>
//         <p>This is the content of the popover.</p>
//         <PopoverClose>Close</PopoverClose>
//       </PopoverContent>
//     </Popover>
//   );
// }

import React from "react";
import { useFloating, autoUpdate, offset, flip, shift,
  useClick, useDismiss, useRole, useInteractions, useMergeRefs
} from "@floating-ui/react";

// --- Context ---
interface PopoverContextType {
  setIsOpen: (open: boolean) => void;
  refs: ReturnType<typeof useFloating>["refs"];
  floatingStyles: ReturnType<typeof useFloating>["floatingStyles"];
  getReferenceProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
  getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
  isOpen: boolean;
}

const PopoverContext = React.createContext<PopoverContextType | null>(null);

const usePopoverContext = () => {
  const context = React.useContext(PopoverContext);
  if (context === null) {
    throw new Error("Popover components must be wrapped in <Popover />");
  }
  return context;
};

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// --- Popover Component ---
const Popover = ({ 
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange: onControlledOpenChange 
}: PopoverProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  // `setIsOpen` is memoized with `useCallback` to ensure its reference remains
  // stable across renders. This is crucial because `setIsOpen` is a dependency
  // of the `value` object passed to the context provider. A stable reference
  // prevents unnecessary re-renders of context consumers.
  const setIsOpen = React.useCallback((open: boolean) => {
    if (!isControlled) {
      setInternalOpen(open);
    }
    onControlledOpenChange?.(open);
  }, [isControlled, onControlledOpenChange]);

  // --- Floating UI Hooks ---
  // `useFloating` is the core hook that provides the positioning logic.
  // - `open`: Controls the visibility of the floating element.
  // - `onOpenChange`: A callback that is called when the open state changes.
  // - `middleware`: An array of functions that modify the positioning of the
  //   floating element. `offset` adds space, `flip` prevents it from
  //   overflowing the screen by changing its placement, and `shift` moves
  //   it to stay in view.
  // - `whileElementsMounted`: A function that automatically updates the
  //   position of the floating element when the trigger or content moves.
  const { refs, floatingStyles, context: floatingContext } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip(), shift({ padding: 5 })],
    whileElementsMounted: autoUpdate,
  });

  // `useClick` handles the logic for opening and closing the popover on click.
  const click = useClick(floatingContext);
  // `useDismiss` handles the logic for closing the popover when the user
  // presses the Escape key or clicks outside of it.
  const dismiss = useDismiss(floatingContext);
  // `useRole` adds the necessary ARIA attributes for accessibility.
  const role = useRole(floatingContext);

  // `useInteractions` merges all the interaction hooks into a single set of
  // props that can be applied to the trigger and content elements.
  const { getReferenceProps, getFloatingProps } = useInteractions(
    [click, dismiss, role]
  );

  // The `value` object is memoized with `useMemo` to ensure its reference
  // remains stable across renders. This prevents unnecessary re-renders of
  // components consuming the `PopoverContext`, as they will only re-render
  // when the actual values within the context change, not just the object's
  // reference.
  const value = React.useMemo(
    () => ({
      isOpen,
      setIsOpen,
      refs,
      floatingStyles,
      getReferenceProps,
      getFloatingProps,
    }),
    [isOpen, setIsOpen, refs, floatingStyles, getReferenceProps, getFloatingProps]
  );

  return (
    <PopoverContext.Provider value={value}>
      {children}
    </PopoverContext.Provider>
  );
};
Popover.displayName = "Popover";

// --- PopoverTrigger Component ---
const PopoverTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLProps<HTMLElement> & { asChild?: boolean }
>(({ children, asChild = false, ...props }, propRef) => {
  const context = usePopoverContext();
  const isAsChild = asChild && React.isValidElement(children);

  // The `asChild` prop allows consumers to pass their own component as the
  // trigger, instead of using the default <button>. The logic below uses
  // `React.cloneElement` to create a copy of that child and inject the
  // necessary props and refs from the popover hooks, making it fully
  // functional as the trigger.

  // The `any` cast is a pragmatic choice for this demo. It allows us to
  // access the child's `ref` without knowing its specific type, which is
  // necessary for merging the refs. A production component would use a more
  // complex solution like Radix's Slot for perfect type safety.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const childRef = isAsChild ? (children as any).ref : undefined;

  // `useMergeRefs` is a utility that combines multiple refs into a single
  // callback ref. This is essential for creating reusable components that
  // can accept a ref from a parent while also maintaining their own internal
  // refs.
  const ref = useMergeRefs([context.refs.setReference, propRef, childRef]);

  // The `data-state` attribute is not required for the popover to function,
  // but it is a common convention for styling components based on their
  // state. It allows for CSS selectors like `[data-state="open"]` to apply
  // styles when the popover is open.

  if (isAsChild) {
    const childProps = (typeof children.props === 'object' && children.props !== null) ? children.props : {};

    return React.cloneElement(children, {
      ...context.getReferenceProps({ ref, ...props, ...childProps }),
      // @ts-expect-error - This is a deliberate override for the demo.
      // We are adding `data-state` for styling, which is a valid data attribute,
      // but TypeScript's default HTMLProps don't know about it on a generic child.
      "data-state": context.isOpen ? "open" : "closed",
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      data-state={context.isOpen ? "open" : "closed"}
      {...context.getReferenceProps(props)}
    >
      {children}
    </button>
  );
});
PopoverTrigger.displayName = "PopoverTrigger";


// --- PopoverContent Component ---
const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(({ className, style, ...props }, propRef) => {
  const { getFloatingProps, isOpen, refs, floatingStyles } = usePopoverContext();
  const ref = useMergeRefs([refs.setFloating, propRef]);

  // This is the core logic for showing and hiding the popover content. When
  // the `isOpen` state is false, we return `null` to unmount the content
  // from the DOM.
  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      data-state={isOpen ? "open" : "closed"}
      className={`z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none ${className || ''}`}
      style={{ ...floatingStyles, ...style }}
      {...getFloatingProps(props)}
    >
      {props.children}
    </div>
  );
});
PopoverContent.displayName = "PopoverContent";

// --- PopoverClose Component ---
const PopoverClose = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { asChild?: boolean }
>(({ children, asChild = false, ...props }, propRef) => {
  const { setIsOpen } = usePopoverContext();

  if (asChild) {
    if (React.Children.count(children) > 1 || !React.isValidElement(children)) {
      throw new Error("PopoverClose with asChild must have a single valid React element child.");
    }
    // Explicitly cast children to React.ReactElement to access its props safely
    const child = children as React.ReactElement<React.HTMLProps<HTMLElement>>;

    return React.cloneElement(child, {
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        // Call the child's original onClick handler if it exists
        if (typeof child.props.onClick === 'function') {
          child.props.onClick(event);
        }
        // Then call the PopoverClose's own logic to close the popover
        if (!event.defaultPrevented) {
          setIsOpen(false);
        }
      },
      ...props,
    });
  }

  return (
    <button type="button" ref={propRef as React.Ref<HTMLButtonElement>} {...props} onClick={() => setIsOpen(false)}>
      {children}
    </button>
  );
});
PopoverClose.displayName = "PopoverClose";

export { Popover, PopoverTrigger, PopoverContent, PopoverClose };
