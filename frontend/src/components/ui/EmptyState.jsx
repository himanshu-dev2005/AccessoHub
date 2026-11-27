import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export function EmptyState({
  icon: Icon = Inbox,
  title = "No items found",
  description = "Get started by adding your first item or adjusting your filters.",
  actionLabel = null,
  onAction = null,
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        {title}
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
