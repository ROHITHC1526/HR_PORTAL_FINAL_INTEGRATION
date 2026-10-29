import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLiveEmployees } from '../../utils/employeeSync';
import { DocDetailDrawer } from '../../components/common/DocDetailDrawer';

export interface TownHallItem {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  speaker: string;
  attendees: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  agenda: string;
}

const getInitialTownHalls = (): TownHallItem[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('brightcone_townhall_meetings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
  }
  return [];
};

export const TownHallMeetingsPage: React.FC = () => {
  const { employees } = useLiveEmployees();
  const [meetings, setMeetings] = useState<TownHallItem[]>(getInitialTownHalls);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All statuses');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMeeting, setViewMeeting] = useState<TownHallItem | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<TownHallItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formSpeaker, setFormSpeaker] = useState('');
  const [formAttendees, setFormAttendees] = useState('');
  const [formStatus, setFormStatus] = useState<TownHallItem['status']>('Scheduled');
  const [formAgenda, setFormAgenda] = useState('');

  const saveMeetings = (newList: TownHallItem[]) => {
    setMeetings(newList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('brightcone_townhall_meetings', JSON.stringify(newList));
      } catch {}
    }
  };

  const openCreateModal = () => {
    setEditingMeeting(null);
    setFormTitle('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('16:00');
    setFormVenue('Main Auditorium & Virtual Stream');
    setFormSpeaker(employees.length > 0 ? `${employees[0].name} (${employees[0].id})` : 'Executive Leadership');
    setFormAttendees('100');
    setFormStatus('Scheduled');
    setFormAgenda('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: TownHallItem) => {
    setEditingMeeting(item);
    setFormTitle(item.title);
    setFormDate(item.date);
    setFormTime(item.time);
    setFormVenue(item.venue);
    setFormSpeaker(item.speaker);
    setFormAttendees(String(item.attendees));
    setFormStatus(item.status);
    setFormAgenda(item.agenda);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingMeeting) {
      const updated = meetings.map((x) =>
        x.id === editingMeeting.id
          ? {
              ...x,
              title: formTitle,
              date: formDate,
              time: formTime,
              venue: formVenue,
              speaker: formSpeaker,
              attendees: parseInt(formAttendees, 10) || 0,
              status: formStatus,
              agenda: formAgenda,
            }
          : x
      );
      saveMeetings(updated);
    } else {
      const newItem: TownHallItem = {
        id: `TH-${String(meetings.length + 1).padStart(3, '0')}`,
        title: formTitle,
        date: formDate || new Date().toISOString().split('T')[0],
        time: formTime || '16:00',
        venue: formVenue || 'Auditorium & Zoom',
        speaker: formSpeaker,
        attendees: parseInt(formAttendees, 10) || 0,
        status: formStatus,
        agenda: formAgenda,
      };
      saveMeetings([newItem, ...meetings]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this town hall meeting?')) {
      const filtered = meetings.filter((x) => x.id !== id);
      saveMeetings(filtered);
    }
  };

  const handleExportCSV = () => {
    if (meetings.length === 0) {
      alert('No town hall records to export.');
      return;
    }
    const headers = ['Town Hall ID', 'Title', 'Date', 'Time', 'Venue', 'Speaker/Host', 'Attendees', 'Status', 'Agenda'];
    const rows = meetings.map((m) => [
      m.id,
      `"${m.title.replace(/"/g, '""')}"`,
      m.date,
      m.time,
      `"${m.venue.replace(/"/g, '""')}"`,
      `"${m.speaker.replace(/"/g, '""')}"`,
      m.attendees,
      m.status,
      `"${(m.agenda || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `townhall_meetings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMeetings = meetings.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All statuses' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countScheduled = meetings.filter((x) => x.status === 'Scheduled').length;
  const countCompleted = meetings.filter((x) => x.status === 'Completed').length;
  const countCancelled = meetings.filter((x) => x.status === 'Cancelled').length;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto p-6">
      {/* Top Header matching Screenshot 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>CONNECT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Town hall meetings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Agenda, all-hands and company-wide Q&A sessions for executive & team staff.
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
            <span>Add town hall</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards matching Screenshot 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total meetings */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Megaphone size={18} />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total meetings</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{meetings.length}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">All sessions</div>
          </div>
        </div>

        {/* Card 2: Scheduled */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Scheduled</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{countScheduled}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Upcoming</div>
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
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Concluded</div>
          </div>
        </div>

        {/* Card 4: Cancelled */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-400">
              <AlertCircle size={18} />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cancelled</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{countCancelled}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Archived</div>
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
              placeholder="Search town hall meetings..."
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
              <option value="Scheduled">Scheduled</option>
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
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Venue</th>
                <th className="py-3.5 px-4">Host / Speaker</th>
                <th className="py-3.5 px-4">Attendees</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredMeetings.length > 0 ? (
                filteredMeetings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{item.title}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{item.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.date}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {item.time}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item.venue}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {item.speaker}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item.attendees} staff
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          item.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : item.status === 'Scheduled'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
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
                          onClick={() => setViewMeeting(item)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-600 transition"
                          title="View town hall details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 hover:border-slate-400 dark:hover:border-slate-500 transition"
                          title="Edit town hall"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-700 transition"
                          title="Delete town hall"
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
                        <Megaphone size={22} />
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        No town hall meetings yet
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
                        Click "Add town hall" to schedule an all-hands or company Q&A session.
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
          <span>{filteredMeetings.length} rows</span>
          <span className="italic">Worked out from your live records</span>
        </div>
      </div>

      {/* Detail Slide-Over Drawer */}
      {viewMeeting && (
        <DocDetailDrawer
          isOpen={!!viewMeeting}
          onClose={() => setViewMeeting(null)}
          title={viewMeeting.title}
          subtitle={`Town Hall ID: ${viewMeeting.id}`}
          statusBadge={viewMeeting.status} statusVariant={viewMeeting.status === 'Completed' ? 'success' : viewMeeting.status === 'Scheduled' ? 'info' : 'danger'}
          fields={[
            { label: 'Date', value: viewMeeting.date },
            { label: 'Time', value: viewMeeting.time },
            { label: 'Venue / Link', value: viewMeeting.venue },
            { label: 'Speaker / Host', value: viewMeeting.speaker },
            { label: 'Expected Staff', value: `${viewMeeting.attendees} Attendees` },
            { label: 'Status', value: viewMeeting.status },
            { label: 'Agenda & Key Points', value: viewMeeting.agenda || 'No agenda provided yet.' },
          ]}
          onEdit={() => {
            const m = viewMeeting;
            setViewMeeting(null);
            openEditModal(m);
          }}
        />
      )}

      {/* Add / Edit Town Hall Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingMeeting ? 'Edit town hall meeting' : 'Add town hall'}
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
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Q4 Company All-Hands & Strategy"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Venue / Link <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formVenue}
                  onChange={(e) => setFormVenue(e.target.value)}
                  placeholder="e.g. Executive Auditorium & Zoom Webinar"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Host/Speaker: Populated dynamically with live employees */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Host / Speaker <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSpeaker}
                    onChange={(e) => setFormSpeaker(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={`${emp.name} (${emp.id})`}>
                        {emp.name} ({emp.id}) - {emp.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expected attendees
                  </label>
                  <input
                    type="number"
                    value={formAttendees}
                    onChange={(e) => setFormAttendees(e.target.value)}
                    placeholder="e.g. 80"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Agenda & Key Discussion Topics
                </label>
                <textarea
                  rows={3}
                  value={formAgenda}
                  onChange={(e) => setFormAgenda(e.target.value)}
                  placeholder="Outline topics, department presentations, and Q&A schedule..."
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
                  {editingMeeting ? 'Save changes' : 'Add town hall'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TownHallMeetingsPage;
