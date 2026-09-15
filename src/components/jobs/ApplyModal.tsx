import React, { useState } from 'react';
import { JobListing } from '../../types/job';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  Building2,
  Calendar
} from 'lucide-react';

interface ApplyModalProps {
  job: JobListing;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ job, onClose, onSuccess }) => {
  const { applyForJob } = useJobs();
  const { user } = useAuth();
  const [coverNote, setCoverNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await applyForJob(job.id, coverNote);
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Application error:', err);
      setIsSubmitting(false);
      setError(err?.message || 'Failed to apply. Please make sure you are registered as a student.');
    }
  };

  const paymentFormatted = `₹${job.paymentAmount.toLocaleString('en-IN')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111827] border border-[#1F293D] rounded-2xl shadow-2xl p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">Shift Accepted!</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Your profile has been forwarded to <strong>{job.businessName}</strong>. The employer can now confirm you for this shift and initiate direct payout upon completion.
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-full text-xs font-semibold">
                Status: Forwarded to Employer Dashboard
              </span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Accept Part-Time Shift</h3>
                <p className="text-xs text-slate-400">Review shift summary before accepting</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Application Summary Card */}
            <div className="bg-[#151D2D] border border-[#1F293D] rounded-xl p-4 space-y-3 mb-5">
              <div>
                <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                  {job.category}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{job.title}</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-[#1F293D]">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{job.businessName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <span>Pay: {paymentFormatted}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span className="truncate">{job.city}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{job.workingHoursText}</span>
                </div>
              </div>
            </div>

            {/* Applicant info reminder */}
            <div className="mb-4 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              Applying as student: <strong className="text-white">{user?.name || 'Applicant'}</strong> •{' '}
              <span>{user?.studentData?.college || 'Registered Student'}</span>
            </div>

            {/* Optional Cover Note */}
            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Quick Note to Employer (Optional)
                </label>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="e.g. I live nearby, have free time during this shift, and am ready to start..."
                  rows={3}
                  className="w-full bg-[#151D2D] border border-[#1F293D] rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-black text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl shadow-md shadow-cyan-400/25 transition cursor-pointer"
                >
                  {isSubmitting ? 'Submitting Shift Request...' : 'Confirm & Accept Shift'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
