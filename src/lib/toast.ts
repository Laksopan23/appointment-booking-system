import { toast } from "sonner";

export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(err: unknown, fallback = "Something went wrong") {
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : fallback;

  toast.error(msg);
}
