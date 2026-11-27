import React, { forwardRef } from 'react';

export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  type = 'button',
  ...props
}, ref) => {
  const base = "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500",
    secondary: "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200/80 focus-visible:ring-zinc-400 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 dark:border-zinc-700",
    outline: "bg-transparent hover:bg-zinc-50 text-zinc-700 border border-zinc-300 focus-visible:ring-zinc-400 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800/60",
    ghost: "bg-transparent hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/70 focus-visible:ring-red-500 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60 dark:hover:bg-red-950/80",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5 h-8",
    md: "text-sm px-3.5 py-2 gap-2 h-9",
    lg: "text-sm px-4 py-2.5 gap-2.5 h-10",
    icon: "h-9 w-9 p-0",
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
