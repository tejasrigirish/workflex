export type JobCategory =
  | 'Delivery'
  | 'Retail'
  | 'Shop Management'
  | 'Office Assistant'
  | 'Data Entry'
  | 'Reception'
  | 'Customer Support'
  | 'Event Work'
  | 'Warehouse'
  | 'Cafe & Restaurant'
  | 'Tutoring'
  | 'Other';

export type PaymentType = 'per_hour' | 'per_day' | 'per_task' | 'per_month';

export type DurationType = 'few_hours' | '1_day' | 'several_days' | 'weekly' | 'monthly';

export type WorkType = 'one_time' | 'part_time' | 'temporary' | 'weekend' | 'monthly';

export type ShiftTiming = 'morning' | 'afternoon' | 'evening' | 'night';

export interface WorkplaceImage {
  url: string;
  caption: string;
}

export interface JobListing {
  id: string;
  title: string;
  businessName: string;
  employerId: string;
  employerName: string;
  employerPhone: string;
  employerEmail?: string;
  isVerifiedBusiness: boolean;
  businessDescription: string;
  businessAddress: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  hasValidCoordinates?: boolean;
  distanceKm?: number;
  category: JobCategory;
  workType: WorkType;
  paymentAmount: number;
  paymentType: PaymentType;
  duration: DurationType;
  durationText: string; // e.g. "4–6 hours", "3 days"
  timing: ShiftTiming;
  workingHoursText: string; // e.g. "5:00 PM – 9:30 PM"
  startDate: string;
  endDate?: string;
  shortDescription: string;
  fullDescription: string;
  responsibilities: string[];
  requiredSkills: string[];
  workersNeeded: number;
  workersSelected: number;
  workplaceImages: string[];
  postedDate: string;
  status: 'active' | 'filled' | 'completed' | 'cancelled';
  payment?: {
    amount: number;
    frequency: string;
    currency: string;
    isNegotiable: boolean;
  };
  locality?: string;
  address?: string;
  businessType?: string;
  photoUrl?: string;
  workplacePhotos?: string[];
  isEmergencyPosting?: boolean;
}

export type SortOption =
  | 'relevant'
  | 'highest_pay'
  | 'lowest_pay'
  | 'nearest'
  | 'farthest'
  | 'newest';

export interface FilterOptions {
  searchQuery: string;
  categories: JobCategory[];
  paymentSort: 'none' | 'low_to_high' | 'high_to_low';
  maxDistanceKm: number;
  distanceSort: boolean;
  duration: DurationType | 'all';
  workType: WorkType | 'all';
  timing: ShiftTiming | 'all';
  city: string;
  minPay: number;
  maxPay: number;
  sortBy: SortOption;
  durations?: string[];
  shiftTimings?: string[];
  verifiedOnly: boolean;
}

