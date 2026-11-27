import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import SlideOver from '@/components/ui/SlideOver';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { request } from '@/request';

export function ModernLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newContactOpen, setNewContactOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'active',
  });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setFormLoading(true);
    try {
      await request.create({
        entity: 'client',
        jsonData: formData,
      });
      setNewContactOpen(false);
      setFormData({ name: '', email: '', phone: '', company: '', status: 'active' });
      // Trigger table refresh event
      window.dispatchEvent(new CustomEvent('refresh-contacts'));
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans transition-colors">
      {/* Quiet Left Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onOpenMobileNav={() => setMobileOpen(true)}
          onNewContactClick={() => setNewContactOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Quick New Contact SlideOver */}
      <SlideOver
        isOpen={newContactOpen}
        onClose={() => setNewContactOpen(false)}
        title="Add New Contact"
        subtitle="Quickly add a lead or client to your workspace"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setNewContactOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={formLoading}
              onClick={handleCreateContact}
            >
              Create Contact
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateContact} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Full Name *
            </label>
            <Input
              required
              placeholder="e.g. Elena Rostova"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Company
            </label>
            <Input
              placeholder="e.g. Acme Studio"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="elena@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Phone
            </label>
            <Input
              placeholder="+1 (555) 234-5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Status
            </label>
            <Select
              className="w-full"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'new', label: 'New Lead' },
                { value: 'premium', label: 'Premium' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

export default ModernLayout;
