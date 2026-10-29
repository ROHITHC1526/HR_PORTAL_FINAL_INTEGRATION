import React, { useState } from "react";
import { X } from "lucide-react";
import type { Ticket } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: {
    subject: string;
    category: string;
    priority: Ticket["priority"];
    initialMessage: string;
  }) => void;
}

export const NewTicketModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Payroll & tax");
  const [priority, setPriority] = useState<Ticket["priority"]>("Medium");
  const [initialMessage, setInitialMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !initialMessage.trim()) return;
    onSubmit({
      subject: subject.trim(),
      category,
      priority,
      initialMessage: initialMessage.trim(),
    });
    setSubject("");
    setInitialMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-line flex items-center justify-between bg-surface-secondary/40">
          <div>
            <h3 className="font-sora font-semibold text-sm text-txt">
              Raise an HR Support Request
            </h3>
            <p className="text-xs text-txt-muted mt-0.5">
              Most requests are reviewed and answered within 24 working hours.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-txt-faint hover:text-txt rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-txt font-medium mb-1">Subject</label>
            <input
              type="text"
              placeholder="Summary of your question or issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-txt font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
              >
                <option value="Payroll & tax">Payroll & tax</option>
                <option value="Leave & attendance">Leave & attendance</option>
                <option value="Benefits & insurance">Benefits & insurance</option>
                <option value="IT & assets">IT & assets</option>
                <option value="General HR">General HR</option>
              </select>
            </div>
            <div>
              <label className="block text-txt font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Ticket["priority"])}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-txt font-medium mb-1">Detailed Message</label>
            <textarea
              rows={4}
              placeholder="Describe your question or issue in detail..."
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
            />
          </div>

          <div className="pt-2 border-t border-line flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-line text-txt-muted hover:text-txt hover:bg-surface-secondary font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand/90 shadow-sm"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
