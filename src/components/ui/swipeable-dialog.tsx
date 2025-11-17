import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSwipeToClose } from "@/hooks/useSwipeToClose"

const SwipeableDialog = DialogPrimitive.Root

const SwipeableDialogTrigger = DialogPrimitive.Trigger

const SwipeableDialogPortal = DialogPrimitive.Portal

const SwipeableDialogClose = DialogPrimitive.Close

const SwipeableDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
SwipeableDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface SwipeableDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  onOpenChange?: (open: boolean) => void;
}

const SwipeableDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SwipeableDialogContentProps
>(({ className, children, onOpenChange, ...props }, ref) => {
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { swipeProps, translateY, isDragging } = useSwipeToClose({
    onClose: () => onOpenChange?.(false),
    threshold: 100,
    enabled: isMobile,
  });

  const opacity = isMobile && translateY > 0 ? Math.max(0, 1 - translateY / 300) : 1;

  return (
    <SwipeableDialogPortal>
      <SwipeableDialogOverlay style={{ opacity }} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          isMobile && "touch-none",
          className
        )}
        {...props}
        {...(isMobile ? swipeProps : {})}
      >
        {isMobile && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-muted-foreground/30 rounded-full" />
        )}
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SwipeableDialogPortal>
  )
})
SwipeableDialogContent.displayName = DialogPrimitive.Content.displayName

const SwipeableDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SwipeableDialogHeader.displayName = "SwipeableDialogHeader"

const SwipeableDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SwipeableDialogFooter.displayName = "SwipeableDialogFooter"

const SwipeableDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
SwipeableDialogTitle.displayName = DialogPrimitive.Title.displayName

const SwipeableDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SwipeableDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  SwipeableDialog,
  SwipeableDialogPortal,
  SwipeableDialogOverlay,
  SwipeableDialogClose,
  SwipeableDialogTrigger,
  SwipeableDialogContent,
  SwipeableDialogHeader,
  SwipeableDialogFooter,
  SwipeableDialogTitle,
  SwipeableDialogDescription,
}
