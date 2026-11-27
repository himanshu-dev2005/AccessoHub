import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(({
  options = [],
  className = '',
  icon: Icon,
  value,
  onChange,
  ...props
}, ref) => {
  return (
    <div className="relative inline-flex items-center">
      {Icon && (
        <span className="absolute left-3 text-zinc-400 pointer-events-none">
          <Icon className="w-3.5 h-3.5" />
        </span>
      )}
      <select
        ref={ref}
        value={value}
        onChange={onChange}
        className={`h-9 appearance-none text-xs sm:text-sm font-medium rounded-lg bg-white dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-200 border border-zinc-200/90 dark:border-zinc-800 transition-all duration-150 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-500 ${
          Icon ? 'pl-8' : 'pl-3'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 text-zinc-400 pointer-events-none" />
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
