import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  icon: Icon,
  suffix: Suffix,
  className = '',
  error = false,
  ...props
}, ref) => {
  return (
    <div className="relative flex items-center w-full">
      {Icon && (
        <span className="absolute left-3 text-zinc-400 dark:text-zinc-500 pointer-events-none flex items-center">
          <Icon className="w-4 h-4" />
        </span>
      )}
      <input
        ref={ref}
        className={`w-full h-9 rounded-lg text-sm bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:bg-zinc-50 dark:disabled:bg-zinc-900 ${
          Icon ? 'pl-9' : 'pl-3'
        } ${Suffix ? 'pr-9' : 'pr-3'} ${
          error
            ? 'border-red-300 dark:border-red-800/80 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-950'
            : 'border-zinc-200/90 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-100 dark:focus:ring-indigo-950/50'
        } ${className}`}
        {...props}
      />
      {Suffix && (
        <span className="absolute right-3 text-zinc-400 dark:text-zinc-500 flex items-center">
          {Suffix}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
