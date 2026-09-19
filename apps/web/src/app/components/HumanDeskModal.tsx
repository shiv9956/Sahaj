'use client';

import React, { useState } from 'react';
import { Headphones, X, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

interface HumanDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGoalSummary?: string;
}

export function HumanDeskModal({ isOpen, onClose, userGoalSummary }: HumanDeskModalProps) {
  const [reason, setReason] = useState('complex_case');
  const [notes, setNotes] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<{ ticketId: string; status: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const ticketId = `HD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedTicket({
        ticketId,
        status: 'ACKNOWLEDGED_N8N_QUEUED',
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Human Desk Escalation</h3>
              <p className="text-[11px] text-slate-400">Zero-Dead-End Guarantee (n8n Workflow)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!submittedTicket ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
              <div className="text-[11px] text-slate-400">Redacted Journey Context:</div>
              <div className="font-medium mt-0.5">{userGoalSummary || 'Education Loan Inquiry (₹2,00,000)'}</div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">Reason for Assistance</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 text-slate-200 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="complex_case">Complex Eligibility / Custom Terms required</option>
                <option value="clarification">Need clarification on moratorium or charges</option>
                <option value="document_help">Document verification assistance</option>
                <option value="human_request">Prefer talking to a financial counselor</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">Additional Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Describe your question or preferred callback time..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 text-slate-200 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Redacted summary is sent via n8n outbox. No raw income or documents stored.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Submitting Ticket...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Connect with Human Support
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="py-4 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-slate-100">Ticket Submitted Successfully</div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
              <div className="text-slate-400">Ticket ID:</div>
              <div className="font-mono text-emerald-400 font-bold text-sm">{submittedTicket.ticketId}</div>
              <div className="text-[11px] text-slate-500">Status: {submittedTicket.status}</div>
            </div>
            <p className="text-xs text-slate-400">
              Our support desk will review your redacted summary and notify your preferred channel.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs transition-colors"
            >
              Back to Sahaj Journey
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
