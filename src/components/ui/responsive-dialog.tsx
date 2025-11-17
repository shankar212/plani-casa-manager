import * as React from "react"
import { useMediaQuery } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
} from "@/components/ui/bottom-sheet"

interface ResponsiveDialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface ResponsiveDialogContentProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveDialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveDialogFooterProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveDialogTitleProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveDialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveDialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

export function ResponsiveDialog({ children, open, onOpenChange }: ResponsiveDialogProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  if (isMobile) {
    return (
      <BottomSheet open={open} onOpenChange={onOpenChange}>
        {children}
      </BottomSheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}

export function ResponsiveDialogTrigger({ children, asChild, className }: ResponsiveDialogTriggerProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  if (isMobile) {
    return (
      <BottomSheetTrigger asChild={asChild} className={className}>
        {children}
      </BottomSheetTrigger>
    )
  }

  return (
    <DialogTrigger asChild={asChild} className={className}>
      {children}
    </DialogTrigger>
  )
}

export function ResponsiveDialogContent({ children, className }: ResponsiveDialogContentProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  if (isMobile) {
    return (
      <BottomSheetContent className={className}>
        {children}
      </BottomSheetContent>
    )
  }

  return (
    <DialogContent className={className}>
      {children}
    </DialogContent>
  )
}

export function ResponsiveDialogHeader({ children, className }: ResponsiveDialogHeaderProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  if (isMobile) {
    return (
      <BottomSheetHeader className={className}>
        {children}
      </BottomSheetHeader>
    )
  }

  return (
    <DialogHeader className={className}>
      {children}
    </DialogHeader>
  )
}

export function ResponsiveDialogFooter({ children, className }: ResponsiveDialogFooterProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  if (isMobile) {
    return (
      <BottomSheetFooter className={className}>
        {children}
      </BottomSheetFooter>
    )
  }

  return (
    <DialogFooter className={className}>
      {children}
    </DialogFooter>
  )
}

export function ResponsiveDialogTitle({ children, className }: ResponsiveDialogTitleProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  if (isMobile) {
    return (
      <BottomSheetTitle className={className}>
        {children}
      </BottomSheetTitle>
    )
  }

  return (
    <DialogTitle className={className}>
      {children}
    </DialogTitle>
  )
}

export function ResponsiveDialogDescription({ children, className }: ResponsiveDialogDescriptionProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  if (isMobile) {
    return (
      <BottomSheetDescription className={className}>
        {children}
      </BottomSheetDescription>
    )
  }

  return (
    <DialogDescription className={className}>
      {children}
    </DialogDescription>
  )
}
