import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  MoreHorizontal,
  Mail,
  Phone,
  Building,
  Calendar,
  Trash2,
  Tag,
  UserCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
} from 'lucide-react';
import Table, { TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import SlideOver from '@/components/ui/SlideOver';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton, { TableRowSkeleton } from '@/components/ui/Skeleton';
import { request } from '@/request';

// Default mock data to guarantee immediate presentation even before backend data is populated
const SAMPLE_CONTACTS = [
  {
    _id: 'sample-1',
    name: 'Elena Rostova',
    email: 'elena@solardynamics.io',
    phone: '+1 (555) 349-8201',
    company: 'Solar Dynamics',
    status: 'active',
    owner: 'Alex Morgan',
    category: 'wholesale',
    created: '2026-11-20T10:00:00Z',
    notes: 'Key decision maker for enterprise renewable rollout.',
  },
  {
    _id: 'sample-2',
    name: 'Marcus Vance',
    email: 'marcus@vertexflow.com',
    phone: '+1 (555) 781-4432',
    company: 'Vertex Flow',
    status: 'new',
    owner: 'Sarah Chen',
    category: 'retail',
    created: '2026-11-25T14:30:00Z',
    notes: 'Requested product catalog and quote for Q1.',
  },
  {
    _id: 'sample-3',
    name: 'Kiran Patel',
    email: 'kiran@apexretail.in',
    phone: '+91 98250 11223',
    company: 'Apex Retail India',
    status: 'premium',
    owner: 'You',
    category: 'wholesale',
    created: '2026-11-12T09:15:00Z',
    notes: 'Premium account holder with multi-branch distribution.',
  },
  {
    _id: 'sample-4',
    name: 'Sophia Laurent',
    email: 'sophia@lumina.design',
    phone: '+33 1 42 68 55 00',
    company: 'Lumina Studio',
    status: 'active',
    owner: 'You',
    category: 'retail',
    created: '2026-11-18T16:45:00Z',
    notes: 'Design consulting partner.',
  },
  {
    _id: 'sample-5',
    name: 'David Rossi',
    email: 'd.rossi@milanotech.eu',
    phone: '+39 02 8845 1200',
    company: 'Milano Tech',
    status: 'inactive',
    owner: 'Sarah Chen',
    category: 'retail',
    created: '2026-10-05T11:20:00Z',
    notes: 'Account suspended pending contract renewal.',
  },
];

const STATUS_VARIANT = {
  active: 'green',
  new: 'blue',
  premium: 'amber',
  inactive: 'neutral',
};

export default function ModernContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await request.list({ entity: 'client' });
      const items = res?.result || [];
      if (Array.isArray(items) && items.length > 0) {
        setContacts(items);
      } else {
        setContacts(SAMPLE_CONTACTS);
      }
    } catch (err) {
      console.warn('Using sample contact records:', err);
      setContacts(SAMPLE_CONTACTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    const handleRefresh = () => fetchContacts();
    window.addEventListener('refresh-contacts', handleRefresh);
    return () => window.removeEventListener('refresh-contacts', handleRefresh);
  }, []);

  // Filter & Sort Pipeline
  const filteredContacts = useMemo(() => {
    return contacts
      .filter((c) => {
        const matchesSearch =
          !search ||
          (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
          (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
          (c.company && c.company.toLowerCase().includes(search.toLowerCase()));

        const matchesStatus =
          statusFilter === 'all' ||
          (c.status && c.status.toLowerCase() === statusFilter.toLowerCase());

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        if (sortBy === 'company-asc') return (a.company || '').localeCompare(b.company || '');
        // default: newest
        return new Date(b.created || 0) - new Date(a.created || 0);
      });
  }, [contacts, search, statusFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / pageSize) || 1;
  const paginatedContacts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredContacts.slice(start, start + pageSize);
  }, [filteredContacts, page, pageSize]);

  // Checkbox multi-select helpers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedContacts.map((c) => c._id || c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, e) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected contacts?`)) return;
    setContacts(contacts.filter((c) => !selectedIds.includes(c._id || c.id)));
    setSelectedIds([]);
  };

  const handleBulkTag = () => {
    const tag = prompt('Enter status to assign (active, new, premium, inactive):');
    if (tag) {
      setContacts(
        contacts.map((c) =>
          selectedIds.includes(c._id || c.id) ? { ...c, status: tag.toLowerCase() } : c
        )
      );
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Stats Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Contacts & Leads
            <span className="text-xs font-normal text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              {filteredContacts.length}
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage relationships, accounts, and prospective opportunities
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 rounded-xl">
        {/* Left: Search input */}
        <div className="flex-1 max-w-xs">
          <Input
            icon={Search}
            placeholder="Filter by name, email, company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Right: Dropdowns & View toggles */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <Select
            icon={Filter}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'new', label: 'New Leads' },
              { value: 'premium', label: 'Premium' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />

          <Select
            icon={ArrowUpDown}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'newest', label: 'Newest Added' },
              { value: 'name-asc', label: 'Name (A-Z)' },
              { value: 'company-asc', label: 'Company (A-Z)' },
            ]}
          />

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

          {/* Table / Card View Toggle */}
          <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs font-medium'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs font-medium'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
              title="Card grid view"
              aria-label="Card grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Card>
          <Table>
            <TableHead>
              <tr>
                <TableHeader className="w-10" />
                <TableHeader>Contact</TableHeader>
                <TableHeader>Company</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Owner</TableHeader>
                <TableHeader>Last Activity</TableHeader>
                <TableHeader className="w-10" />
              </tr>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={7} />
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : filteredContacts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No contacts match your query"
            description="Try modifying your search or filter criteria to find the record you are looking for."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearch('');
              setStatusFilter('all');
            }}
          />
        </Card>
      ) : viewMode === 'table' ? (
        /* Table View */
        <Card className="overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <TableHeader className="w-10 px-4">
                  <input
                    type="checkbox"
                    className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={
                      paginatedContacts.length > 0 &&
                      paginatedContacts.every((c) => selectedIds.includes(c._id || c.id))
                    }
                    onChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHeader>
                <TableHeader>Contact</TableHeader>
                <TableHeader>Company</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Owner</TableHeader>
                <TableHeader>Date Added</TableHeader>
                <TableHeader className="w-12 text-right">Actions</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {paginatedContacts.map((contact) => {
                const id = contact._id || contact.id;
                const isSelected = selectedIds.includes(id);
                const statusKey = (contact.status || 'active').toLowerCase();
                const variant = STATUS_VARIANT[statusKey] || 'neutral';
                const formattedDate = contact.created
                  ? new Date(contact.created).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Nov 20, 2026';

                return (
                  <TableRow
                    key={id}
                    selected={isSelected}
                    onClick={() => setActiveContact(contact)}
                  >
                    <TableCell className="w-10 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(id, e)}
                        className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        aria-label={`Select ${contact.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={contact.name} size="sm" />
                        <div className="min-w-0">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {contact.name}
                          </span>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 block truncate">
                            {contact.email || 'No email registered'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                        {contact.company || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={variant} dot>
                        {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {contact.owner || 'You'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {formattedDate}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveContact(contact);
                        }}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="View details"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 select-none">
            <span>
              Showing {Math.min((page - 1) * pageSize + 1, filteredContacts.length)} to{' '}
              {Math.min(page * pageSize, filteredContacts.length)} of {filteredContacts.length} contacts
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>
              <span className="px-2 font-medium text-zinc-700 dark:text-zinc-300">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedContacts.map((contact) => {
            const id = contact._id || contact.id;
            const statusKey = (contact.status || 'active').toLowerCase();
            const variant = STATUS_VARIANT[statusKey] || 'neutral';
            return (
              <Card
                key={id}
                hover
                onClick={() => setActiveContact(contact)}
                className="cursor-pointer"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={contact.name} size="md" />
                      <div className="truncate">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {contact.name}
                        </h4>
                        <p className="text-xs text-zinc-400 truncate">{contact.company || 'No company'}</p>
                      </div>
                    </div>
                    <Badge variant={variant} dot size="sm">
                      {statusKey}
                    </Badge>
                  </div>
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 space-y-1.5 text-xs text-zinc-500">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{contact.email || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{contact.phone || '—'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Multi-Select Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900 dark:bg-zinc-800 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-zinc-700/80 flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="font-semibold bg-zinc-800 dark:bg-zinc-700 px-2 py-0.5 rounded-md">
            {selectedIds.length} selected
          </span>
          <div className="h-4 w-px bg-zinc-700" />
          <Button variant="ghost" size="sm" icon={Tag} onClick={handleBulkTag} className="text-zinc-200 hover:text-white">
            Change status
          </Button>
          <Button variant="ghost" size="sm" icon={Trash2} onClick={handleBulkDelete} className="text-red-400 hover:text-red-300">
            Delete
          </Button>
          <button
            onClick={() => setSelectedIds([])}
            className="text-zinc-400 hover:text-zinc-200 ml-1 underline"
          >
            Deselect
          </button>
        </div>
      )}

      {/* Slide-Over Contact Details Side Panel */}
      <SlideOver
        isOpen={Boolean(activeContact)}
        onClose={() => setActiveContact(null)}
        title={activeContact?.name || 'Contact Details'}
        subtitle={activeContact?.company || 'Account Overview'}
        footer={
          <div className="flex items-center justify-between">
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => {
                if (window.confirm('Delete this contact?')) {
                  const id = activeContact._id || activeContact.id;
                  setContacts(contacts.filter((c) => (c._id || c.id) !== id));
                  setActiveContact(null);
                }
              }}
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setActiveContact(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Mail}
                onClick={() => {
                  window.location.href = `mailto:${activeContact?.email}`;
                }}
              >
                Send Email
              </Button>
            </div>
          </div>
        }
      >
        {activeContact && (
          <div className="space-y-6">
            {/* Top Profile Card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <Avatar name={activeContact.name} size="xl" />
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {activeContact.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {activeContact.company || 'Individual Client'}
                </p>
                <div className="mt-2">
                  <Badge
                    variant={STATUS_VARIANT[(activeContact.status || 'active').toLowerCase()] || 'neutral'}
                    dot
                  >
                    {(activeContact.status || 'Active').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Contact Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Contact Information
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#121215]">
                  <span className="text-zinc-400 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </span>
                  <a
                    href={`mailto:${activeContact.email}`}
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {activeContact.email || '—'}
                  </a>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#121215]">
                  <span className="text-zinc-400 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {activeContact.phone || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#121215]">
                  <span className="text-zinc-400 flex items-center gap-2">
                    <Building className="w-3.5 h-3.5" /> Company
                  </span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {activeContact.company || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#121215]">
                  <span className="text-zinc-400 flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5" /> Account Owner
                  </span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {activeContact.owner || 'You'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Notes & Activity
              </h4>
              <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {activeContact.notes || 'No recent notes added. Click below to add an account activity record.'}
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
