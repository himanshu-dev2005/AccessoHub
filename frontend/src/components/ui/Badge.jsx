import React from 'react';

const VARIANTS = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
  amber: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50",
  red: "bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50",
  blue: "bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/50",
  purple: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/50",
  neutral: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
};

const DOT_COLORS = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  blue: "bg-indigo-500",
  purple: "bg-purple-500",
  neutral: "bg-zinc-400",
};

export function Badge({
  children,
  variant = 'neutral',
  dot = false,
  size = 'md',
  className = '',
}) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  const colorClass = VARIANTS[variant] || VARIANTS.neutral;
  const dotColor = DOT_COLORS[variant] || DOT_COLORS.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border tracking-wide select-none ${sizeClasses} ${colorClass} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {children}
    </span>
  );
}

export default Badge;
