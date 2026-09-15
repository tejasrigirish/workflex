import React, { useState } from 'react';
import { JobListing } from '../../types/job';
import { useJobs } from '../../context/JobContext';
import { VerificationBadge } from '../trust/VerificationBadge';
import {
  X,
  MapPin,
  Clock,
  Bookmark,
  Share2,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Phone,
  Mail,
  Users,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface JobDetailsModalProps {
  job: JobListing;
  onClose: () => void;
  onApply: (job: JobListing) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose, onApply }) => {
  const { savedJobIds, toggleSaveJob, setReportListingModalJob, applications } = useJobs();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const isSaved = savedJobIds.includes(job.id);
  const userApplication = applications.find(a => a.jobId === job.id);
  const hasApplied = !!userApplication;

  const images = (job.workplaceImages && job.workplaceImages.length > 0)
    ? job.workplaceImages
    : job.photoUrl
    ? [job.photoUrl]
    : ['https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80'];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 40 && images.length > 1) {
      setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    } else if (diff < -40 && images.length > 1) {
      setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
    setTouchStartX(null);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleGetDirections = () => {
    const query = encodeURIComponent(`${job.businessName}, ${job.businessAddress}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const paymentFormatted = `₹${(Number(job.paymentAmount) || 0).toLocaleString('en-IN')}`;
  const paymentUnit = (() => {
    const type = (job.paymentType || job.payment?.frequency || '').toLowerCase();
    if (type.includes('hour')) return '/hour';
    if (type.includes('day') || type.includes('shift')) return '/day';
    if (type.includes('month')) return '/month';
    if (type.includes('task')) return '/task';
    return '/day';
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-[#111827] border border-[#1F293D] rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 max-h-[90dvh] sm:max-h-[92vh] flex flex-col">
        {/* Modal Top Nav Bar */}
        <div className="flex items-center justify-between p-4 border-b border-[#1F293D] bg-[#0B0F17]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider">
              {job.category}
            </span>
            <VerificationBadge isVerified={job.isVerifiedBusiness} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Share listing"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition text-xs flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={() => toggleSaveJob(job.id)}
              title={isSaved ? 'Remove from saved' : 'Save job'}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isSaved
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Workplace Image Gallery Carousel */}
          <div className="space-y-2">
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner select-none"
            >
              <img
                src={images[activeImageIndex] || images[0]}
                alt={`${job.businessName} workplace`}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

              {/* Gallery navigation arrows if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition cursor-pointer shadow-lg"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition cursor-pointer shadow-lg"
                    title="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Overlay Badge for Payment */}
              <div className="absolute bottom-4 left-4 flex flex-col items-start pointer-events-none">
                <span className="text-xs text-slate-300 font-medium drop-shadow-sm">Total Compensation</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-cyan-300 drop-shadow-md">
                    {paymentFormatted}
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    {paymentUnit}
                  </span>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs text-slate-200 border border-white/10">
                  {job.durationText} • {job.workingHoursText}
                </span>
              </div>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-cyan-400 opacity-100 ring-2 ring-cyan-400/30'
                        : 'border-transparent opacity-60 hover:opacity-90'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Job Title & Key Attributes */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {job.title}
            </h1>

            <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
              <span>{job.businessName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{job.city}</span>
              {job.distanceKm && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-semibold">{job.distanceKm} km from you</span>
                </>
              )}
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#151D2D] border border-[#1F293D] rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Duration
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{job.durationText}</span>
              </div>
            </div>

            <div className="bg-[#151D2D] border border-[#1F293D] rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Working Shift
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{job.workingHoursText}</span>
              </div>
            </div>

            <div className="bg-[#151D2D] border border-[#1F293D] rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Positions
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{job.workersNeeded} workers needed</span>
              </div>
            </div>

            <div className="bg-[#151D2D] border border-[#1F293D] rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Work Type
              </span>
              <span className="text-xs font-bold text-emerald-400 capitalize">
                {job.workType.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Description & Responsibilities */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                About the Opportunity
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {job.fullDescription}
              </p>
            </div>

            {job.responsibilities.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  What You Will Do
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            {job.requiredSkills.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Required Skills & Qualities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Employer & Workplace Trust Card */}
          <div className="bg-[#151D2D] border border-[#1F293D] rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F293D]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-bold text-white">
                  {job.businessName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{job.businessName}</h4>
                    <VerificationBadge isVerified={job.isVerifiedBusiness} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{job.businessDescription}</p>
                </div>
              </div>

              <button
                onClick={handleGetDirections}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-300 hover:text-white border border-slate-700 transition shrink-0"
              >
                <Navigation className="w-4 h-4 text-blue-400" />
                <span>Get Directions</span>
              </button>
            </div>

            {/* Address & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{job.businessAddress}</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{job.employerPhone} (Contact: {job.employerName})</span>
                </div>
                {job.employerEmail && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{job.employerEmail}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Safety & Malpractice Notice + Report Link */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero-fee guarantee: Verified employers never request advance charges.</span>
            </div>
            <button
              onClick={() => setReportListingModalJob(job)}
              className="text-slate-400 hover:text-rose-400 text-xs underline font-medium transition"
            >
              Report this listing
            </button>
          </div>
        </div>

        {/* Modal Sticky Bottom Action Bar */}
        <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4 border-t border-[#1F293D] bg-[#0B0F17] shrink-0 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
              Direct Payout
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-white">{paymentFormatted}</span>
              <span className="text-xs text-slate-400">{paymentUnit}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasApplied ? (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Application {userApplication.status.toUpperCase()}</span>
              </div>
            ) : (
              <button
                onClick={() => onApply(job)}
                className="px-7 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm shadow-md shadow-cyan-400/25 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Accept Shift
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
