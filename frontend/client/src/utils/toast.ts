import { toast, type ToastOptions } from "react-toastify";

const baseOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

function buildToastId(type: "success" | "error" | "info", message: string) {
  return `${type}:${message}`;
}

export function showSuccessToast(message: string, options?: ToastOptions) {
  return toast.success(message, {
    ...baseOptions,
    toastId: buildToastId("success", message),
    ...options,
  });
}

export function showErrorToast(message: string, options?: ToastOptions) {
  return toast.error(message, {
    ...baseOptions,
    toastId: buildToastId("error", message),
    ...options,
  });
}

export function showInfoToast(message: string, options?: ToastOptions) {
  return toast.info(message, {
    ...baseOptions,
    toastId: buildToastId("info", message),
    ...options,
  });
}
