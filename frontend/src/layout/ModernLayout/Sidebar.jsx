import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  BarChart3,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  Mail,
  FileSpreadsheet,
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import storePersist from '@/redux/storePersist';

export function Sidebar({ collapsed, setCollapsed, isMobile, mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const auth = storePersist.get('auth');
  const user = auth?.current || { name: 'Admin', email: 'admin@accessohub.com' };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Contacts', path: '/customer', icon: Users },
    { label: 'Deals & Invoices', path: '/invoice', icon: Briefcase },
    { label: 'Tasks', path: '/task', icon: CheckSquare },
    { label: 'Reports & Insights', path: '/ai/insights', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const aiItems = [
    { label: 'AI Email Drafter', path: '/ai/email', icon: Mail },
    { label: 'Smart Invoice', path: '/ai/invoice', icon: FileSpreadsheet },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const content = (
    <div className="flex flex-col h-full justify-between bg-white dark:bg-[#101014] border-r border-zinc-200/80 dark:border-zinc-800/80 select-none">
      {/* Workspace Branding */}
      <div>
        <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-bold text-xs tracking-tighter shrink-0 shadow-sm">
              AH
            </div>
            {(!collapsed || isMobile) && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate tracking-tight">
                  AccessoHub
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                  <Building2 className="w-2.5 h-2.5" /> Workspace
                </span>
              </div>
            )}
          </Link>

          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Primary Navigation */}
        <div className="p-2 space-y-6">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => isMobile && setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    active
                      ? 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-white font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-850/50'
                  }`}
                  title={collapsed && !isMobile ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
                  {(!collapsed || isMobile) && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* AI Tools Section */}
          <div className="space-y-1">
            {(!collapsed || isMobile) && (
              <div className="px-2.5 text-[10px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                AI Assistant
              </div>
            )}
            <div className="space-y-0.5">
              {aiItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => isMobile && setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-white font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-850/50'
                    }`}
                    title={collapsed && !isMobile ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
                    {(!collapsed || isMobile) && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={user.name || 'Admin'} size="sm" />
            {(!collapsed || isMobile) && (
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate leading-tight">
                  {user.name || 'Admin'}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                  {user.email || 'admin@accessohub.com'}
                </span>
              </div>
            )}
          </div>
          {(!collapsed || isMobile) && (
            <Link
              to="/logout"
              className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  // Mobile Drawer
  if (isMobile) {
    if (!mobileOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        <div
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div className="relative w-64 max-w-[80vw] h-full shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  // Desktop Sider
  return (
    <aside
      className={`sticky top-0 h-screen transition-all duration-200 ease-in-out shrink-0 z-20 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {content}
    </aside>
  );
}

export default Sidebar;
