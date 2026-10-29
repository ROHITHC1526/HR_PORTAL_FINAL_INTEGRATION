import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  Search,
  DollarSign,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLiveEmployees } from '../../utils/employeeSync';
import { DocDetailDrawer } from '../../components/common/DocDetailDrawer';

export interface CompanyEventItem {
  id: string;
  name: string;
  type: 'All-hands' | 'Team outing' | 'Celebration' | 'Workshop' | 'Hackathon' | 'Town hall';
  date: string;
  time: string;
  venue: string;
  organiser: string;
  budget: number;
  attendees: number;
  status: 'Planned' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes: string;
}

const getInitialEvents = (): CompanyEventItem[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('brightcone_company_events');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
  }
  return [];
};

export const CompanyEventsPage: React.FC = () => {
  const { employees } = useLiveEmployees();
  const [events, setEvents] = useState<CompanyEventItem[]>(getInitialEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All statuses');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewEvent, setViewEvent] = useState<CompanyEventItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<CompanyEventItem | null>(null);

  // Form states matching Screenshot 5
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<CompanyEventItem['type']>('Celebration');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formOrganiser, setFormOrganiser] = useState('');
  const [formBudget, setFormBudget] = useState('');
  const [formAttendees, setFormAttendees] = useState('');
  const [formStatus, setFormStatus] = useState<CompanyEventItem['status']>('Planned');
  const [formNotes, setFormNotes] = useState('');

  const saveEvents = (newList: CompanyEventItem[]) => {
    setEvents(newList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('brightcone_company_events', JSON.stringify(newList));
      } catch {}
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormName('');
    setFormType('Celebration');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('11:00');
    setFormVenue('Hyderabad Main Campus');
    setFormOrganiser(employees.length > 0 ? `${employees[0].name} (${employees[0].id})` : 'Ananya Rao (BC-1004)');
    setFormBudget('50000');
    setFormAttendees('40');
    setFormStatus('Planned');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (ev: CompanyEventItem) => {
    setEditingEvent(ev);
    setFormName(ev.name);
    setFormType(ev.type);
    setFormDate(ev.date);
    setFormTime(ev.time);
    setFormVenue(ev.venue);
    setFormOrganiser(ev.organiser);
    setFormBudget(String(ev.budget));
    setFormAttendees(String(ev.attendees));
    setFormStatus(ev.status);
    setFormNotes(ev.notes);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDate) return;

    if (editingEvent) {
      const updated = events.map((x) =>
        x.id === editingEvent.id
          ? {
              ...x,
              name: formName,
              type: formType,
              date: formDate,
              time: formTime,
              venue: formVenue,
              organiser: formOrganiser,
              budget: parseFloat(formBudget) || 0,
              attendees: parseInt(formAttendees, 10) || 0,
              status: formStatus,
              notes: formNotes,
            }
          : x
      );
      saveEvents(updated);
    } else {
      const newEv: CompanyEventItem = {
        id: `EVT-${String(events.length + 1).padStart(3, '0')}`,
        name: formName,
        type: formType,
        date: formDate,
        time: formTime,
        venue: formVenue,
        organiser: formOrganiser,
        budget: parseFloat(formBudget) || 0,
        attendees: parseInt(formAttendees, 10) || 0,
        status: formStatus,
        notes: formNotes,
      };
      saveEvents([newEv, ...events]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this company event?')) {
      const filtered = events.filter((x) => x.id !== id);
      saveEvents(filtered);
    }
  };

  const handleExportCSV = () => {
    if (events.length === 0) {
      alert('No company events to export.');
      return;
    }
    const headers = ['Event ID', 'Event Name', 'Type', 'Date', 'Time', 'Venue', 'Organiser', 'Budget', 'Attendees', 'Status', 'Notes'];
    const rows = events.map((ev) => [
      ev.id,
      `"${ev.name.replace(/"/g, '""')}"`,
      ev.type,
      ev.date,
      ev.time,
      `"${ev.venue.replace(/"/g, '""')}"`,
      `"${ev.organiser.replace(/"/g, '""')}"`,
      ev.budget,
      ev.attendees,
      ev.status,
      `"${(ev.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `company_events_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEvents = events.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.organiser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All statuses' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countUpcoming = events.filter((x) => x.status === 'Planned' || x.status === 'Confirmed').length;
  const countPlanned = events.filter((x) => x.status === 'Planned').length;
  const countCompleted = events.filter((x) => x.status === 'Completed').length;
  const totalBudget = events.reduce((sum, x) => sum + (x.budget || 0), 0);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto p-6">
      {/* Top Header matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>CONNECT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Company events
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Overview of offline and live online occasions and festive celebrations across the unit.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Add event</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards matching Screenshot 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Upcoming events */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Upcoming events</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{countUpcoming}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Celebrations & meetups</div>
          </div>
        </div>

        {/* Card 2: Planned */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock size={18} />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Planned</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{countPlanned}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">In-office & offsite</div>
          </div>
        </div>

        {/* Card 3: Completed */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{countCompleted}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Past occasions</div>
          </div>
        </div>

        {/* Card 4: Total budget */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <DollarSign size={18} />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total budget</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{totalBudget.toLocaleString('en-IN')}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Allocated</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Search & Filter Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company events..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All statuses">All statuses</option>
              <option value="Planned">Planned</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table / Empty State */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Event name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Organiser</th>
                <th className="py-3.5 px-4">Budget</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{item.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{item.id} • {item.venue}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {item.date}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {item.time || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.organiser}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      ₹{item.budget.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          item.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : item.status === 'Confirmed'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : item.status === 'Planned'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewEvent(item)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-600 transition"
                          title="View event details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 hover:border-slate-400 dark:hover:border-slate-500 transition"
                          title="Edit event"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-700 transition"
                          title="Delete event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 flex items-center justify-center text-sky-500 mb-3">
                        <Calendar size={22} />
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        No company events yet
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
                        Click "Add event" to schedule the first one.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>{filteredEvents.length} rows</span>
          <span className="italic">Worked out from your live records</span>
        </div>
      </div>

      {/* Detail Slide-Over Drawer */}
      {viewEvent && (
        <DocDetailDrawer
          isOpen={!!viewEvent}
          onClose={() => setViewEvent(null)}
          title={viewEvent.name}
          subtitle={`Event ID: ${viewEvent.id}`}
          statusBadge={viewEvent.status} statusVariant={viewEvent.status === 'Completed' ? 'success' : viewEvent.status === 'Confirmed' ? 'info' : 'warning'}
          fields={[
            { label: 'Event Type', value: viewEvent.type },
            { label: 'Date', value: viewEvent.date },
            { label: 'Time', value: viewEvent.time || 'Not specified' },
            { label: 'Venue', value: viewEvent.venue },
            { label: 'Organiser', value: viewEvent.organiser },
            { label: 'Estimated Budget', value: `₹${viewEvent.budget.toLocaleString('en-IN')}` },
            { label: 'Expected Attendees', value: `${viewEvent.attendees} participants` },
            { label: 'Status', value: viewEvent.status },
            { label: 'Notes', value: viewEvent.notes || 'No extra notes provided.' },
          ]}
          onEdit={() => {
            const ev = viewEvent;
            setViewEvent(null);
            openEditModal(ev);
          }}
        />
      )}

      {/* Add / Edit Event Modal matching Screenshot 5 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingEvent ? 'Edit event' : 'Add event'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fields marked <span className="text-rose-500">*</span> are required.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Annual Brightcone Tech Symposium"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Celebration">Celebration</option>
                    <option value="All-hands">All-hands</option>
                    <option value="Team outing">Team outing</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Town hall">Town hall</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                    placeholder="e.g. Main Auditorium"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Organiser: dynamically populated from live employees */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Organiser
                  </label>
                  <select
                    value={formOrganiser}
                    onChange={(e) => setFormOrganiser(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={`${emp.name} (${emp.id})`}>
                        {emp.name} ({emp.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Attendees
                  </label>
                  <input
                    type="number"
                    value={formAttendees}
                    onChange={(e) => setFormAttendees(e.target.value)}
                    placeholder="e.g. 40"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Additional event requirements, equipment, catering..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  {editingEvent ? 'Save changes' : 'Add event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyEventsPage;
