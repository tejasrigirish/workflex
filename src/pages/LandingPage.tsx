import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../data/categories';
import { JobCard } from '../components/jobs/JobCard';
import { JobListing, JobCategory } from '../types/job';
import { CITY_COORDINATES } from '../constants/cities';
import {
  Compass,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  MapPin,
  Building,
  GraduationCap,
  Wallet,
  Users,
  AlertCircle,
  Search,
  Navigation,
  Check
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToDiscovery: () => void;
  onOpenPostJob: () => void;
  onViewJobDetails: (job: JobListing) => void;
  onSelectCategory: (cat: JobCategory) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToDiscovery,
  onOpenPostJob,
  onViewJobDetails,
  onSelectCategory,
}) => {
  const { jobs, setSelectedJob, updateFilter, filters } = useJobs();
  const { role } = useAuth();
  const [heroSearch, setHeroSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(filters.city || 'Bengaluru');

  const previewJobs = jobs.slice(0, 4);
  const featuredJob = jobs[0];

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      updateFilter('searchQuery', heroSearch.trim());
    }
    if (selectedCity) {
      updateFilter('city', selectedCity);
    }
    onNavigateToDiscovery();
  };

  return (
    <div className="relative z-10 text-slate-100 space-y-20 sm:space-y-28 pb-24">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-8 px-4 sm:px-6 max-w-6xl mx-auto text-center space-y-8">
        {/* Subtle trust badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-card-static text-xs font-semibold text-slate-300 shadow-lg mx-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span className="text-slate-300">100% Verified Local Store Shifts</span>
          <span className="text-slate-600">•</span>
          <span className="text-[#BAE6FD] font-semibold">Zero Agency Middlemen</span>
        </div>

        {/* Hero Title with Mixed Typography in Soft Pastel Gradient */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Find work that <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#BAE6FD] via-[#DDD6FE] to-[#FBCFE8] bg-clip-text text-transparent font-black">
              fits your life.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300/90 max-w-2xl mx-auto leading-relaxed font-normal">
            Discover short-term and part-time opportunities around you. Earn reliably around college classes and personal commitments.
          </p>
        </div>

        {/* Primary & Secondary Floating 3D CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onNavigateToDiscovery}
            className="w-full sm:w-auto btn-floating-primary flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-base font-bold cursor-pointer"
          >
            <Compass className="w-5 h-5 text-slate-900" />
            <span>Find Jobs Near Me</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>

          {role !== 'student' && (
            <button
              onClick={onOpenPostJob}
              className="w-full sm:w-auto btn-floating-glass flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold text-slate-200 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#BAE6FD]" />
              <span>Post a Job</span>
            </button>
          )}
        </div>

        {/* Trust summary strip with soft pastel icons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="glass-icon-box w-6 h-6 rounded-lg text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span>Physical Store Verification</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="glass-icon-box w-6 h-6 rounded-lg text-[#BAE6FD]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span>Direct Payouts (UPI or Cash)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="glass-icon-box w-6 h-6 rounded-lg text-amber-200">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span>Flexible Evening & Weekend Hours</span>
          </div>
        </div>

        {/* HERO PRODUCT SHOWCASE: Interactive Discovery Preview */}
        <div className="pt-8">
          <div className="glass-card-static rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl border border-white/10 text-left max-w-5xl mx-auto">
            {/* Interactive Search Bar in Showcase */}
            <form onSubmit={handleHeroSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search barista, tutor, retail assistant, event crew..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700/70 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#BAE6FD]/70 transition"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-44">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <MapPin className="w-3.5 h-3.5 text-rose-300" />
                  </div>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full pl-9 pr-8 py-3 rounded-2xl bg-slate-900/80 border border-slate-700/70 text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#BAE6FD]/70 transition cursor-pointer appearance-none"
                  >
                    {Object.keys(CITY_COORDINATES).map((c) => (
                      <option key={c} value={c} className="bg-[#0D121D] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn-floating-primary shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold cursor-pointer"
                >
                  <span>Search Shifts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Split Product Discovery: Real Card Preview + Live Map Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
              {/* Left: Real Job Card from SQLite */}
              <div className="lg:col-span-7 glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-300/30 text-emerald-300 font-bold text-[10px] uppercase">
                      Live Listing
                    </span>
                    <span className="text-slate-400 text-[11px]">• Instant Hire</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Verified Employer</span>
                </div>

                {featuredJob ? (
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                          {featuredJob.title}
                        </h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-[#BAE6FD]" />
                          <span>{featuredJob.businessName}</span>
                          <span>•</span>
                          <span className="text-rose-300 font-medium">
                            {featuredJob.distanceKm ? `${featuredJob.distanceKm} km away` : featuredJob.city}
                          </span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base sm:text-lg font-extrabold text-[#BAE6FD]">
                          ₹{featuredJob.paymentAmount}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">per shift</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300/80 line-clamp-2 leading-relaxed">
                      {featuredJob.shortDescription}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-amber-200" />
                        <span>{featuredJob.workingHoursText}</span>
                      </div>

                      <button
                        onClick={() => onViewJobDetails(featuredJob)}
                        className="btn-floating-glass py-1.5 px-3.5 rounded-xl text-xs font-semibold text-slate-200 cursor-pointer"
                      >
                        Preview Shift →
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-6">Loading opportunities...</p>
                )}
              </div>

              {/* Right: Live Map Radius Preview with Pastel Aura */}
              <div
                onClick={onNavigateToDiscovery}
                className="lg:col-span-5 glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4 cursor-pointer group hover:border-[#BAE6FD]/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="glass-icon-box w-7 h-7 rounded-lg text-[#BAE6FD]">
                      <Navigation className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white">Interactive Radius Map</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#BAE6FD]/15 border border-[#BAE6FD]/30 text-[#BAE6FD] font-bold">
                    Live
                  </span>
                </div>

                {/* Visual Map Radar Simulation */}
                <div className="relative h-28 w-full rounded-xl bg-slate-950/70 border border-slate-800 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(186,230,253,0.18)_0,transparent_70%)]" />
                  {/* Concentric radar rings */}
                  <div className="absolute w-20 h-20 rounded-full border border-[#BAE6FD]/20 animate-ping opacity-30" />
                  <div className="absolute w-32 h-32 rounded-full border border-[#BAE6FD]/20" />
                  <div className="absolute w-16 h-16 rounded-full border border-[#BAE6FD]/35" />

                  {/* Center pin: You */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-[#BAE6FD] shadow-[0_0_12px_rgba(186,230,253,0.8)]" />
                    <span className="text-[9px] text-[#BAE6FD] font-bold mt-1">Campus Center</span>
                  </div>

                  {/* Surrounding pastel pill markers */}
                  <div className="absolute top-3 left-4 px-2 py-0.5 rounded-md bg-slate-900/90 border border-[#BAE6FD]/40 text-[10px] font-bold text-[#BAE6FD] shadow-md">
                    ₹600
                  </div>
                  <div className="absolute bottom-3 right-5 px-2 py-0.5 rounded-md bg-slate-900/90 border border-emerald-300/40 text-[10px] font-bold text-emerald-300 shadow-md">
                    ₹850
                  </div>
                  <div className="absolute top-4 right-6 px-2 py-0.5 rounded-md bg-slate-900/90 border border-[#DDD6FE]/40 text-[10px] font-bold text-[#DDD6FE] shadow-md">
                    ₹1,200
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    <strong className="text-white">{jobs.length} shifts</strong> nearby in {selectedCity}
                  </span>
                  <span className="text-[#BAE6FD] font-bold text-xs group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Open Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Opportunities Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
              Recent Postings
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
              Nearby Opportunities
            </h2>
          </div>

          <button
            onClick={onNavigateToDiscovery}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-[#BAE6FD] transition self-start sm:self-auto cursor-pointer"
          >
            <span>Browse All {jobs.length} Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {previewJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSelect={(j) => setSelectedJob(j)}
              onViewDetails={(j) => onViewJobDetails(j)}
            />
          ))}
        </div>
      </section>

      {/* Popular Job Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
            Explore Work Categories
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Work That Matches Your Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From cafe floor service to exam tutoring, choose what fits your free hours
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const count = jobs.filter((j) => j.category === cat.id).length;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onNavigateToDiscovery();
                }}
                className="glass-card rounded-2xl p-4 sm:p-5 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="glass-icon-box w-8 h-8 rounded-xl text-[#BAE6FD] group-hover:scale-105 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 font-semibold group-hover:text-white group-hover:border-[#BAE6FD]/30 transition-all">
                    {count} jobs
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#BAE6FD] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-1">
                    {cat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works (For Students & For Employers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
            Clear & Simple Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How WorkFlex Operates
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* For Students */}
          <div className="glass-card-static rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="glass-icon-box w-10 h-10 rounded-xl text-emerald-300">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">For Students & Workers</h3>
                <p className="text-xs text-slate-400">Earn legitimately around your college timetable</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-2xl space-y-2">
                <span className="text-xs font-black text-emerald-300">01</span>
                <h4 className="text-xs font-bold text-white">Create your profile</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Add your college details, skills, and free hours (evenings or weekends).
                </p>
              </div>

              <div className="glass-card p-4 rounded-2xl space-y-2">
                <span className="text-xs font-black text-emerald-300">02</span>
                <h4 className="text-xs font-bold text-white">Discover nearby jobs</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Explore verified listings on the split-screen map within your neighborhood radius.
                </p>
              </div>

              <div className="glass-card p-4 rounded-2xl space-y-2">
                <span className="text-xs font-black text-emerald-300">03</span>
                <h4 className="text-xs font-bold text-white">Apply & get selected</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Submit with one tap. The shopkeeper reviews your availability and accepts your shift.
                </p>
              </div>

              <div className="glass-card p-4 rounded-2xl space-y-2">
                <span className="text-xs font-black text-emerald-300">04</span>
                <h4 className="text-xs font-bold text-white">Complete work & get paid</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Finish the shift and receive direct UPI payment or cash with a recorded ledger receipt.
                </p>
              </div>
            </div>
          </div>

          {/* For Employers */}
          <div className="glass-card-static rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="glass-icon-box w-10 h-10 rounded-xl text-[#BAE6FD]">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">For Shopkeepers & Employers</h3>
                <p className="text-xs text-slate-400">Reliable help when peak customer hours hit</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-2xl space-y-2">
                <span className="text-xs font-black text-[#BAE6FD]">01</span>
                <h4 className="text-xs font-bold text-white">Post a requirement</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Specify shift hours, transparent compensation, and number of helpers needed.
                </p>
              </div>

              <div className="glass-card p-4 rounded-2xl space-y-2">
                <span className="text-xs font-black text-[#BAE6FD]">02</span>
                <h4 className="text-xs font-bold text-white">Find suitable students</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Instantly reach energetic college students located within 1-5 km of your store.
                </p>
              </div>

              <div className="glass-card p-4 rounded-2xl space-y-2">
                <span className="text-xs font-black text-[#BAE6FD]">03</span>
                <h4 className="text-xs font-bold text-white">Select a worker</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Inspect student profiles, past shift reviews, and accept the best candidate.
                </p>
              </div>

              <div className="glass-card p-4 rounded-2xl space-y-2">
                <span className="text-xs font-black text-[#BAE6FD]">04</span>
                <h4 className="text-xs font-bold text-white">Complete the gig</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Mark the gig completed and build a trustworthy local pool of recurring helpers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="glass-card-static rounded-3xl p-8 sm:p-12 space-y-8 shadow-2xl border border-white/10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
              Safety & Verification
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              A Platform Built on Legitimate Trust
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Misleading listings, fake data entry scams, and advance fee demands have ruined online student employment. WorkFlex was engineered from the ground up to eradicate malpractice.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="glass-icon-box w-9 h-9 rounded-xl text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Zero Upfront Fees Guarantee</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                No employer is ever allowed to ask for registration, security deposit, or uniform fees. Any violation results in immediate permanent blacklisting.
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="glass-icon-box w-9 h-9 rounded-xl text-[#BAE6FD]">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Physical Workplace Verification</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every listing displays transparent photographs of the counter, store interior, and landmark so workers know exactly where they will work.
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="glass-icon-box w-9 h-9 rounded-xl text-rose-300">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">One-Tap Safety Reporting</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                If a shop conflicts with its listed hours or pay, any worker can file an immediate report reviewed by human moderators within 4 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Dual Card Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Benefits */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
            Why Students Prefer WorkFlex
          </span>
          <h3 className="text-xl font-extrabold text-white">Financial Independence & Practical Experience</h3>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <span>Earn ₹400 – ₹1,200 per shift to manage hostel rent, food, and daily expenses</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <span>Shifts strictly restricted to non-lecture hours (5pm-9:30pm or weekends)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <span>Walk or cycle to work — all opportunities mapped within 1-5 km radius</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <span>Verified digital work experience certificate for your resume</span>
            </li>
          </ul>
        </div>

        {/* Employer Benefits */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <span className="text-xs font-bold text-[#BAE6FD] uppercase tracking-wider">
            Why Neighborhood Shops Hire Here
          </span>
          <h3 className="text-xl font-extrabold text-white">Quick, Educated & Disciplined Staff</h3>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#BAE6FD] shrink-0 mt-0.5" />
              <span>Tech-literate college students who handle UPI, POS billing, and smartphones easily</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#BAE6FD] shrink-0 mt-0.5" />
              <span>Zero agency commission — you post directly and pay the student directly</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#BAE6FD] shrink-0 mt-0.5" />
              <span>Fill temporary rush hours (festival packing, weekend cafes) in under 2 hours</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#BAE6FD] shrink-0 mt-0.5" />
              <span>Verified student ID badges keep your store counter safe and trustworthy</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};
