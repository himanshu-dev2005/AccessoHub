import React from 'react';

const COLORS = [
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300',
];

export function Avatar({
  name = '',
  src = null,
  size = 'md',
  status = null,
  className = '',
}) {
  const getInitials = (n) => {
    if (!n) return '?';
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
    return hash % COLORS.length;
  };

  const sizeMap = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base font-semibold',
  };

  const statusMap = {
    online: 'bg-emerald-500',
    busy: 'bg-amber-500',
    offline: 'bg-zinc-400',
  };

  const colorClass = COLORS[hashString(name || 'A')];

  return (
    <div className={`relative inline-flex shrink-0 select-none ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeMap[size]} rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-800`}
        />
      ) : (
        <div
          className={`${sizeMap[size]} rounded-full font-medium flex items-center justify-center tracking-tight ring-1 ring-zinc-200/60 dark:ring-zinc-800/80 ${colorClass}`}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900 ${statusMap[status] || statusMap.online}`}
        />
      )}
    </div>
  );
}

export default Avatar;
