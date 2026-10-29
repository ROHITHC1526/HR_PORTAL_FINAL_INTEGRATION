import React, { useState } from "react";
import { Send, UserCheck, CheckCircle2, Clock } from "lucide-react";
import type { Ticket } from "./types";

interface Props {
  ticket: Ticket | null;
  onSendReply: (message: string) => void;
  onStatusChange: (status: Ticket["status"]) => void;
  onAssignToMe: () => void;
}

export const TicketConversationPanel: React.FC<Props> = ({
  ticket,
  onSendReply,
  onStatusChange,
  onAssignToMe,
}) => {
  const [replyText, setReplyText] = useState("");

  if (!ticket) {
    return (
      <div className="lg:col-span-7 bg-surface border border-line rounded-2xl p-12 text-center text-txt-faint text-xs">
        Select a ticket from the left queue to open details.
      </div>
    );
  }

  const handleSend = () => {
    if (!replyText.trim()) return;
    onSendReply(replyText.trim());
    setReplyText("");
  };

  return (
    <div className="lg:col-span-7 bg-surface border border-line rounded-2xl shadow-card overflow-hidden flex flex-col h-[650px]">
      <div className="p-4 border-b border-line bg-surface-secondary/40 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-brand">{ticket.id}</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-surface border border-line text-txt-muted">
              {ticket.category}
            </span>
          </div>
          <h3 className="font-sora font-semibold text-sm text-txt mt-1">
            {ticket.subject}
          </h3>
          <p className="text-[11px] text-txt-faint mt-0.5">
            Opened by {ticket.employee_name} ({ticket.employee_id})
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            {ticket.assigned_to ? (
              <span className="text-[11px] text-txt-muted flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-brand" />
                {ticket.assigned_to}
              </span>
            ) : (
              <button
                onClick={onAssignToMe}
                className="text-[11px] font-semibold text-brand hover:underline"
              >
                + Assign to Me
              </button>
            )}

            <select
              value={ticket.status}
              onChange={(e) => onStatusChange(e.target.value as Ticket["status"])}
              className="text-xs px-2.5 py-1 rounded-lg bg-surface border border-line text-txt font-semibold outline-none focus:border-brand"
            >
              {["Open", "In progress", "Resolved"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[11px] text-txt-faint">Priority: {ticket.priority}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {ticket.replies.map((reply) => {
          const isHr = reply.author_role === "HR Partner";
          return (
            <div
              key={reply.id}
              className={`flex gap-3 text-xs ${isHr ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  isHr
                    ? "bg-brand text-white"
                    : "bg-surface-secondary border border-line text-txt"
                }`}
              >
                {reply.author_name[0]}
              </div>
              <div
                className={`max-w-[78%] rounded-2xl p-3.5 shadow-sm leading-relaxed ${
                  isHr
                    ? "bg-brand text-white rounded-tr-sm"
                    : "bg-surface-secondary border border-line text-txt rounded-tl-sm"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`font-semibold ${isHr ? "text-white" : "text-txt"}`}>
                    {reply.author_name}
                  </span>
                  <span className={`text-[10px] ${isHr ? "text-white/70" : "text-txt-faint"}`}>
                    {reply.author_role}
                  </span>
                </div>
                <p className="whitespace-pre-line">{reply.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-line bg-surface flex items-center gap-2">
        <input
          type="text"
          placeholder={`Reply to ${ticket.employee_name}...`}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          className="flex-1 px-3.5 py-2 rounded-xl bg-surface-secondary border border-line text-xs text-txt outline-none focus:border-brand"
        />
        <button
          onClick={handleSend}
          disabled={!replyText.trim()}
          className="p-2 rounded-xl bg-brand text-white hover:bg-brand/90 disabled:opacity-50 transition-all shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
