import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Search, MessageSquare, CheckCircle2, Clock, UserCheck, AlertTriangle } from "lucide-react";
import { useNotifications } from "../../services/NotificationsContext";
import { type Ticket, type TicketReply, defaultTickets } from "./helpdesk/types";
import { TicketConversationPanel } from "./helpdesk/TicketConversationPanel";
import { NewTicketModal } from "./helpdesk/NewTicketModal";

export const HelpdeskQueuePage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(defaultTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string>("T-101");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const { addNotification } = useNotifications();

  const fetchTickets = async () => {
    try {
      const res = await axios.get("/api/helpdesk/tickets");
      if (res.data && Array.isArray(res.data)) {
        setTickets(res.data);
      }
    } catch {
      // Keep default state
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (ticketData: {
    subject: string;
    category: string;
    priority: Ticket["priority"];
    initialMessage: string;
  }) => {
    const payload = {
      subject: ticketData.subject,
      category: ticketData.category,
      priority: ticketData.priority,
      message: ticketData.initialMessage,
    };

    try {
      const res = await axios.post("/api/helpdesk/tickets", payload);
      if (res.data) {
        setTickets((prev) => [res.data, ...prev]);
        setSelectedTicketId(res.data.id);
      }
    } catch {
      const newTicket: Ticket = {
        id: `T-${Math.floor(100 + Math.random() * 900)}`,
        employee_id: "EMP-001",
        employee_name: "Ananya Rao",
        subject: ticketData.subject,
        category: ticketData.category,
        priority: ticketData.priority,
        status: "Open",
        created_at: new Date().toISOString(),
        replies: [
          {
            id: `r-${Date.now()}`,
            author_name: "Ananya Rao",
            author_role: "Employee",
            message: ticketData.initialMessage,
            created_at: new Date().toISOString(),
          },
        ],
      };
      setTickets((prev) => [newTicket, ...prev]);
      setSelectedTicketId(newTicket.id);
    }

    addNotification({
      title: "Helpdesk Ticket Raised",
      message: `Your ticket "${ticketData.subject}" has been queued. An HR partner will respond shortly.`,
      category: "helpdesk",
      actionUrl: "/engagement/helpdesk",
    });

    setIsModalOpen(false);
  };

  const handleSendReply = async (message: string) => {
    const replyObj: TicketReply = {
      id: `r-${Date.now()}`,
      author_name: "Ananya Rao",
      author_role: "HR Partner",
      message,
      created_at: new Date().toISOString(),
    };

    try {
      await axios.post(`/api/helpdesk/tickets/${selectedTicketId}/reply`, {
        author_name: "Ananya Rao",
        author_role: "HR Partner",
        message,
      });
    } catch {
      // Local fallback
    }

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicketId ? { ...t, replies: [...t.replies, replyObj] } : t
      )
    );
  };

  const handleAssignToMe = async () => {
    const partner = "Ananya Rao";
    try {
      await axios.post(`/api/helpdesk/tickets/${selectedTicketId}/assign`, {
        assigned_to: partner,
      });
    } catch {
      // Local fallback
    }

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicketId
          ? { ...t, assigned_to: partner, status: t.status === "Open" ? "In progress" : t.status }
          : t
      )
    );
  };

  const handleStatusChange = async (newStatus: Ticket["status"]) => {
    try {
      await axios.post(`/api/helpdesk/tickets/${selectedTicketId}/status`, {
        status: newStatus,
      });
    } catch {
      // Local fallback
    }

    setTickets((prev) =>
      prev.map((t) => (t.id === selectedTicketId ? { ...t, status: newStatus } : t))
    );
  };

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || null;
  const openCount = tickets.filter((t) => t.status === "Open").length;
  const inProgressCount = tickets.filter((t) => t.status === "In progress").length;
  const unassignedCount = tickets.filter((t) => !t.assigned_to && t.status !== "Resolved").length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved").length;

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === "All" ? true : t.status === statusFilter;
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-2xl font-semibold text-txt">HR Helpdesk & Support Queue</h1>
          <p className="text-xs text-txt-muted mt-1">
            Track, assign, and answer employee queries. Threaded conversations are retained for auditing.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Raise Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
            <span>Open Tickets</span>
          </div>
          <div className="font-sora text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{openCount}</div>
          <div className="text-[11px] text-txt-faint mt-1">Awaiting response</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-blue-50 text-brand dark:bg-blue-950/40 dark:text-blue-300">
              <UserCheck className="w-4 h-4" />
            </span>
            <span>In Progress</span>
          </div>
          <div className="font-sora text-2xl font-bold text-brand mt-2">{inProgressCount}</div>
          <div className="text-[11px] text-txt-faint mt-1">Being resolved by HR</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <span>Unassigned</span>
          </div>
          <div className="font-sora text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">{unassignedCount}</div>
          <div className="text-[11px] text-txt-faint mt-1">Needs partner assignment</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span>Resolved</span>
          </div>
          <div className="font-sora text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{resolvedCount}</div>
          <div className="text-[11px] text-txt-faint mt-1">Completed successfully</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-3">
          <div className="space-y-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-txt-faint absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket subject, employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface border border-line text-xs text-txt outline-none focus:border-brand"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {["All", "Open", "In progress", "Resolved"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === tab
                      ? "bg-brand text-white font-semibold"
                      : "text-txt-muted hover:text-txt hover:bg-surface-secondary"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-line rounded-2xl shadow-card divide-y divide-line/60 overflow-hidden max-h-[580px] overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-txt-faint">No tickets matching criteria.</div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected ? "bg-brand-soft/30 border-l-4 border-l-brand" : "hover:bg-surface-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-txt">{t.id}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                            t.priority === "Urgent"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                              : t.priority === "High"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                              : "bg-surface-secondary text-txt-muted border border-line"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          t.status === "Resolved"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : t.status === "In progress"
                            ? "bg-blue-50 text-brand dark:bg-blue-950/40 dark:text-blue-300"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-txt truncate">{t.subject}</h4>
                    <div className="flex items-center justify-between text-[11px] text-txt-faint mt-2">
                      <span>{t.employee_name} ? {t.category}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {t.replies.length}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <TicketConversationPanel
          ticket={selectedTicket}
          onSendReply={handleSendReply}
          onStatusChange={handleStatusChange}
          onAssignToMe={handleAssignToMe}
        />
      </div>

      <NewTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
};

export default HelpdeskQueuePage;
