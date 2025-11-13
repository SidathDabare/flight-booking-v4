"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHiddenPrimitive from "@radix-ui/react-visually-hidden";
import { X, Minus, MessageCircleMore } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ChatDialog = DialogPrimitive.Root;

const ChatDialogTrigger = DialogPrimitive.Trigger;

const ChatDialogPortal = DialogPrimitive.Portal;

const ChatDialogClose = DialogPrimitive.Close;

const VisuallyHidden = VisuallyHiddenPrimitive.Root;

const ChatDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
ChatDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface ChatDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  onMinimize?: () => void;
  showMinimize?: boolean;
}

const ChatDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ChatDialogContentProps
>(({ className, children, onMinimize, showMinimize = true, ...props }, ref) => (
  <ChatDialogPortal>
    <ChatDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden",
        "w-full h-[500px] sm:w-[420px] sm:h-[520px]",
        "max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-6rem)]",
        "bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:slide-out-to-bottom-8 data-[state=open]:slide-in-from-bottom-8",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "duration-300",
        className
      )}
      {...props}
    >
      {/* Modern Header with Gradient */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 z-10 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <MessageCircleMore className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Support Chat</h3>
            <div className="text-white/80 text-xs">We&apos;re here to help</div>
          </div>
        </div>
        <div className="flex gap-1.5">
          {showMinimize && onMinimize && (
            <Button
              variant="ghost"
              onClick={onMinimize}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Minimize chat"
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only">Minimize</span>
            </Button>
          )}
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        </div>
      </div>

      {/* Content with top padding for header */}
      <div className="pt-14 flex-1 flex flex-col">{children}</div>
    </DialogPrimitive.Content>
  </ChatDialogPortal>
));
ChatDialogContent.displayName = DialogPrimitive.Content.displayName;

const ChatDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left px-6 py-4 border-b",
      className
    )}
    {...props}
  />
);
ChatDialogHeader.displayName = "ChatDialogHeader";

const ChatDialogTitle = React.forwardRef<
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
));
ChatDialogTitle.displayName = DialogPrimitive.Title.displayName;

export {
  ChatDialog,
  ChatDialogPortal,
  ChatDialogOverlay,
  ChatDialogTrigger,
  ChatDialogClose,
  ChatDialogContent,
  ChatDialogHeader,
  ChatDialogTitle,
  VisuallyHidden,
};
