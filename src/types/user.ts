import { JobCategory, ShiftTiming } from './job';

export type UserRole = 'student' | 'employer';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string; // stored locally
  role: UserRole;
  name: string;
  phone: string;
  collegeOrBusiness: string;
  city: string;
  avatar: string;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  college: string;
  degree: string;
  yearOfStudy: string;
  bio: string;
  skills: string[];
  preferredCategories: JobCategory[];
  preferredHours: ShiftTiming[];
  preferredDistanceKm: number;
  completedJobsCount: number;
  rating: number;
  totalEarnings: number;
  city: string;
}

export interface EmployerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  businessName: string;
  businessDescription: string;
  businessAddress: string;
  city: string;
  isVerified: boolean;
  verificationBadgeType: 'verified_business' | 'profile_provided';
  workplacePhotos: string[];
  activePostingsCount: number;
  totalJobsPosted: number;
}

export interface AuthUser {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  phone: string;
  avatar: string;
  studentData?: StudentProfile;
  employerData?: EmployerProfile;
}
