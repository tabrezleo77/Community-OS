import React, { useState } from 'react';
import { AppProvider, useAppContext } from './StateContext';
import { UserRole } from './types';
import AnalyticsPanel from './components/AnalyticsPanel';
import CheckInScanner from './components/CheckInScanner';
import Agenda from './components/Agenda';
import VolunteerBoard from './components/VolunteerBoard';
import CertificateGenerator from './components/CertificateGenerator';
import AnnouncementFeed from './components/AnnouncementFeed';
import Toast from './components/Toast';
import { Settings, Shield, User as UserIcon, LayoutDashboard, QrCode, Calendar, Users, Award, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { currentRole, setCurrentRole, isLoading, loadError } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  const getAvailableTabs = () => {
    switch (currentRole) {
      case 'Organizer':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'checkin', label: 'Check-In', icon: QrCode },
          { id: 'agenda', label: 'Agenda', icon: Calendar },
          { id: 'volunteers', label: 'Volunteers', icon: Users },
          { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
          { id: 'certificates', label: 'Certificates', icon: Award },
        ];
      case 'Volunteer':
        return [
          { id: 'checkin', label: 'Scanner', icon: QrCode },
          { id: 'volunteers', label: 'My Tasks', icon: Users },
          { id: 'agenda', label: 'Agenda', icon: Calendar },
          { id: 'broadcast', label: 'Announcements', icon: Megaphone },
        ];
      case 'Attendee':
        return [
          { id: 'agenda', label: 'My Agenda', icon: Calendar },
          { id: 'broadcast', label: 'Announcements', icon: Megaphone },
          { id: 'certificates', label: 'Certificate', icon: Award },
        ];
      default:
        return [];
    }
  };

  const tabs = getAvailableTabs();

  // Ensure active tab is valid for role
  React.useEffect(() => {
    if (tabs.length && !tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [currentRole, activeTab, tabs]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9] text-[#8E8A7A]">
        Loading event data…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#2D302E] font-sans selection:bg-[#7C9082]/20 selection:text-[#2D302E]">
      {loadError && (
        <div className="bg-red-50 text-red-700 text-sm text-center py-2 px-4 border-b border-red-200">
          Couldn't reach the server ({loadError}). Showing the last data loaded — changes may not save until the connection is back.
        </div>
      )}
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-[#E9E5D6] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#7C9082] rounded-xl flex items-center justify-center text-white font-bold text-xl">
                C
              </div>
              <span className="text-xl font-semibold tracking-tight text-[#4A4E69] italic hidden sm:block">
                Community Event OS
              </span>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500 hidden sm:block">Perspective:</span>
              <div className="flex p-1 bg-[#F3F1EA] rounded-full border border-[#E9E5D6]">
                {(['Organizer', 'Volunteer', 'Attendee'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => setCurrentRole(role)}
                    className={`flex items-center px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      currentRole === role 
                        ? 'bg-white text-[#4A4E69] shadow-sm' 
                        : 'text-[#7C9082] hover:bg-white/50'
                    }`}
                  >
                    {role === 'Organizer' && <Settings className="w-4 h-4 sm:mr-1.5" />}
                    {role === 'Volunteer' && <Shield className="w-4 h-4 sm:mr-1.5" />}
                    {role === 'Attendee' && <UserIcon className="w-4 h-4 sm:mr-1.5" />}
                    <span className="hidden sm:block">{role}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-60 shrink-0">
          <nav className="space-y-1 flex flex-row overflow-x-auto md:flex-col md:overflow-visible pb-4 md:pb-0 hide-scrollbar gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all w-full ${
                  activeTab === tab.id
                    ? 'bg-[#7C9082]/10 text-[#7C9082] font-medium border border-[#7C9082]/20'
                    : 'text-[#8E8A7A] hover:bg-white'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-[#7C9082]' : 'text-[#8E8A7A]'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Dynamic Content Panel */}
        <section className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentRole}-${activeTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#4A4E69] tracking-tight italic">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h1>
              </div>

              {activeTab === 'dashboard' && currentRole === 'Organizer' && <AnalyticsPanel />}
              {activeTab === 'checkin' && <CheckInScanner showToast={displayToast} />}
              {activeTab === 'agenda' && <Agenda showToast={displayToast} />}
              {activeTab === 'volunteers' && <VolunteerBoard showToast={displayToast} />}
              {activeTab === 'broadcast' && <AnnouncementFeed showToast={displayToast} />}
              {activeTab === 'certificates' && <CertificateGenerator showToast={displayToast} />}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
