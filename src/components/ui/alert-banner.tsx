"use client";

import * as React from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";

type AlertBannerProps = {
  variant: "success" | "error";
  message: string;
  onDismiss?: () => void;
  className?: string;
};

export function AlertBanner({
  variant,
  message,
  onDismiss,
  className,
}: AlertBannerProps) {
  const isSuccess = variant === "success";

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300",
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800",
        className,
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
      ) : (
        <XCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
      )}
      <p className="flex-1">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            "mt-0.5 shrink-0 rounded-md p-0.5 transition-colors",
            isSuccess ? "hover:bg-emerald-100" : "hover:bg-red-100",
          )}
          aria-label="Dismiss"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
