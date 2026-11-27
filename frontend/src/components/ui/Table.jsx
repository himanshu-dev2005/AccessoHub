import React from 'react';

export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full text-left border-collapse text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <thead className={`sticky top-0 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-sm z-10 border-b border-zinc-200/80 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 select-none ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }) {
  return (
    <tbody className={`divide-y divide-zinc-100 dark:divide-zinc-800/60 ${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '', onClick = null, selected = false }) {
  return (
    <tr
      onClick={onClick}
      className={`group transition-colors duration-100 ${
        selected
          ? 'bg-indigo-50/60 dark:bg-indigo-950/30'
          : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '', align = 'left' }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <td className={`px-4 py-3 text-zinc-700 dark:text-zinc-300 align-middle ${alignClass} ${className}`}>
      {children}
    </td>
  );
}

export function TableHeader({ children, className = '', align = 'left' }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th className={`px-4 py-3 font-semibold align-middle ${alignClass} ${className}`}>
      {children}
    </th>
  );
}

export default Table;
