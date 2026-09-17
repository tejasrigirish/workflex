import React, { useState, useRef } from 'react';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../data/categories';
import { JobCategory, PaymentType, DurationType, WorkType, ShiftTiming } from '../../types/job';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Building,
  Upload,
  MapPin,
  Loader2,
  ArrowRight,
  Camera
} from 'lucide-react';
import {
  CITY_COORDINATES,
  getCityCoordinates,
  isValidCoordinate,
  sanitizeCoordinates,
} from '../../constants/cities';

interface PostJobModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_WORKPLACE_PHOTOS = [
  { label: 'Retail & Grocery', url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cafe & Roastery', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bookstore & Stationery', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80' },
  { label: 'Logistics & Warehouse', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Boutique & Lifestyle', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Tutoring & Study Center', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80' },
];

export const PostJobModal: React.FC<PostJobModalProps> = ({ onClose, onSuccess }) => {
  const { postJob, updateFilter } = useJobs();
  const { user, role } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (role !== 'employer') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-[#0D1526] border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-3 font-bold text-xl">
            ✕
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Employer Access Only</h3>
          <p className="text-slate-400 text-xs mb-6 leading-relaxed">
            Students cannot post jobs. Only verified employers are authorized to post shifts and hire students.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-cyan-500/20"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<JobCategory>('Retail');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Assist counter operations and customer checkouts',
    'Keep stock shelves organized and verified'
  ]);
  const [newResp, setNewResp] = useState('');
  const [skills, setSkills] = useState<string[]>(['Punctuality', 'Basic Math / UPI Billing']);
  const [newSkill, setNewSkill] = useState('');

  const [paymentAmount, setPaymentAmount] = useState<number>(500);
  const [paymentType, setPaymentType] = useState<PaymentType>('per_day');
  const [durationText, setDurationText] = useState('4 hours / day');
  const [workingHoursText, setWorkingHoursText] = useState('5:30 PM – 9:30 PM');
  const [timing, setTiming] = useState<ShiftTiming>('evening');
  const [duration, setDuration] = useState<DurationType>('1_day');
  const [workType, setWorkType] = useState<WorkType>('part_time');
  const [workersNeeded, setWorkersNeeded] = useState<number>(2);

  // Business Location & Real Coordinates
  const [businessName, setBusinessName] = useState(user?.employerData?.businessName || user?.name || '');
  const [employerPhone, setEmployerPhone] = useState(user?.phone || user?.employerData?.phone || '');
  const [city, setCity] = useState(user?.employerData?.city || 'Bengaluru');
  const [businessAddress, setBusinessAddress] = useState(user?.employerData?.businessAddress || '');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>(() => {
    const defaultCoords = getCityCoordinates(user?.employerData?.city || 'Bengaluru');
    return { lat: defaultCoords.lat, lng: defaultCoords.lng };
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeSuccess, setGeocodeSuccess] = useState(false);

  // Photo
  const [selectedPhoto, setSelectedPhoto] = useState<string>(PRESET_WORKPLACE_PHOTOS[0].url);

  // Real File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Real-world Geocoding for Address via Nominatim
  const handleGeocodeAddress = async () => {
    if (!businessAddress.trim()) return;
    setIsGeocoding(true);
    setGeocodeSuccess(false);

    try {
      const query = `${businessAddress}, ${city}, India`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const parsedLat = parseFloat(data[0].lat);
        const parsedLng = parseFloat(data[0].lon);
        if (isValidCoordinate(parsedLat, parsedLng)) {
          setCoordinates({
            lat: parsedLat,
            lng: parsedLng,
          });
          setGeocodeSuccess(true);
        } else {
          const cityCoord = getCityCoordinates(city);
          setCoordinates({
            lat: cityCoord.lat,
            lng: cityCoord.lng,
          });
          setGeocodeSuccess(true);
        }
      } else {
        const cityCoord = getCityCoordinates(city);
        setCoordinates({
          lat: cityCoord.lat,
          lng: cityCoord.lng,
        });
        setGeocodeSuccess(true);
      }
    } catch {
      const cityCoord = getCityCoordinates(city);
      setCoordinates({
        lat: cityCoord.lat,
        lng: cityCoord.lng,
      });
      setGeocodeSuccess(true);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleAddResponsibility = () => {
    if (newResp.trim()) {
      setResponsibilities([...responsibilities, newResp.trim()]);
      setNewResp('');
    }
  };

  const handleRemoveResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    // Validate 10-digit contact mobile number
    const digits = employerPhone.replace(/\D/g, '');
    const cleanPhone = digits.length === 12 && digits.startsWith('91')
      ? digits.slice(2)
      : (digits.length === 11 && digits.startsWith('0') ? digits.slice(1) : digits);

    if (!/^\d{10}$/.test(cleanPhone)) {
      setErrorMsg('Please enter a valid 10-digit contact mobile number so applicants can reach you.');
      setStep('form');
      return;
    }

    if (!businessAddress.trim()) {
      setErrorMsg('Please enter the physical business street address / landmark.');
      setStep('form');
      return;
    }

    if (!isValidCoordinate(coordinates.lat, coordinates.lng)) {
      setErrorMsg('Invalid map coordinates. Please choose a valid city or geocode the address.');
      setStep('form');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const ok = await postJob({
        title: title || 'Store Part-Time Assistant',
        businessName: businessName || user?.name || 'Local Business',
        employerId: user?.id || 'emp-user',
        employerName: user?.name || 'Store Owner',
        employerPhone: cleanPhone,
        employerEmail: user?.email || '',
        isVerifiedBusiness: true,
        businessDescription: `Local business operating in ${city}.`,
        businessAddress,
        city,
        coordinates,
        distanceKm: 1.2,
        category,
        workType,
        paymentAmount: Number(paymentAmount),
        paymentType,
        duration,
        durationText,
        timing,
        workingHoursText,
        startDate: 'Immediate',
        shortDescription: shortDescription || 'Help out at our local business during peak shift hours.',
        fullDescription: fullDescription || 'We are looking for a reliable college student to assist our operations. Honest work, verified pay, and friendly atmosphere.',
        responsibilities,
        requiredSkills: skills,
        workersNeeded: Number(workersNeeded),
        workplaceImages: [selectedPhoto],
      });

      if (ok) {
        updateFilter('city', city);
        onSuccess();
      } else {
        setErrorMsg('Failed to post job. Please verify your details.');
      }
    } catch (err: any) {
      console.error('Job post error:', err);
      setErrorMsg(err.message || 'Error publishing job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0D121D] border border-slate-700/60 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 text-slate-100 max-h-[90dvh] sm:max-h-[92vh] my-auto flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Post a Part-Time Shift</h2>
              <p className="text-xs text-slate-400">Your job listing will drop an active pin directly on the interactive map</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto py-4 space-y-6 flex-1 pr-1 text-xs">
          {step === 'form' ? (
            <form
              id="post-job-form"
              onSubmit={(e) => {
                e.preventDefault();
                const digits = employerPhone.replace(/\D/g, '');
                const cleanPhone = digits.length === 12 && digits.startsWith('91')
                  ? digits.slice(2)
                  : (digits.length === 11 && digits.startsWith('0') ? digits.slice(1) : digits);
                if (!/^\d{10}$/.test(cleanPhone)) {
                  setErrorMsg('Please enter a valid 10-digit mobile number so students can contact you.');
                  return;
                }
                if (!businessAddress.trim()) {
                  setErrorMsg('Please enter the street address / landmark.');
                  return;
                }
                if (!isValidCoordinate(coordinates.lat, coordinates.lng)) {
                  setErrorMsg('Please select a valid city or geocode the address.');
                  return;
                }
                setErrorMsg(null);
                setStep('preview');
              }}
              className="space-y-6"
            >
              {errorMsg && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center justify-between">
                  <span>{errorMsg}</span>
                  <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white font-bold ml-2">✕</button>
                </div>
              )}
              {/* 1. Job Role */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  1. Shift Title & Category
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Job Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Evening Cashier & Order Packing"
                      className="w-full bg-[#141A28] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Job Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as JobCategory)}
                      className="w-full bg-[#141A28] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#0D121D]">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Short Description (Visible on Pin Card) *</label>
                  <input
                    type="text"
                    required
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="e.g. Assist in packing orders and counter checkout during evening rush..."
                    className="w-full bg-[#141A28] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Detailed Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    placeholder="Describe tasks, student perks, and environment..."
                    className="w-full bg-[#141A28] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* 2. Compensation & Timing */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  2. Payment & Shift Hours
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Pay Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min={100}
                      step={50}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full bg-[#141A28] border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Payment Frequency *</label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                      className="w-full bg-[#141A28] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                    >
                      <option value="per_day" className="bg-[#0D121D]">Per Day</option>
                      <option value="per_hour" className="bg-[#0D121D]">Per Hour</option>
                      <option value="per_task" className="bg-[#0D121D]">Per Task</option>
                      <option value="per_month" className="bg-[#0D121D]">Per Month</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Shift Duration *</label>
                    <input
                      type="text"
                      required
                      value={durationText}
                      onChange={(e) => setDurationText(e.target.value)}
                      placeholder="e.g. 4 hours / day"
                      className="w-full bg-[#141A28] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Working Hours *</label>
                    <input
                      type="text"
                      required
                      value={workingHoursText}
                      onChange={(e) => setWorkingHoursText(e.target.value)}
                      placeholder="e.g. 5:30 PM – 9:30 PM"
                      className="w-full bg-[#141A28] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Timing Period</label>
                    <select
                      value={timing}
                      onChange={(e) => setTiming(e.target.value as ShiftTiming)}
                      className="w-full bg-[#141A28] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                    >
                      <option value="morning" className="bg-[#0D121D]">Morning</option>
                      <option value="afternoon" className="bg-[#0D121D]">Afternoon</option>
                      <option value="evening" className="bg-[#0D121D]">Evening</option>
                      <option value="night" className="bg-[#0D121D]">Night</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Workers Needed *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={20}
                      value={workersNeeded}
                      onChange={(e) => setWorkersNeeded(Number(e.target.value))}
                      className="w-full bg-[#141A28] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Real Location & Geocoding */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>3. Map Location & Shop Details</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Pins to OpenStreetMap coordinates
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Shop / Business Name *</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-[#141A28] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">City *</label>
                    <select
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        const c = getCityCoordinates(e.target.value);
                        setCoordinates({ lat: c.lat, lng: c.lng });
                      }}
                      className="w-full bg-[#141A28] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
                    >
                      {Object.keys(CITY_COORDINATES).map((c) => (
                        <option key={c} value={c} className="bg-[#0D121D]">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-semibold">Employer Contact Phone *</label>
                      <span className="text-[10px] text-cyan-400 font-medium">10-Digit Mobile</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={employerPhone}
                      onChange={(e) => {
                        setEmployerPhone(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder="e.g. 9845012345"
                      className="w-full bg-[#141A28] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Applicants will call this phone number directly to accept shifts
                    </span>
                  </div>
                </div>

                {/* Address & Geocode Button */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Physical Street Address / Landmark *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="e.g. 55, 100 Feet Rd, Indiranagar"
                      className="flex-1 bg-[#141A28] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={handleGeocodeAddress}
                      disabled={isGeocoding}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0"
                    >
                      {isGeocoding ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Pinning...</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Geocode Pin</span>
                        </>
                      )}
                    </button>
                  </div>

                  {geocodeSuccess && (
                    <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Pinned at coordinates: [{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}]</span>
                    </p>
                  )}
                </div>
              </div>

              {/* 4. Real Image Upload or Preset */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>4. Workplace Photograph</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">Upload your own photo or pick a sample</span>
                </div>

                {/* Upload File Input */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#141A28] border border-slate-800 rounded-2xl p-4">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                    <img src={selectedPhoto} alt="Selected workplace" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-pink-400" />
                      <span>Upload Photo From Device</span>
                    </button>
                    <p className="text-[10px] text-slate-500">Supports JPG, PNG from your camera or gallery</p>
                  </div>
                </div>

                {/* Presets */}
                <div>
                  <span className="text-slate-400 text-[11px] font-semibold block mb-1.5">Or choose a realistic workplace style:</span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_WORKPLACE_PHOTOS.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedPhoto(p.url)}
                        className={`relative rounded-xl overflow-hidden border-2 h-14 transition ${
                          selectedPhoto === p.url ? 'border-emerald-400' : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 p-1 flex items-end">
                          <span className="text-[8px] font-bold text-white truncate">{p.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Step 2: Live Preview */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  Review your listing before publishing to the live map:
                </span>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-xs text-indigo-400 hover:underline font-semibold"
                >
                  ← Edit details
                </button>
              </div>

              {/* Preview Card */}
              <div className="bg-[#141A28] border border-emerald-500/40 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="relative h-48 w-full rounded-2xl overflow-hidden">
                  <img src={selectedPhoto} alt="Workplace preview" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs font-bold text-emerald-300 border border-white/10">
                    {category}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-xl font-extrabold text-emerald-400">
                      ₹{paymentAmount}
                    </span>
                    <span className="text-xs text-slate-300 ml-1">
                      {paymentType === 'per_hour' ? '/ hr' : '/ day'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400">{businessName} • {city}</span>
                  <h3 className="text-xl font-black text-white mt-1">{title || 'Store Assistant'}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{shortDescription}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                  <div>Shift: <strong className="text-white">{workingHoursText}</strong></div>
                  <div>Workers: <strong className="text-white">{workersNeeded}</strong></div>
                  <div>Phone: <strong className="text-emerald-400">+91 {employerPhone.replace(/\D/g, '').slice(-10)}</strong></div>
                  <div>Map Pin: <strong className="text-emerald-400">{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Action Bar */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          {step === 'form' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="post-job-form"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs shadow-md shadow-cyan-400/20 transition cursor-pointer"
              >
                <span>Preview Listing</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
              >
                Back to Edit
              </button>
              {errorMsg && (
                <div className="w-full text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl mb-2">
                  {errorMsg}
                </div>
              )}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit()}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs shadow-md shadow-cyan-400/25 transition transform hover:scale-105 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Publishing Shift Listing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Publish to Map</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
