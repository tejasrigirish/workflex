// src/context/JobContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { JobListing, FilterOptions } from '../types/job';
import { JobApplication, EarningRecord } from '../types/application';
import { AppNotification } from '../types/notification';
import { useAuth } from './AuthContext';
import { api, ApiJob, ApiApplication, ApiShift } from '../api/client';
import {
  CITY_COORDINATES,
  getCityCoordinates,
  isValidCoordinate,
  sanitizeCoordinates,
  extractJobCoordinates,
  parseCoordinate,
} from '../constants/cities';

export function calculateDistanceKm(
  lat1: unknown,
  lon1: unknown,
  lat2: unknown,
  lon2: unknown
): number | undefined {
  const pLat1 = parseCoordinate(lat1);
  const pLon1 = parseCoordinate(lon1);
  const pLat2 = parseCoordinate(lat2);
  const pLon2 = parseCoordinate(lon2);

  if (
    pLat1 === null ||
    pLon1 === null ||
    pLat2 === null ||
    pLon2 === null ||
    !isValidCoordinate(pLat1, pLon1) ||
    !isValidCoordinate(pLat2, pLon2)
  ) {
    return undefined;
  }

  const R = 6371; // km
  const dLat = (pLat2 - pLat1) * (Math.PI / 180);
  const dLon = (pLon2 - pLon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pLat1 * (Math.PI / 180)) * Math.cos(pLat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = Math.round((R * c) * 10) / 10;
  return Number.isFinite(dist) ? dist : undefined;
}

export const DEFAULT_FILTERS: FilterOptions = {
  searchQuery: '',
  categories: [],
  city: 'Bengaluru',
  paymentSort: 'none',
  maxDistanceKm: 15,
  distanceSort: false,
  duration: 'all',
  workType: 'all',
  timing: 'all',
  minPay: 0,
  maxPay: 10000,
  sortBy: 'relevant',
  durations: [],
  shiftTimings: [],
  verifiedOnly: false,
};


interface JobContextType {
  jobs: JobListing[];
  filteredJobs: JobListing[];
  filters: FilterOptions;
  updateFilter: <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => void;
  clearFilters: () => void;
  selectedJob: JobListing | null;
  setSelectedJob: (job: JobListing | null) => void;
  activeModalJob: JobListing | null;
  setActiveModalJob: (job: JobListing | null) => void;
  applyModalJob: JobListing | null;
  setApplyModalJob: (job: JobListing | null) => void;
  reportListingModalJob: JobListing | null;
  setReportListingModalJob: (job: JobListing | null) => void;
  savedJobIds: string[];
  toggleSaveJob: (jobId: string) => void;
  applications: JobApplication[];
  applyForJob: (jobId: string, message?: string) => Promise<boolean>;
  acceptApplication: (applicationId: string) => Promise<void>;
  rejectApplication: (applicationId: string) => Promise<void>;
  markApplicationCompleted: (applicationId: string) => Promise<void>;
  earnings: EarningRecord[];
  totalEarnings: number;
  thisMonthEarnings: number;
  pendingEarnings: number;
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  markAllNotificationsRead: () => void;
  unreadNotificationsCount: number;
  postJob: (jobData: any) => Promise<boolean>;
  deleteJob: (jobId: string) => Promise<boolean>;
  clearJob: (jobId: string) => Promise<boolean>;
  submitReport: (jobId: string, reason: string, details: string) => void;
  refreshData: () => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

function mapApiJobToJobListing(apiJob: ApiJob): JobListing {
  const salaryVal = Number(apiJob.salary) || 0;
  const directCoord = extractJobCoordinates({
    lat: apiJob.latitude,
    lng: apiJob.longitude,
    ...(apiJob as any).coordinates,
  });
  const hasValidCoordinates = directCoord !== null;
  // If coordinates are invalid, mark clearly rather than fabricating fake coordinates
  const safeCoords = directCoord || { lat: 0, lng: 0 };
  return {
    id: apiJob.id || `job_${Math.random()}`,
    title: apiJob.title || 'Flexible Shift',
    businessName: apiJob.businessName || 'Local Business',
    employerId: apiJob.employerId || '',
    employerName: apiJob.businessName || 'Verified Employer',
    employerPhone: apiJob.employerPhone || (apiJob as any).employer_phone || '',
    isVerifiedBusiness: !!apiJob.isVerifiedBusiness,
    businessDescription: apiJob.description || '',
    businessAddress: apiJob.address || `${apiJob.city || 'Bengaluru'}, India`,
    city: apiJob.city || 'Bengaluru',
    coordinates: safeCoords,
    hasValidCoordinates,
    category: (apiJob.category || 'Retail') as any,
    workType: 'part_time',
    paymentAmount: salaryVal,
    paymentType: apiJob.salaryType === 'hourly' ? 'per_hour' : 'per_day',
    duration: 'few_hours',
    durationText: apiJob.durationText || `${apiJob.startTime || '05:00 PM'} - ${apiJob.endTime || '09:00 PM'}`,
    timing: 'evening',
    workingHoursText: apiJob.workingHoursText || '4 Hours/Shift',
    startDate: apiJob.date || 'Flexible',
    shortDescription: apiJob.shortDescription || apiJob.description || 'Flexible part-time shift.',
    fullDescription: apiJob.fullDescription || apiJob.description || 'Flexible part-time shift with verified direct payment.',
    responsibilities: Array.isArray(apiJob.responsibilities) ? apiJob.responsibilities : [],
    requiredSkills: Array.isArray(apiJob.requiredSkills) ? apiJob.requiredSkills : [],
    workersNeeded: Number(apiJob.numberOfWorkers) || 1,
    workersSelected: 0,
    workplaceImages: apiJob.workplacePhotos || (apiJob.photoUrl ? [apiJob.photoUrl] : []),
    postedDate: apiJob.postedDate || 'Today',
    status: (apiJob.status === 'open' ? 'active' : apiJob.status || 'active') as 'active' | 'filled' | 'completed' | 'cancelled',
    payment: {
      amount: salaryVal,
      frequency: apiJob.salaryType === 'hourly' ? 'hourly' : 'daily',
      currency: '₹',
      isNegotiable: false,
    },
    locality: apiJob.locality || apiJob.city || 'Bengaluru',
    address: apiJob.address || `${apiJob.city || 'Bengaluru'}, India`,
    businessType: apiJob.businessType || 'Local Store',
  };
}

function mapApiApplicationToJobApplication(apiApp: ApiApplication): JobApplication {
  return {
    id: apiApp.id,
    jobId: apiApp.jobId,
    studentId: apiApp.studentId,
    studentName: apiApp.applicantName,
    studentEmail: apiApp.applicantEmail,
    studentPhone: apiApp.applicantPhone,
    studentCollege: apiApp.applicantCollege,
    studentAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(apiApp.applicantName)}`,
    studentSkills: apiApp.applicantSkills || [],
    appliedAt: apiApp.appliedAt,
    status: (apiApp.status === 'withdrawn' ? 'rejected' : apiApp.status) as any,
    coverNote: apiApp.message,
    jobTitle: apiApp.jobTitle,
    businessName: apiApp.businessName,
    jobSalary: apiApp.jobSalary,
    paidAmount: apiApp.jobSalary,
    paidAt: apiApp.updatedAt,
  };
}

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();

  // Pure real-data state: Initially empty
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [shifts, setShifts] = useState<ApiShift[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('workflex_saved_jobs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [activeModalJob, setActiveModalJob] = useState<JobListing | null>(null);
  const [applyModalJob, setApplyModalJob] = useState<JobListing | null>(null);
  const [reportListingModalJob, setReportListingModalJob] = useState<JobListing | null>(null);

  // Save saved job IDs to local storage
  useEffect(() => {
    try {
      localStorage.setItem('workflex_saved_jobs', JSON.stringify(savedJobIds));
    } catch {}
  }, [savedJobIds]);

  // Fetch real data from SQLite backend
  const refreshData = useCallback(async () => {
    try {
      // 1. Fetch real jobs for public discovery
      const jobsRes = await api.getJobs();
      let allJobs: ApiJob[] = (jobsRes.success && jobsRes.jobs) ? [...jobsRes.jobs] : [];

      // If user is an employer, also fetch all their postings (including filled/completed) so they can manage their listings
      if (user && role === 'employer') {
        const empId = user.employerData?.id || user.id;
        const empJobsRes = await api.getJobs({ employerId: empId });
        if (empJobsRes.success && empJobsRes.jobs) {
          const map = new Map<string, ApiJob>();
          allJobs.forEach(j => map.set(j.id, j));
          empJobsRes.jobs.forEach(j => map.set(j.id, j));
          allJobs = Array.from(map.values());
        }
      }

      setJobs(allJobs.map(mapApiJobToJobListing));

      // 2. Fetch applications if authenticated
      if (user) {
        const queryParams =
          role === 'employer'
            ? { employerId: user.id }
            : { studentId: user.id };
        const appRes = await api.getApplications(queryParams);
        if (appRes.success && appRes.applications) {
          setApplications(appRes.applications.map(mapApiApplicationToJobApplication));
        }

        // 3. Fetch shifts
        const shiftRes = await api.getShifts(queryParams);
        if (shiftRes.success && shiftRes.shifts) {
          setShifts(shiftRes.shifts);
        }
      } else {
        setApplications([]);
        setShifts([]);
      }
    } catch (err) {
      console.error('Error fetching data from backend:', err);
    }
  }, [user, role]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Earning records computed purely from real completed shifts
  const earnings: EarningRecord[] = useMemo(() => {
    try {
      return (shifts || []).map(s => {
        if (!s) return null;
        let formattedDate = 'Recent';
        if (s.completed_at) {
          const d = new Date(s.completed_at);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          }
        }
        return {
          id: s.id || `shift_${Math.random()}`,
          jobId: s.job_id || '',
          jobTitle: s.job_title || 'Completed Shift',
          businessName: s.business_name || 'Verified Employer',
          amount: Number(s.amount) || 0,
          completedDate: formattedDate,
          status: 'paid',
          receiptNumber: `RCP-${(s.id || '').slice(-6).toUpperCase()}`,
        };
      }).filter(Boolean) as EarningRecord[];
    } catch {
      return [];
    }
  }, [shifts]);

  const totalEarnings = useMemo(() => {
    try {
      return (earnings || []).reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0);
    } catch {
      return 0;
    }
  }, [earnings]);

  const thisMonthEarnings = totalEarnings;
  const pendingEarnings = 0;

  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'sortBy') {
        if (value === 'highest_pay') next.paymentSort = 'high_to_low';
        else if (value === 'lowest_pay') next.paymentSort = 'low_to_high';
        else next.paymentSort = 'none';
      } else if (key === 'paymentSort') {
        if (value === 'high_to_low') next.sortBy = 'highest_pay';
        else if (value === 'low_to_high') next.sortBy = 'lowest_pay';
      }
      return next;
    });
  };

  const clearFilters = () => {
    setFilters(prev => ({
      ...DEFAULT_FILTERS,
      city: prev.city,
    }));
  };


  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  // Real job posting
  const postJob = async (jobData: any): Promise<boolean> => {
    if (!user) throw new Error('You must be signed in as an employer to post a job');
    if (role !== 'employer') {
      throw new Error('Access denied: Students cannot post jobs. Only registered employers can post shifts.');
    }

    try {
      const jobCity = jobData.city || jobData.locality || 'Bengaluru';
      const parsedCoords = extractJobCoordinates({
        lat: jobData.coordinates?.lat ?? jobData.latitude,
        lng: jobData.coordinates?.lng ?? jobData.longitude,
      });
      const safeCoords = parsedCoords || getCityCoordinates(jobCity);

      const res = await api.postJob({
        employerId: user.employerData?.id || user.id,
        title: jobData.title,
        description: jobData.fullDescription || jobData.shortDescription || jobData.description,
        category: jobData.category,
        salary: Number(jobData.payment?.amount || jobData.paymentAmount || jobData.salary || 500),
        salaryType: jobData.payment?.frequency || jobData.paymentType || 'daily',
        date: jobData.date || jobData.startDate || 'Flexible',
        startTime: jobData.startTime || '05:00 PM',
        endTime: jobData.endTime || '09:00 PM',
        address: jobData.address || jobData.businessAddress || `${jobCity}, Karnataka`,
        locality: jobData.locality || jobCity,
        city: jobCity,
        latitude: safeCoords.lat,
        longitude: safeCoords.lng,
        numberOfWorkers: jobData.workersNeeded || jobData.numberOfWorkers || 1,
        photoUrl: jobData.workplacePhotos?.[0] || jobData.workplaceImages?.[0] || jobData.photoUrl || '',
        employerPhone: jobData.employerPhone || user.phone || user.employerData?.phone || '',
        responsibilities: jobData.responsibilities || [],
        requiredSkills: jobData.requiredSkills || [],
      });

      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to post job:', err);
      throw err;
    }
  };

  // Real application submission
  const applyForJob = async (jobId: string, message?: string): Promise<boolean> => {
    if (!user) throw new Error('Please sign in to apply for this job');

    try {
      const res = await api.submitApplication(
        jobId,
        user.studentData?.id || user.id,
        message || 'I am interested in this shift.'
      );

      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Failed to submit application:', err);
      throw err;
    }
  };

  // Accept student application
  const acceptApplication = async (applicationId: string): Promise<void> => {
    try {
      await api.updateApplicationStatus(applicationId, 'accepted');
      await refreshData();
    } catch (err) {
      console.error('Failed to accept application:', err);
    }
  };

  // Reject application
  const rejectApplication = async (applicationId: string): Promise<void> => {
    try {
      await api.updateApplicationStatus(applicationId, 'rejected');
      await refreshData();
    } catch (err) {
      console.error('Failed to reject application:', err);
    }
  };

  // Mark completed & pay
  const markApplicationCompleted = async (applicationId: string): Promise<void> => {
    try {
      await api.completeShift(applicationId);
      await refreshData();
    } catch (err) {
      console.error('Failed to mark shift completed:', err);
    }
  };

  // Delete / Clear Job Listing
  const deleteJob = async (jobId: string): Promise<boolean> => {
    try {
      const res = await api.deleteJob(jobId);
      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete/clear job:', err);
      return false;
    }
  };

  const clearJob = deleteJob;

  // Reporting
  const submitReport = (jobId: string, reason: string, details: string) => {
    console.log(`Report submitted for job ${jobId}: ${reason} - ${details}`);
    setReportListingModalJob(null);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markNotificationRead = markNotificationAsRead;

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markAllNotificationsRead = clearAllNotifications;

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Filtered and sorted jobs
  const filteredJobs = useMemo(() => {
    // Current reference coordinate (city center or default)
    const refCoords = getCityCoordinates(filters.city);

    // 1. Attach distance safely
    const withDistance = (jobs || [])
      .filter((j): j is JobListing => Boolean(j && j.id))
      .map(job => {
        const coords = extractJobCoordinates(job.coordinates);
        const hasValidCoordinates = coords !== null;
        let dist: number | undefined = undefined;
        if (hasValidCoordinates && coords) {
          dist = calculateDistanceKm(
            refCoords.lat,
            refCoords.lng,
            coords.lat,
            coords.lng
          );
        }
        return {
          ...job,
          hasValidCoordinates,
          coordinates: coords || (job.coordinates ? job.coordinates : { lat: 0, lng: 0 }),
          distanceKm: dist,
        };
      });

    // 2. Apply filtering
    const filtered = withDistance.filter(job => {
      // STRICT VISIBILITY: Only show active shifts
      if (job.status !== 'active') {
        return false;
      }

      // Search query
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchTitle = (job.title || '').toLowerCase().includes(query);
        const matchBusiness = (job.businessName || '').toLowerCase().includes(query);
        const matchCategory = (job.category || '').toLowerCase().includes(query);
        const matchAddress = (job.businessAddress || '').toLowerCase().includes(query);
        const matchLocality = (job.locality || '').toLowerCase().includes(query);
        const matchCity = (job.city || '').toLowerCase().includes(query);
        const matchShortDesc = (job.shortDescription || '').toLowerCase().includes(query);
        const matchFullDesc = (job.fullDescription || '').toLowerCase().includes(query);
        const matchSkills = (job.requiredSkills || []).some(s => s.toLowerCase().includes(query));
        const matchResp = (job.responsibilities || []).some(r => r.toLowerCase().includes(query));

        if (
          !matchTitle &&
          !matchBusiness &&
          !matchCategory &&
          !matchAddress &&
          !matchLocality &&
          !matchCity &&
          !matchShortDesc &&
          !matchFullDesc &&
          !matchSkills &&
          !matchResp
        ) {
          return false;
        }
      }

      // City
      if (filters.city && filters.city !== 'All Cities') {
        const cityFilter = filters.city.toLowerCase().trim();
        const jobCity = (job.city || '').toLowerCase().trim();
        const jobAddress = (job.businessAddress || '').toLowerCase().trim();
        if (jobCity !== cityFilter && !jobAddress.includes(cityFilter)) {
          return false;
        }
      }

      // Categories
      if (filters.categories.length > 0 && !filters.categories.includes(job.category)) {
        return false;
      }

      // Work Type
      if (filters.workType && filters.workType !== 'all') {
        if (job.workType && job.workType !== filters.workType) {
          return false;
        }
      }

      // Duration
      if (filters.duration && filters.duration !== 'all') {
        if (job.duration && job.duration !== filters.duration) {
          return false;
        }
      }

      // Shift Timing
      if (filters.timing && filters.timing !== 'all') {
        if (job.timing && job.timing !== filters.timing) {
          return false;
        }
      }

      // Verified Only
      if (filters.verifiedOnly && !job.isVerifiedBusiness) {
        return false;
      }

      // Distance - only filter by distance if job has valid coordinates/distance
      if (filters.maxDistanceKm && filters.maxDistanceKm < 15) {
        if (typeof job.distanceKm !== 'number' || job.distanceKm > filters.maxDistanceKm) {
          return false;
        }
      }

      // Minimum Pay
      if (filters.minPay && filters.minPay > 0) {
        if (job.paymentAmount < filters.minPay) {
          return false;
        }
      }

      // Maximum Pay
      if (filters.maxPay && filters.maxPay < 10000 && filters.maxPay > 0) {
        if (job.paymentAmount > filters.maxPay) {
          return false;
        }
      }

      return true;
    });

    // 3. Sorting
    const query = filters.searchQuery.toLowerCase().trim();
    const effectiveSort = filters.sortBy || (filters.paymentSort === 'high_to_low' ? 'highest_pay' : filters.paymentSort === 'low_to_high' ? 'lowest_pay' : 'relevant');

    return [...filtered].sort((a, b) => {
      switch (effectiveSort) {
        case 'highest_pay':
          return b.paymentAmount - a.paymentAmount;
        case 'lowest_pay':
          return a.paymentAmount - b.paymentAmount;
        case 'nearest': {
          const distA = typeof a.distanceKm === 'number' ? a.distanceKm : 99999;
          const distB = typeof b.distanceKm === 'number' ? b.distanceKm : 99999;
          return distA - distB;
        }
        case 'farthest': {
          const distA = typeof a.distanceKm === 'number' ? a.distanceKm : -1;
          const distB = typeof b.distanceKm === 'number' ? b.distanceKm : -1;
          return distB - distA;
        }
        case 'newest': {
          const dateA = a.id || '';
          const dateB = b.id || '';
          return dateB.localeCompare(dateA);
        }
        case 'relevant':
        default: {
          if (!query) {
            // Default ranking: verified businesses first, then closer distance
            if (a.isVerifiedBusiness !== b.isVerifiedBusiness) {
              return a.isVerifiedBusiness ? -1 : 1;
            }
            const distA = typeof a.distanceKm === 'number' ? a.distanceKm : 99999;
            const distB = typeof b.distanceKm === 'number' ? b.distanceKm : 99999;
            return distA - distB;
          }
          // Calculate search relevance score
          const score = (j: JobListing) => {
            let s = 0;
            if (j.title.toLowerCase().includes(query)) s += 10;
            if (j.category.toLowerCase().includes(query)) s += 6;
            if (j.businessName.toLowerCase().includes(query)) s += 4;
            if ((j.requiredSkills || []).some(k => k.toLowerCase().includes(query))) s += 3;
            if ((j.shortDescription || '').toLowerCase().includes(query)) s += 1;
            return s;
          };
          return score(b) - score(a);
        }
      }
    });
  }, [jobs, filters]);


  return (
    <JobContext.Provider
      value={{
        jobs,
        filteredJobs,
        filters,
        updateFilter,
        clearFilters,
        selectedJob,
        setSelectedJob,
        activeModalJob,
        setActiveModalJob,
        applyModalJob,
        setApplyModalJob,
        reportListingModalJob,
        setReportListingModalJob,
        savedJobIds,
        toggleSaveJob,
        applications,
        applyForJob,
        acceptApplication,
        rejectApplication,
        markApplicationCompleted,
        earnings,
        totalEarnings,
        thisMonthEarnings,
        pendingEarnings,
        notifications,
        markNotificationAsRead,
        markNotificationRead,
        clearAllNotifications,
        markAllNotificationsRead,
        unreadNotificationsCount,
        postJob,
        deleteJob,
        clearJob,
        submitReport,
        refreshData,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = (): JobContextType => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
