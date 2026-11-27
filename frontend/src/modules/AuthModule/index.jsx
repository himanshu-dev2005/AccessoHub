import React from 'react';
import useLanguage from '@/locale/useLanguage';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Building2, Sparkles } from 'lucide-react';

export default function AuthModule({ authContent, AUTH_TITLE = 'Sign in' }) {
  const translate = useLanguage();

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans p-4 sm:p-6 transition-colors select-none">
      {/* Top Bar with Logo & Theme Toggle */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-bold text-xs tracking-tighter shadow-sm">
            AH
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            AccessoHub
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Centered Minimal Notion/Linear Card */}
      <main className="w-full max-w-sm sm:max-w-md mx-auto my-auto py-8">
        <div className="bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-6 sm:p-8 shadow-card dark:shadow-card-dark transition-all">
          {/* Header */}
          <div className="space-y-1.5 mb-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50 mb-2">
              <Sparkles className="w-3 h-3" />
              Workspace Login
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {translate(AUTH_TITLE)}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Enter your credentials to access your CRM workspace
            </p>
          </div>

          {/* Form container */}
          <div className="space-y-4">
            {authContent}
          </div>

          {/* Quick Demo Helper Hint */}
          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Default Admin: <code className="font-mono text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">admin@accessohub.com</code> / <code className="font-mono text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">admin123</code>
            </p>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full max-w-5xl mx-auto py-4 text-center text-xs text-zinc-400 dark:text-zinc-600">
        AccessoHub CRM • Modern Revenue & Account Workspace
      </footer>
    </div>
  );
}
