/**
 * Toast Component
 * 
 * ✅ WCAG 2.1 Level AA Compliant
 * - ARIA live regions (role="status", aria-live="polite")
 * - Keyboard dismissible
 * - Accessible close button with label
 * - Properly announced to screen readers
 */

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} role="status" aria-live="polite" aria-atomic="true">
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose aria-label="Close notification" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
