"use client";

import { toast as sonnerToast, type ExternalToast } from "sonner";

// Minimal toast hook compatible with existing imports. Wraps the `sonner` toast
// utility so callers can keep using `useToast().toast({...})`.
export function useToast() {
  return {
    toast: (options: ExternalToast | string) => {
      if (typeof options === "string") {
        return sonnerToast(options);
      }
      return sonnerToast(options);
    },
  };
}
