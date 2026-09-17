import React, { useState, useEffect } from 'react';
import { useJobs } from '../context/JobContext';
import { JobMap } from '../components/map/JobMap';
import { JobCard } from '../components/jobs/JobCard';
import { JobFilters } from '../components/jobs/JobFilters';
import { JobListing, SortOption } from '../types/job';
import { Map, List, Compass, ArrowUpDown, Sparkles } from 'lucide-react';

interface DiscoverPageProps {
  onViewJobDetails: (job: JobListing) => void;
  onApplyJob: (job: JobListing) => void;
  onOpenPostJob?: () => void;
  initialMobileView?: 'list' | 'map';
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  onViewJobDetails,
  onApplyJob,
  onOpenPostJob,
  initialMobileView = 'list',
}) => {
  const {
    jobs,
    filteredJobs,
    selectedJob,
    setSelectedJob,
    filters,
    updateFilter,
  } = useJobs();

  // Mobile view switcher ('split' on lg, 'list' or 'map' on mobile)
  const [mobileView, setMobileView] = useState<'list' | 'map'>(initialMobileView);

  useEffect(() => {
    if (initialMobileView) {
      setMobileView(initialMobileView);
    }
  }, [initialMobileView]);

  const sortLabels: Record<SortOption, string> = {
    relevant: 'Most Relevant',
    highest_pay: 'Highest Pay',
    lowest_pay: 'Lowest Pay',
    nearest: 'Nearest Distance',
    farthest: 'Farthest Distance',
    newest: 'Newest',
  };

  const handleCycleSort = () => {
    const sequence: SortOption[] = ['relevant', 'highest_pay', 'lowest_pay', 'nearest', 'newest'];
    const currentIdx = sequence.indexOf(filters.sortBy);
    const nextSort = sequence[(currentIdx + 1) % sequence.length];
    updateFilter('sortBy', nextSort);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4 text-slate-100">
      {/* Top Filter Bar */}
      <JobFilters />

      {/* Mobile Toggle: List vs Map View */}
      <div className="lg:hidden flex items-center justify-center p-1 bg-[#111827] border border-[#1F293D] rounded-xl shadow-md">
        <button
          onClick={() => setMobileView('list')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-lg text-xs font-bold transition cursor-pointer ${
            mobileView === 'list'
              ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Job List ({filteredJobs.length})</span>
        </button>

        <button
          onClick={() => {
            setMobileView('map');
            setTimeout(() => {
              window.dispatchEvent(new Event('resize'));
            }, 80);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-lg text-xs font-bold transition cursor-pointer ${
            mobileView === 'map'
              ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Interactive Map</span>
        </button>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 min-h-[440px] sm:min-h-[480px] lg:min-h-[600px] h-[calc(100dvh-230px)] sm:h-[calc(100dvh-200px)] lg:h-[calc(100vh-210px)]">
        {/* Left Side: Interactive Map (Hidden on mobile if 'list' is selected) */}
        <div
          className={`lg:col-span-6 xl:col-span-7 h-full rounded-2xl overflow-hidden border border-[#1F293D] shadow-xl ${
            mobileView === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <JobMap
            jobs={filteredJobs}
            selectedJob={selectedJob}
            onSelectJob={(job) => setSelectedJob(job)}
            onViewJobDetails={(job) => onViewJobDetails(job)}
            currentCity={filters.city}
            onCityChange={(city) => updateFilter('city', city)}
          />
        </div>

        {/* Right Side: Scrollable Job List (Hidden on mobile if 'map' is selected) */}
        <div
          className={`lg:col-span-6 xl:col-span-5 h-full flex flex-col ${
            mobileView === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* List Header */}
          <div className="flex items-center justify-between pb-3 shrink-0">
            <div>
              <span className="text-xs font-bold text-white">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'Shift' : 'Shifts'} in {filters.city}
              </span>
              <span className="text-[11px] text-slate-400 block">
                Synchronized with pins on the map
              </span>
            </div>

            <button
              onClick={handleCycleSort}
              title="Click to cycle sort order"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#1F293D] hover:border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>{sortLabels[filters.sortBy] || 'Sort'}</span>
            </button>
          </div>

          {/* Scrollable list items */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-16 bg-[#0F172A] border border-slate-800 rounded-3xl p-8 space-y-3 shadow-xl">
                <Compass className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">
                  {jobs.length === 0 ? 'No active job postings yet.' : 'No matching shifts found'}
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {jobs.length === 0
                    ? 'Verified neighborhood businesses have not published shifts in this area yet. Check back soon or post a job if you are hiring!'
                    : 'Try broadening your distance slider or resetting your filters.'}
                </p>
                {jobs.length === 0 && onOpenPostJob ? (
                  <button
                    onClick={onOpenPostJob}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 rounded-xl text-xs font-black transition cursor-pointer shadow-lg shadow-cyan-400/25 flex items-center gap-1.5 mx-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>Post a Shift Listing</span>
                  </button>
                ) : (
                  <button
                    onClick={() => updateFilter('categories', [])}
                    className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-cyan-400/20"
                  >
                    Clear Category Filter
                  </button>
                )}
              </div>
            ) : (
              filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSelected={selectedJob?.id === job.id}
                  onSelect={(j) => setSelectedJob(j)}
                  onViewDetails={(j) => onViewJobDetails(j)}
                  onApplyQuick={(j) => onApplyJob(j)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

