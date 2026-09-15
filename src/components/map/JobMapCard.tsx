import React from 'react';
import { JobListing } from '../../types/job';
import { MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface JobMapCardProps {
  job: JobListing;
  onViewDetails: (job: JobListing) => void;
  onClose?: () => void;
}

export const JobMapCard: React.FC<JobMapCardProps> = ({ job, onViewDetails, onClose }) => {
  return (
    <div className="w-72 max-w-[calc(100vw-3rem)] glass-card-static rounded-2xl overflow-hidden shadow-2xl text-slate-100 p-3 relative border border-white/10">
      {/* Header image & price pill */}
      <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2.5">
        <img
          src={
            job.workplaceImages?.[0] ||
            job.photoUrl ||
            'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80'
          }
          alt={job.businessName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
        
        <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-sky-400/40 text-sky-300 text-[11px] font-bold shadow-md">
          ₹{job.paymentAmount} {job.paymentType === 'per_hour' ? '/ hr' : '/ day'}
        </div>

        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-[10px] font-semibold text-sky-300 uppercase tracking-wider">
            {job.category}
          </p>
          <h4 className="text-xs font-bold text-white truncate drop-shadow-sm">
            {job.title}
          </h4>
        </div>
      </div>

      {/* Business & details */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-300">
          <span className="font-semibold text-white truncate max-w-[170px]">
            {job.businessName}
          </span>
          {job.isVerifiedBusiness && (
            <span title="Verified business">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
            {job.distanceKm ? `${job.distanceKm} km away` : job.city}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
            {job.durationText}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
          {job.shortDescription}
        </p>

        {/* Action Button */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => onViewDetails(job)}
            className="btn-floating-primary flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold cursor-pointer"
          >
            <span>Accept Shift</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="py-1.5 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
