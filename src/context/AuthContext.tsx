// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole, StudentProfile, EmployerProfile, UserAccount } from '../types/user';
import { api } from '../api/client';

export interface AuthIntent {
  preselectedRole?: UserRole;
  pendingAction?: { type: 'post_job' } | { type: 'apply'; job: any } | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  role: UserRole;
  authIntent: AuthIntent | null;
  setAuthIntent: (intent: AuthIntent | null) => void;
  isAuthModalOpen: boolean;
  isGuestExploring: boolean;
  setIsGuestExploring: (val: boolean) => void;
  openAuth: (preselectedRole?: UserRole, pendingAction?: any) => void;
  closeAuth: () => void;
  setRole: (role: UserRole) => void;
  loginWithCredentials: (identifier: string, password: string, requestedRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  registerWithCredentials: (data: {
    email?: string;
    phone?: string;
    password: string;
    role: UserRole;
    name: string;
    collegeOrBusiness?: string;
    city?: string;
    skills?: string[];
    availability?: string;
    preferredCategories?: string[];
  }) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (identifier: string) => Promise<{ success: boolean; message?: string; error?: string; resetCode?: string }>;
  resetPassword: (identifier: string, code: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  updateStudentProfile: (profile: Partial<StudentProfile>) => void;
  updateEmployerProfile: (profile: Partial<EmployerProfile>) => void;
  switchRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current session account
  const [currentUserAccount, setCurrentUserAccount] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('workflex_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = !!currentUserAccount;

  // Student profile state
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem('workflex_active_student');
    return saved ? JSON.parse(saved) : null;
  });

  // Employer profile state
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(() => {
    const saved = localStorage.getItem('workflex_active_employer');
    return saved ? JSON.parse(saved) : null;
  });

  // Intent & Auth Modal State (e.g. for Post a Job or Apply redirects)
  const [authIntent, setAuthIntent] = useState<AuthIntent | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isGuestExploring, setIsGuestExploring] = useState<boolean>(false);

  const openAuth = (preselectedRole?: UserRole, pendingAction?: any) => {
    setAuthIntent({
      preselectedRole: preselectedRole || 'student',
      pendingAction: pendingAction || null,
    });
    setIsAuthModalOpen(true);
  };

  const closeAuth = () => {
    setIsAuthModalOpen(false);
  };

  // Save active session
  useEffect(() => {
    if (currentUserAccount) {
      localStorage.setItem('workflex_active_session', JSON.stringify(currentUserAccount));
    } else {
      localStorage.removeItem('workflex_active_session');
    }
  }, [currentUserAccount]);

  useEffect(() => {
    if (studentProfile) {
      localStorage.setItem('workflex_active_student', JSON.stringify(studentProfile));
    } else {
      localStorage.removeItem('workflex_active_student');
    }
  }, [studentProfile]);

  useEffect(() => {
    if (employerProfile) {
      localStorage.setItem('workflex_active_employer', JSON.stringify(employerProfile));
    } else {
      localStorage.removeItem('workflex_active_employer');
    }
  }, [employerProfile]);

  const role: UserRole = currentUserAccount ? currentUserAccount.role : 'student';

  const setRole = (newRole: UserRole) => {
    if (currentUserAccount) {
      const updated = { ...currentUserAccount, role: newRole };
      setCurrentUserAccount(updated);
    }
  };

  const switchRole = () => {
    if (currentUserAccount) {
      const nextRole: UserRole = currentUserAccount.role === 'student' ? 'employer' : 'student';
      setRole(nextRole);
    }
  };

  const registerWithCredentials = async (data: {
    email?: string;
    phone?: string;
    password: string;
    role: UserRole;
    name: string;
    collegeOrBusiness?: string;
    city?: string;
    skills?: string[];
    availability?: string;
    preferredCategories?: string[];
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.register({
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        name: data.name,
        collegeOrBusiness: data.collegeOrBusiness,
        city: data.city || 'Bengaluru',
        skills: data.skills,
        availability: data.availability,
        preferredCategories: data.preferredCategories,
      });

      if (!res.success || !res.user) {
        return { success: false, error: 'Registration failed. Please check your details.' };
      }

      const user = res.user;
      const account: UserAccount = {
        id: user.id,
        email: user.email,
        passwordHash: '',
        role: user.role,
        name: user.name,
        phone: user.phone,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
        collegeOrBusiness: data.collegeOrBusiness || (user.role === 'employer' ? 'Business' : 'Student'),
        city: data.city || 'Bengaluru',
        createdAt: user.createdAt,
      };

      setCurrentUserAccount(account);

      if (user.role === 'student') {
        const student: StudentProfile = {
          id: user.profile?.id || user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: account.avatar,
          college: data.collegeOrBusiness || 'Job Seeker',
          degree: 'Undergraduate',
          yearOfStudy: 'Current Student',
          bio: 'College student looking for productive part-time gigs.',
          skills: data.skills || ['Communication', 'Punctuality'],
          preferredCategories: (data.preferredCategories as any) || ['Cafe & Restaurant', 'Retail'],
          preferredHours: ['evening'],
          preferredDistanceKm: 5,
          completedJobsCount: 0,
          rating: 5.0,
          totalEarnings: 0,
          city: data.city || 'Bengaluru',
        };
        setStudentProfile(student);
      } else {
        const employer: EmployerProfile = {
          id: user.profile?.id || user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: account.avatar,
          businessName: data.collegeOrBusiness || user.name,
          businessDescription: 'Verified local employer on WorkFlex.',
          businessAddress: `${data.city || 'Bengaluru'}, Karnataka`,
          city: data.city || 'Bengaluru',
          isVerified: true,
          verificationBadgeType: 'verified_business',
          workplacePhotos: [],
          activePostingsCount: 0,
          totalJobsPosted: 0,
        };
        setEmployerProfile(employer);
      }

      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const loginWithCredentials = async (
    identifier: string,
    password: string,
    requestedRole?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.login(identifier, password, requestedRole);

      if (!res.success || !res.user) {
        return { success: false, error: 'Invalid credentials. Please check your email/phone and password.' };
      }

      const user = res.user;
      const account: UserAccount = {
        id: user.id,
        email: user.email,
        passwordHash: '',
        role: user.role,
        name: user.name,
        phone: user.phone,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
        collegeOrBusiness: user.profile?.businessName || user.profile?.business_name || user.profile?.college || 'Local Member',
        city: user.profile?.city || 'Bengaluru',
        createdAt: user.createdAt,
      };

      setCurrentUserAccount(account);

      if (user.role === 'student') {
        const student: StudentProfile = {
          id: user.profile?.id || user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: account.avatar,
          college: user.profile?.college || 'Job Seeker',
          degree: 'Undergraduate',
          yearOfStudy: 'Current Student',
          bio: 'College student looking for productive part-time gigs.',
          skills: user.profile?.skills || ['Communication', 'Punctuality'],
          preferredCategories: ['Cafe & Restaurant', 'Retail'],
          preferredHours: ['evening'],
          preferredDistanceKm: 5,
          completedJobsCount: 0,
          rating: 5.0,
          totalEarnings: 0,
          city: user.profile?.city || 'Bengaluru',
        };
        setStudentProfile(student);
      } else {
        const employer: EmployerProfile = {
          id: user.profile?.id || user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: account.avatar,
          businessName: user.profile?.business_name || user.profile?.businessName || 'Local Store',
          businessDescription: user.profile?.description || 'Verified local employer on WorkFlex.',
          businessAddress: user.profile?.address || `${user.profile?.city || 'Bengaluru'}, Karnataka`,
          city: user.profile?.city || 'Bengaluru',
          isVerified: user.profile?.verification_status === 'verified',
          verificationBadgeType: 'verified_business',
          workplacePhotos: [],
          activePostingsCount: 0,
          totalJobsPosted: 0,
        };
        setEmployerProfile(employer);
      }

      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const forgotPassword = async (identifier: string): Promise<{ success: boolean; message?: string; error?: string; resetCode?: string }> => {
    try {
      const res = await api.forgotPassword(identifier);
      return { success: true, message: res.message, resetCode: res.resetCode };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to send reset instructions' };
    }
  };

  const resetPassword = async (identifier: string, code: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await api.resetPassword(identifier, code, newPassword);
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to reset password' };
    }
  };

  const logout = () => {
    setCurrentUserAccount(null);
    setStudentProfile(null);
    setEmployerProfile(null);
    setAuthIntent(null);
    setIsAuthModalOpen(false);
    setIsGuestExploring(false);
    localStorage.removeItem('workflex_active_session');
    localStorage.removeItem('workflex_active_student');
    localStorage.removeItem('workflex_active_employer');
  };

  const updateStudentProfile = (updated: Partial<StudentProfile>) => {
    setStudentProfile(prev => (prev ? { ...prev, ...updated } : null));
  };

  const updateEmployerProfile = (updated: Partial<EmployerProfile>) => {
    setEmployerProfile(prev => (prev ? { ...prev, ...updated } : null));
  };

  const authUser: AuthUser | null = currentUserAccount
    ? {
        id: currentUserAccount.id,
        role: currentUserAccount.role,
        email: currentUserAccount.email,
        name: currentUserAccount.name,
        phone: currentUserAccount.phone,
        avatar: currentUserAccount.avatar,
        studentData: studentProfile || undefined,
        employerData: employerProfile || undefined,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user: authUser,
        role,
        authIntent,
        setAuthIntent,
        isAuthModalOpen,
        isGuestExploring,
        setIsGuestExploring,
        openAuth,
        closeAuth,
        setRole,
        loginWithCredentials,
        registerWithCredentials,
        forgotPassword,
        resetPassword,
        logout,
        updateStudentProfile,
        updateEmployerProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
