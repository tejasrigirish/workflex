import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobContext';
import { JobCard } from '../jobs/JobCard';
import { JobListing } from '../../types/job';
import {
  Briefcase,
  Bookmark,
  CheckCircle2,
  Wallet,
  Compass,
  MapPin,
  Search,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CITY_COORDINATES } from '../../constants/cities';

interface StudentDashboardProps {
  onNavigateToDiscovery: () => void;
  onNavigateToApplications: () => void;
  onNavigateToSaved: () => void;
  onNavigateToEarnings: () => void;
  onViewJobDetails: (job: JobListing) => void;
  onApplyJob?: (job: JobListing) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateToDiscovery,
  onNavigateToApplications,
  onNavigateToSaved,
  onNavigateToEarnings,
  onViewJobDetails,
  onApplyJob,
}) => {
  const { user } = useAuth();
  const {
    jobs,
    filteredJobs,
    filters,
    updateFilter,
    savedJobIds,
    applications,
    totalEarnings,
    setSelectedJob,
  } = useJobs();

  // Dynamic greeting based on current local time
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
      ? 'Good afternoon'
      : 'Good evening';

  const studentName = user?.name || 'Student';

  // Recommended jobs for student (strictly open/active jobs only)
  const cityJobs = (filteredJobs || []).filter(
    (j) =>
      Boolean(j) &&
      (!filters?.city ||
        filters.city === 'All Cities' ||
        (j.city && typeof j.city === 'string' && j.city.toLowerCase() === (filters.city || '').toLowerCase()) ||
        (j.businessAddress && typeof j.businessAddress === 'string' && j.businessAddress.toLowerCase().includes((filters.city || '').toLowerCase())))
  );
  const recommendedJobs = (cityJobs.length > 0 ? cityJobs : (filteredJobs || [])).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-100">
      {/* Top Welcome Banner */}
      <div className="relative bg-[#0F172A] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verified Student Workspace</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {greeting}, <span className="text-[#BAE6FD]">{studentName}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300">
            Find flexible work opportunities around you. Earn without disrupting your college lectures.
          </p>
        </div>

        {/* Quick Search & Location Bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              placeholder="Search jobs, categories, shops, skills..."
              className="w-full bg-[#070D19] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
            />
          </div>

          {/* City / Location Picker */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-[#070D19] border border-slate-700 px-3 py-2.5 rounded-xl text-xs text-slate-300 shrink-0 w-full sm:w-auto">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <select
                value={filters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
              >
                <option value="All Cities" className="bg-[#0F172A] text-white">
                  All Cities
                </option>
                {Object.keys(CITY_COORDINATES).map((city) => (
                  <option key={city} value={city} className="bg-[#0F172A] text-white">
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards - Strictly real data */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {/* Nearby Jobs */}
        <div
          onClick={onNavigateToDiscovery}
          className="bg-[#0F172A] border border-slate-700/80 hover:border-cyan-400/60 rounded-2xl p-4 shadow-lg cursor-pointer transition transform hover:-translate-y-0.5"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Nearby Jobs
          </span>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {filteredJobs.length}
          </div>
        </div>

        {/* Applications */}
        <div
          onClick={onNavigateToApplications}
          className="bg-[#0F172A] border border-slate-700/80 hover:border-cyan-400/60 rounded-2xl p-4 shadow-lg cursor-pointer transition transform hover:-translate-y-0.5"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Applications
          </span>
          <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-1">
            {applications.length}
          </div>
        </div>

        {/* Saved Jobs */}
        <div
          onClick={onNavigateToSaved}
          className="bg-[#0F172A] border border-slate-700/80 hover:border-cyan-400/60 rounded-2xl p-4 shadow-lg cursor-pointer transition transform hover:-translate-y-0.5"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
            <Bookmark className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Saved Jobs
          </span>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {savedJobIds.length}
          </div>
        </div>

        {/* Completed Jobs - Purely from real completed applications */}
        <div
          onClick={onNavigateToEarnings}
          className="bg-[#0F172A] border border-slate-700/80 hover:border-cyan-400/60 rounded-2xl p-4 shadow-lg cursor-pointer transition transform hover:-translate-y-0.5"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Completed Gigs
          </span>
          <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-1">
            {(applications || []).filter((a) => a?.status === 'completed').length}
          </div>
        </div>

        {/* Total Earnings - Purely from real completed shifts */}
        <div
          onClick={onNavigateToEarnings}
          className="col-span-2 sm:col-span-1 bg-[#0F172A] border border-cyan-400/40 rounded-2xl p-4 shadow-lg cursor-pointer transition transform hover:-translate-y-0.5"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-3">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider block">
            Total Earned
          </span>
          <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-1">
            ₹{(totalEarnings || 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Recommended Opportunities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {cityJobs.length > 0 && filters.city !== 'All Cities'
                ? `Recommended for You in ${filters.city}`
                : `Available Job Opportunities (${jobs.length})`}
            </h2>
            <p className="text-xs text-slate-400">
              Matched with your college free hours and verified neighborhood shops
            </p>
          </div>

          <button
            onClick={onNavigateToDiscovery}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
          >
            <span>View All ({jobs.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recommendedJobs.length === 0 ? (
          <div className="text-center py-16 bg-[#0F172A] border border-slate-800 rounded-3xl p-8 space-y-3">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No active job postings yet.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Local employers have not published shifts in this area yet. Check back soon or switch cities.
            </p>
            {jobs.length > 0 ? (
              <button
                onClick={() => updateFilter('city', 'All Cities')}
                className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl text-xs font-black transition cursor-pointer"
              >
                View {jobs.length} Shifts in Other Cities
              </button>
            ) : (
              <button
                onClick={onNavigateToDiscovery}
                className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl text-xs font-black transition cursor-pointer"
              >
                Explore Map
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSelect={(j) => setSelectedJob(j)}
                onViewDetails={(j) => onViewJobDetails(j)}
                onApplyQuick={(j) => (onApplyJob ? onApplyJob(j) : onViewJobDetails(j))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
