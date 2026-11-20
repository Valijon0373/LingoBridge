"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-[#1F4E79] text-white hover:bg-[#163A5B] shadow-sm focus-visible:ring-[#1F4E79]",
    secondary:
      "bg-slate-900 text-white hover:bg-slate-800 shadow-sm focus-visible:ring-slate-900",
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus-visible:ring-[#1F4E79]",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus-visible:ring-slate-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-600",
  };

  const sizes = {
    sm: "h-9 px-3.5 text-sm rounded-lg",
    md: "h-11 px-5 text-sm rounded-lg",
    lg: "h-12 px-6 text-base rounded-xl",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
