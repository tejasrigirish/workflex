import React, { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import { VerificationBadge } from '../trust/VerificationBadge';
import {
  Plus,
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  GraduationCap,
  MapPin,
  Calendar,
  Sparkles,
  Trash2
} from 'lucide-react';

interface EmployerDashboardProps {
  onOpenPostJob: () => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ onOpenPostJob }) => {
  const { user } = useAuth();
  const {
    jobs,
    applications,
    acceptApplication,
    rejectApplication,
    markApplicationCompleted,
    setActiveModalJob,
    deleteJob,
  } = useJobs();

  const [activeTab, setActiveTab] = useState<'applications' | 'postings' | 'completed'>('applications');
  const [postingsFilter, setPostingsFilter] = useState<'all' | 'active' | 'filled' | 'completed'>('all');

  // Filter employer's own jobs strictly
  const employerJobs = jobs.filter(
    (j) =>
      j.employerId === user?.id ||
      (user?.employerData?.id && j.employerId === user.employerData.id) ||
      (user?.employerData?.businessName && j.businessName.toLowerCase() === user.employerData.businessName.toLowerCase())
  );

  // Filter applications received strictly for these jobs
  const employerJobIds = employerJobs.map((j) => j.id);
  const relevantApplications = applications.filter(
    (app) =>
      employerJobIds.includes(app.jobId) ||
      (user?.employerData?.id && (app as any).employerId === user.employerData.id) ||
      (user?.id && (app as any).employerId === user.id)
  );

  const pendingApps = relevantApplications.filter((a) => a.status === 'pending');
  const acceptedApps = relevantApplications.filter((a) => a.status === 'accepted');
  const completedApps = relevantApplications.filter((a) => a.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-100">
      {/* Top Banner / Employer Profile Header */}
      <div className="bg-[#0F172A] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-black text-2xl shrink-0 shadow-lg">
              {user?.employerData?.businessName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'W'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user?.employerData?.businessName || user?.name || 'Local Employer'}
                </h1>
                <VerificationBadge isVerified={true} showDetails={true} />
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Employer Dashboard • Managed by <strong className="text-slate-200">{user?.name || 'Employer'}</strong> • {user?.employerData?.city || 'Bengaluru'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenPostJob}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm shadow-xl shadow-cyan-400/20 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>+ Post a Part-Time Job</span>
          </button>
        </div>

        {/* Metrics Grid - Strictly computed from real data */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="bg-[#070D19] border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Postings
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {employerJobs.filter(j => j.status === 'active').length}
            </div>
          </div>

          <div className="bg-[#070D19] border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Pending Applications
            </span>
            <div className="text-2xl font-black text-cyan-300 mt-1">
              {pendingApps.length}
            </div>
          </div>

          <div className="bg-[#070D19] border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Accepted Workers
            </span>
            <div className="text-2xl font-black text-sky-400 mt-1">
              {acceptedApps.length}
            </div>
          </div>

          <div className="bg-[#070D19] border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Completed Gigs
            </span>
            <div className="text-2xl font-black text-cyan-400 mt-1">
              {completedApps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'applications'
              ? 'bg-slate-800 text-cyan-300 shadow-md border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Candidate Applications ({relevantApplications.length})
        </button>

        <button
          onClick={() => setActiveTab('postings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'postings'
              ? 'bg-slate-800 text-cyan-300 shadow-md border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Job Listings ({employerJobs.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-slate-800 text-cyan-300 shadow-md border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Completed Shifts ({completedApps.length})
        </button>
      </div>

      {/* Tab 1: Candidate Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {relevantApplications.length === 0 ? (
            <div className="text-center py-16 bg-[#0F172A] border border-slate-800 rounded-3xl p-8 space-y-3">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No applications received yet.</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Post a shift with attractive compensation to receive verified student applicants.
              </p>
              <button
                onClick={onOpenPostJob}
                className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl text-xs font-black transition cursor-pointer"
              >
                + Post a Job
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {relevantApplications.map((app) => {
                const job = jobs.find((j) => j.id === app.jobId);
                const applicantName = app.studentName || 'Student Applicant';
                const applicantCollege = app.studentCollege || 'Local College';
                const applicantEmail = app.studentEmail || '';
                const applicantPhone = app.studentPhone || '';
                const applicantSkills: string[] = app.studentSkills || [];

                return (
                  <div
                    key={app.id}
                    className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 transition"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-black text-sm">
                          {applicantName[0]?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{applicantName}</h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                app.status === 'pending'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : app.status === 'accepted'
                                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                                  : app.status === 'completed'
                                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                            <span>{applicantCollege}</span>
                            {job && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-cyan-300 font-medium">Applied for: {job.title}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right sm:text-right">
                        <span className="text-xs text-slate-400 block">{app.appliedAt}</span>
                        {job && (
                          <span className="text-xs font-bold text-cyan-400 block">
                            ₹{job.payment?.amount} {job.payment?.frequency}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cover note */}
                    {app.coverNote && (
                      <div className="bg-[#070D19] p-3.5 rounded-xl text-xs text-slate-300 border border-slate-800 italic">
                        "{app.coverNote}"
                      </div>
                    )}

                    {/* Student Skills & Contact */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-slate-800">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-slate-500 text-[11px] mr-1">Skills:</span>
                        {applicantSkills.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px]">
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Action buttons depending on state */}
                      <div className="flex items-center gap-2">
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => rejectApplication(app.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-300 text-xs font-semibold transition cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => acceptApplication(app.id)}
                              className="px-4 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black shadow-md transition cursor-pointer"
                            >
                              Accept Student
                            </button>
                          </>
                        )}

                        {app.status === 'accepted' && (
                          <div className="flex items-center gap-2">
                            {applicantPhone && (
                              <a
                                href={`tel:${applicantPhone}`}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 font-medium transition"
                              >
                                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Call {applicantPhone}</span>
                              </a>
                            )}
                            <button
                              onClick={() => markApplicationCompleted(app.id)}
                              className="px-4 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black shadow-md transition cursor-pointer"
                            >
                              Mark Completed & Pay
                            </button>
                          </div>
                        )}

                        {app.status === 'completed' && (
                          <span className="text-xs text-cyan-300 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Paid & Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Job Listings */}
      {activeTab === 'postings' && (
        <div className="space-y-4">
          {/* Status filter bar for listings */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0F172A] border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setPostingsFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  postingsFilter === 'all'
                    ? 'bg-cyan-400 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Postings ({employerJobs.length})
              </button>
              <button
                onClick={() => setPostingsFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  postingsFilter === 'active'
                    ? 'bg-emerald-400 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Open & Active ({employerJobs.filter((j) => j.status === 'active').length})
              </button>
              <button
                onClick={() => setPostingsFilter('filled')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  postingsFilter === 'filled'
                    ? 'bg-sky-400 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Accepted / In Progress ({employerJobs.filter((j) => j.status === 'filled').length})
              </button>
              <button
                onClick={() => setPostingsFilter('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  postingsFilter === 'completed'
                    ? 'bg-cyan-300 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Completed ({employerJobs.filter((j) => j.status === 'completed').length})
              </button>
            </div>
          </div>

          {employerJobs.length === 0 ? (
            <div className="text-center py-16 bg-[#0F172A] border border-slate-800 rounded-3xl p-8 space-y-3">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No active job postings yet.</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create your first shift posting to start receiving verified student applications.
              </p>
              <button
                onClick={onOpenPostJob}
                className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-xs font-black text-slate-950 transition cursor-pointer"
              >
                + Post a Job
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employerJobs
                .filter((job) => postingsFilter === 'all' || job.status === postingsFilter)
                .map((job) => (
                <div
                  key={job.id}
                  className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-semibold uppercase text-[10px]">
                        {job.category}
                      </span>
                      
                      {job.status === 'active' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Open & Live
                        </span>
                      )}

                      {job.status === 'filled' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-sky-400" />
                          Accepted (Hidden from Public)
                        </span>
                      )}

                      {job.status === 'completed' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          Completed & Cleared
                        </span>
                      )}

                      {job.status === 'cancelled' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-bold text-[10px]">
                          Archived
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">{job.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{job.shortDescription}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800">
                      <div>
                        Pay: <strong className="text-cyan-400">₹{job.payment?.amount}</strong> ({job.payment?.frequency})
                      </div>
                      <div>
                        Shift: <strong className="text-white">{job.workingHoursText}</strong>
                      </div>
                      <div>
                        Locality: <strong className="text-white">{job.locality || job.city}</strong>
                      </div>
                      <div>
                        City: <strong className="text-white">{job.city}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveModalJob(job)}
                        className="text-xs text-cyan-400 hover:underline font-bold cursor-pointer"
                      >
                        View Details →
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">{job.postedDate}</span>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Clear "${job.title}" from your active job listings?`)) {
                            await deleteJob(job.id);
                          }
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold border border-rose-500/30 transition cursor-pointer"
                        title="Clear this job listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Completed Shifts */}
      {activeTab === 'completed' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Completed Work Shifts & Payouts</h3>
          {completedApps.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-xs text-slate-400">No completed shifts yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {completedApps.map((c) => {
                const job = jobs.find((j) => j.id === c.jobId);
                const applicantName = c.studentName || 'Student';
                const applicantCollege = c.studentCollege || '';

                return (
                  <div key={c.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-white block">{applicantName}</strong>
                      <span className="text-slate-400">
                        {job?.title || 'Part-Time Shift'} {applicantCollege ? `• ${applicantCollege}` : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-cyan-400 font-bold block">
                        ₹{job?.payment?.amount || 500} Paid
                      </span>
                      <span className="text-[11px] text-slate-500">Completed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
