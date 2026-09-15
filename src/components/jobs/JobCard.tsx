import React from 'react';
import { JobListing } from '../../types/job';
import { MapPin, Clock, Bookmark, ArrowRight, ShieldCheck, Calendar } from 'lucide-react';
import { useJobs } from '../../context/JobContext';

interface JobCardProps {
  job: JobListing;
  isSelected?: boolean;
  onSelect?: (job: JobListing) => void;
  onViewDetails: (job: JobListing) => void;
  onApplyQuick?: (job: JobListing) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSelected = false,
  onSelect,
  onViewDetails,
  onApplyQuick,
}) => {
  const { savedJobIds, toggleSaveJob, applications } = useJobs();
  const isSaved = savedJobIds.includes(job.id);
  const userApp = applications.find((a) => a.jobId === job.id);
  const hasApplied = !!userApp;

  const paymentFormatted = `₹${job.paymentAmount.toLocaleString('en-IN')}`;
  const paymentUnit = (() => {
    const type = (job.paymentType || job.payment?.frequency || '').toLowerCase();
    if (type.includes('hour')) return '/hour';
    if (type.includes('day') || type.includes('shift')) return '/day';
    if (type.includes('month')) return '/month';
    if (type.includes('task')) return '/task';
    return '/day';
  })();

  const imageSrc =
    job.workplaceImages?.[0] ||
    job.photoUrl ||
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      onClick={() => onSelect && onSelect(job)}
      className={`group relative glass-card rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col sm:flex-row ${
        isSelected
          ? 'border-sky-400/60 shadow-[0_0_25px_rgba(56,189,248,0.25)] ring-1 ring-sky-400/40'
          : 'hover:border-slate-600/80 hover:shadow-2xl'
      }`}
    >
      {/* Thumbnail with slight zoom on hover */}
      <div className="relative sm:w-44 h-36 sm:h-auto shrink-0 overflow-hidden bg-slate-900/60">
        <img
          src={imageSrc}
          alt={job.businessName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 sm:from-transparent sm:to-slate-950/40 to-transparent" />

        {/* Category tag on image */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-slate-200 uppercase tracking-wider">
            {job.category}
          </span>
        </div>

        {/* Save/Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveJob(job.id);
          }}
          title={isSaved ? 'Remove from saved' : 'Save job'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition ${
            isSaved
              ? 'bg-amber-400/20 text-amber-200 border border-amber-300/40'
              : 'bg-black/50 text-slate-300 hover:text-white hover:bg-black/80 border border-white/10'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-200 text-amber-200' : ''}`} />
        </button>

        {/* Start Date badge on mobile image bottom */}
        <div className="absolute bottom-2.5 left-2.5 sm:hidden flex items-center gap-1 text-[10px] text-slate-300 bg-black/60 px-2 py-0.5 rounded">
          <Calendar className="w-3 h-3 text-[#BAE6FD]" />
          <span>{job.startDate}</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Header row: Business name + verification */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <div className="flex items-center gap-1.5 truncate max-w-[240px]">
              <span className="font-medium text-slate-300 truncate">{job.businessName}</span>
              {job.isVerifiedBusiness && (
                <span title="Verified business">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500">{job.postedDate}</span>
          </div>

          {/* Job Title */}
          <h3 className="text-base font-bold text-white group-hover:text-[#BAE6FD] transition-colors line-clamp-1">
            {job.title}
          </h3>

          {/* Key metadata pills */}
          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-400 mt-2">
            <div className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-300 shrink-0 group-hover:animate-bounce" />
              <span>{job.distanceKm ? `${job.distanceKm} km away` : job.city}</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-200 shrink-0" />
              <span>{job.durationText}</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="text-slate-300">
              <span>{job.workingHoursText}</span>
            </div>
          </div>

          {/* Short description */}
          <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
            {job.shortDescription}
          </p>
        </div>

        {/* Footer row: Payment & CTA */}
        <div className="pt-3 border-t border-slate-700/40 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-extrabold text-white">
                {paymentFormatted}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {paymentUnit}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              {job.workType.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(job);
              }}
              className="btn-floating-glass py-1.5 px-3.5 rounded-xl text-xs font-semibold text-slate-200 cursor-pointer"
            >
              Details
            </button>

            {hasApplied ? (
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-bold whitespace-nowrap">
                Applied
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onApplyQuick) {
                    onApplyQuick(job);
                  } else {
                    onViewDetails(job);
                  }
                }}
                className="btn-floating-primary flex items-center gap-1.5 py-1.5 px-4 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                <span>Accept Shift</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
