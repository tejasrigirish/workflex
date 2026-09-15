import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider, useJobs } from './context/JobContext';
import { MagneticBackground } from './components/background/MagneticBackground';
import { CustomCursor } from './components/auth/CustomCursor';
import { AuthGate } from './components/auth/AuthGate';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentProfileView } from './components/student/StudentProfile';
import { ApplicationsView } from './components/student/ApplicationsView';
import { EarningsView } from './components/student/EarningsView';
import { EmployerDashboard } from './components/employer/EmployerDashboard';
import { JobDetailsModal } from './components/jobs/JobDetailsModal';
import { ApplyModal } from './components/jobs/ApplyModal';
import { PostJobModal } from './components/employer/PostJobModal';
import { ReportModal } from './components/trust/ReportModal';
import { JobCard } from './components/jobs/JobCard';
import { JobCategory } from './types/job';
import { Sparkles, Trash2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    isAuthenticated,
    role,
    authIntent,
    setAuthIntent,
    isAuthModalOpen,
    openAuth,
    closeAuth,
    isGuestExploring,
  } = useAuth();

  const {
    jobs,
    activeModalJob,
    setActiveModalJob,
    applyModalJob,
    setApplyModalJob,
    reportListingModalJob,
    setReportListingModalJob,
    savedJobIds,
    setSelectedJob,
    updateFilter,
  } = useJobs();

  // If user is not logged in and not guest exploring, show mandatory AuthGate
  if (!isAuthenticated && !isGuestExploring) {
    return <AuthGate />;
  }

  // Navigation view state
  const [currentView, setCurrentView] = useState<string>(
    role === 'employer' ? 'employer' : 'discover'
  );
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState<boolean>(false);

  const savedJobs = jobs.filter((j) => savedJobIds.includes(j.id));

  // Intent resume and Role-based redirection upon login
  React.useEffect(() => {
    if (isAuthenticated) {
      if (authIntent?.pendingAction) {
        if (authIntent.pendingAction.type === 'post_job') {
          if (role === 'employer') {
            setIsPostJobModalOpen(true);
            setCurrentView('employer');
          }
        } else if (authIntent.pendingAction.type === 'apply') {
          if (role === 'student') {
            setApplyModalJob(authIntent.pendingAction.job);
            setCurrentView('discover');
          }
        }
        setAuthIntent(null);
      } else {
        if (role === 'employer') {
          setCurrentView('employer');
        } else {
          setCurrentView('dashboard');
        }
      }
    }
  }, [isAuthenticated, role]);

  // Role Guarding against unauthorized access
  React.useEffect(() => {
    if (isAuthenticated) {
      if (role === 'student' && currentView === 'employer') {
        setCurrentView('dashboard');
      } else if (
        role === 'employer' &&
        (currentView === 'dashboard' ||
          currentView === 'applications' ||
          currentView === 'saved' ||
          currentView === 'earnings')
      ) {
        setCurrentView('employer');
      }
    }
  }, [currentView, role, isAuthenticated]);

  const handleOpenPostJob = () => {
    if (!isAuthenticated) {
      openAuth('employer', { type: 'post_job' });
      return;
    }
    if (role !== 'employer') {
      alert('Only employer accounts can post shifts. Please sign in as an Employer.');
      return;
    }
    setIsPostJobModalOpen(true);
  };

  const handleApplyJob = (job: any) => {
    if (!isAuthenticated) {
      openAuth('student', { type: 'apply', job });
      return;
    }
    if (role === 'employer') {
      alert('Employer accounts cannot apply for shifts. Please use an Employee / Job Seeker account.');
      return;
    }
    setApplyModalJob(job);
  };

  const handleSelectCategoryFromLanding = (cat: JobCategory) => {
    updateFilter('categories', [cat]);
    setCurrentView('discover');
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col relative selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Interactive Magnetic Gradient Background */}
      <MagneticBackground />

      {/* Global Magnetic Ring Cursor */}
      <CustomCursor />

      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenPostJob={handleOpenPostJob}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1 relative z-10 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
        {currentView === 'landing' && (
          <LandingPage
            onNavigateToDiscovery={() => setCurrentView('discover')}
            onOpenPostJob={handleOpenPostJob}
            onViewJobDetails={(job) => setActiveModalJob(job)}
            onSelectCategory={handleSelectCategoryFromLanding}
          />
        )}

        {(currentView === 'discover' || currentView === 'discover-map') && (
          <DiscoverPage
            onViewJobDetails={(job) => setActiveModalJob(job)}
            onApplyJob={(job) => handleApplyJob(job)}
            initialMobileView={currentView === 'discover-map' ? 'map' : 'list'}
          />
        )}

        {currentView === 'dashboard' && role === 'student' && (
          <StudentDashboard
            onNavigateToDiscovery={() => setCurrentView('discover')}
            onNavigateToApplications={() => setCurrentView('applications')}
            onNavigateToSaved={() => setCurrentView('saved')}
            onNavigateToEarnings={() => setCurrentView('earnings')}
            onViewJobDetails={(job) => setActiveModalJob(job)}
            onApplyJob={(job) => handleApplyJob(job)}
          />
        )}

        {currentView === 'profile' && <StudentProfileView />}

        {currentView === 'applications' && role === 'student' && (
          <ApplicationsView onBrowseJobs={() => setCurrentView('discover')} />
        )}

        {currentView === 'saved' && role === 'student' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Saved Shifts</h1>
              <p className="text-xs text-slate-400 mt-1">
                Your bookmarked listings
              </p>
            </div>

            {savedJobs.length === 0 ? (
              <div className="text-center py-16 bg-[#0D121D] border border-slate-800 rounded-3xl p-8 space-y-3">
                <p className="text-xs text-slate-400">No saved jobs yet.</p>
                <button
                  onClick={() => setCurrentView('discover')}
                  className="px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-xl"
                >
                  Explore Map
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSelect={(j) => setSelectedJob(j)}
                    onViewDetails={(j) => setActiveModalJob(j)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'earnings' && role === 'student' && <EarningsView />}

        {currentView === 'employer' && role === 'employer' && (
          <EmployerDashboard onOpenPostJob={() => setIsPostJobModalOpen(true)} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(view) => setCurrentView(view)}
        onOpenPostJob={handleOpenPostJob}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />

      {/* Modals Container */}
      {activeModalJob && (
        <JobDetailsModal
          job={activeModalJob}
          onClose={() => setActiveModalJob(null)}
          onApply={(job) => {
            setActiveModalJob(null);
            handleApplyJob(job);
          }}
        />
      )}

      {applyModalJob && (
        <ApplyModal
          job={applyModalJob}
          onClose={() => setApplyModalJob(null)}
          onSuccess={() => {
            setApplyModalJob(null);
            setCurrentView('applications');
          }}
        />
      )}

      {isPostJobModalOpen && role === 'employer' && (
        <PostJobModal
          onClose={() => setIsPostJobModalOpen(false)}
          onSuccess={() => {
            setIsPostJobModalOpen(false);
            setCurrentView('discover');
          }}
        />
      )}

      {reportListingModalJob && (
        <ReportModal
          job={reportListingModalJob}
          onClose={() => setReportListingModalJob(null)}
        />
      )}

      {/* Dedicated Full-Screen Auth Modal for Protected Actions */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <AuthGate
            isModal={true}
            onCancel={() => closeAuth()}
            onSuccess={() => closeAuth()}
          />
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <JobProvider>
        <MainAppContent />
      </JobProvider>
    </AuthProvider>
  );
};

export default App;
