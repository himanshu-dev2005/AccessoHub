import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-zinc-200/70 dark:bg-zinc-800/60 rounded-md ${className}`}
    />
  );
}

export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export default Skeleton;
