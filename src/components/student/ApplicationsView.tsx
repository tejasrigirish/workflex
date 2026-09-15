import React, { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import { ApplicationStatus } from '../../types/application';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Building,
  MapPin,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ApplicationsViewProps {
  onBrowseJobs: () => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({ onBrowseJobs }) => {
  const { applications, jobs, setActiveModalJob } = useJobs();
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');

  const filteredApps = applications.filter((app) =>
    filterStatus === 'all' ? true : app.status === filterStatus
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">My Applications</h1>
          <p className="text-xs text-slate-400 mt-1">
            Live status of your part-time shift applications
          </p>
        </div>

        <button
          onClick={onBrowseJobs}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition self-start sm:self-auto"
        >
          <span>Find More Shifts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter status buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'pending', 'accepted', 'completed', 'rejected'] as const).map((status) => {
          const count =
            status === 'all'
              ? applications.length
              : applications.filter((a) => a.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition capitalize whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-16 bg-[#111827] border border-[#1F293D] rounded-3xl p-8 space-y-4">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No applications in this view</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Discover verified shops near your college campus and apply in one click.
          </p>
          <button
            onClick={onBrowseJobs}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-lg transition"
          >
            Explore Nearby Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const job = jobs.find((j) => j.id === app.jobId);
            return (
              <div
                key={app.id}
                className="bg-[#111827] border border-[#1F293D] hover:border-slate-700 rounded-2xl p-5 shadow-xl transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-400">
                        {job?.businessName || 'Local Shop'}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[11px] text-slate-500">{app.appliedAt}</span>
                    </div>

                    <h3
                      onClick={() => job && setActiveModalJob(job)}
                      className="text-base font-bold text-white hover:text-emerald-400 transition cursor-pointer"
                    >
                      {job?.title || 'Part-Time Assistant'}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                        app.status === 'accepted'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
                          : app.status === 'completed'
                          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/40'
                          : app.status === 'rejected'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {app.status === 'accepted' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {app.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {app.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                      {app.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                      <span>{app.status}</span>
                    </span>
                  </div>
                </div>

                {/* Cover note or employer notes */}
                {app.coverNote && (
                  <div className="bg-[#151D2D] p-3 rounded-xl text-xs text-slate-300 border border-[#1F293D] italic">
                    <span className="text-slate-400 font-semibold not-italic">Your note: </span>
                    "{app.coverNote}"
                  </div>
                )}

                {/* If accepted, show employer contact and directions */}
                {app.status === 'accepted' && job && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-xs text-emerald-300">
                    <div className="flex items-center gap-2 font-bold text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Congratulations! Employer has approved your shift.</span>
                    </div>
                    <p className="text-slate-300 text-xs">
                      Please contact {job.employerName} at <strong className="text-white">{job.employerPhone}</strong> to confirm your reporting time.
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <a
                        href={`tel:${job.employerPhone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs shadow transition hover:bg-emerald-400"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call Employer</span>
                      </a>
                      <button
                        onClick={() => {
                          const query = encodeURIComponent(`${job.businessName}, ${job.businessAddress}`);
                          window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-medium text-xs hover:bg-slate-700 transition"
                      >
                        <MapPin className="w-3 h-3 text-rose-400" />
                        <span>View Workplace Route</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Shift Details Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-3 border-t border-[#1F293D]">
                  <div className="flex items-center gap-4">
                    <span>Pay: <strong className="text-white">₹{job?.paymentAmount}</strong> ({job?.paymentType.replace('_', ' ')})</span>
                    <span>Shift: <strong className="text-white">{job?.workingHoursText}</strong></span>
                  </div>

                  <button
                    onClick={() => job && setActiveModalJob(job)}
                    className="text-xs text-indigo-400 hover:underline font-semibold"
                  >
                    View Listing →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
