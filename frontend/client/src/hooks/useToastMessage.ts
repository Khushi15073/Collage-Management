import { useEffect, useRef } from "react";
import { showErrorToast, showInfoToast, showSuccessToast } from "../utils/toast";

type ToastType = "success" | "error" | "info";

export function useToastMessage(message: string | null | undefined, type: ToastType) {
  const previousMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (!message || previousMessageRef.current === message) {
      return;
    }

    previousMessageRef.current = message;

    if (type === "success") {
      showSuccessToast(message);
      return;
    }

    if (type === "error") {
      showErrorToast(message);
      return;
    }

    showInfoToast(message);
  }, [message, type]);
}
