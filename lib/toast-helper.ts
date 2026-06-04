import { toast as sonnerToast } from "sonner"

type ToastOpts = {
  description?: string
}

export const toast = {
  success: (title: string, opts?: ToastOpts) =>
    sonnerToast.success(title, {
      description: opts?.description,
      className: "toast-success",
    }),

  error: (title: string, opts?: ToastOpts) =>
    sonnerToast.error(title, {
      description: opts?.description,
    }),

  info: (title: string, opts?: ToastOpts) =>
    sonnerToast.info(title, {
      description: opts?.description,
    }),

  warning: (title: string, opts?: ToastOpts) =>
    sonnerToast.warning(title, {
      description: opts?.description,
      className: "toast-warning",
    }),
}