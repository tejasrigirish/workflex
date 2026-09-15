import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { JobListing } from '../../types/job';
import { useJobs } from '../../context/JobContext';

interface ReportModalProps {
  job: JobListing;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Demanding upfront registration fee or security deposit',
  'Payment amount is lower than stated in listing',
  'Work hours or duties differ significantly from description',
  'Unsafe or inappropriate workplace environment',
  'Business address or shop does not exist at location',
  'Suspicious or harassing behavior from contact person',
  'Other legitimate concern'
];

export const ReportModal: React.FC<ReportModalProps> = ({ job, onClose }) => {
  const { submitReport } = useJobs();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(job.id, selectedReason, details);
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111827] border border-[#1F293D] rounded-2xl shadow-2xl p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Report Submitted</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Thank you for keeping WorkFlex safe for student peers. Our Trust & Safety team investigates all reports within 4 hours.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Report Listing</h3>
                <p className="text-xs text-slate-400">{job.title} • {job.businessName}</p>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4 text-xs text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Student Protection Policy:</strong> Legitimate employers on WorkFlex will NEVER ask you to pay money for registration, uniform, or training.
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Reason
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        selectedReason === reason
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                          : 'bg-[#151D2D] border-[#1F293D] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className="mt-0.5 text-rose-500 focus:ring-rose-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide any specific details (messages, demands made, etc.)..."
                  rows={3}
                  className="w-full bg-[#151D2D] border border-[#1F293D] rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg transition"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
