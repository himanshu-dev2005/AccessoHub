import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl transition-all duration-150 ${
        hover ? 'hover:border-zinc-300 dark:hover:border-zinc-700/90 hover:shadow-subtle' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', action = null }) {
  return (
    <div className={`p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-4 ${className}`}>
      <div className="space-y-0.5">{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-xs text-zinc-500 dark:text-zinc-400 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
}

export default Card;
