import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './components/AuthContext';
import Logo from './components/Logo';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Skills from './pages/Skills';
import DailyLogs from './pages/DailyLogs';
import Goals from './pages/Goals';
import Tasks from './pages/Tasks';
import Roadmap from './pages/Roadmap';
import Resources from './pages/Resources';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Notifications from './pages/Notifications';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/logs" element={<DailyLogs />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppContent() {
  const { user } = useAuth();

  // Loading state
  if (user === undefined) return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="animated-bg" />

      {/* Glow orbs */}
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute w-64 h-64 bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/10 rounded-full blur-[80px]" />
      <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="absolute w-48 h-48 bg-gradient-to-br from-[#4facfe]/15 to-[#43e97b]/10 rounded-full blur-[60px] translate-x-20 translate-y-10" />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative z-10">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <Logo size={80} />
        </motion.div>
      </motion.div>

      {/* App name */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="relative z-10 mt-6 text-center">
        <h1 className="text-xl font-extrabold tracking-tight">
          Dev <span className="gradient-text">Tracker</span>
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-[10px] font-mono text-zinc-500 mt-2">
          <span className="code-keyword">loading</span><span className="code-bracket">()</span><span className="cursor-blink"></span>
        </motion.p>
      </motion.div>

      {/* Progress bar */}
      <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 160 }} transition={{ delay: 0.5 }}
        className="relative z-10 mt-6 h-[3px] rounded-full bg-white/[0.05] overflow-hidden">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
      </motion.div>
    </div>
  );

  // Not logged in
  if (!user) return <Login />;

  // Authenticated
  return (
    <div className="flex">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="lg:hidden">
        <MobileNav />
      </div>
      <main className="lg:ml-[270px] flex-1 p-4 md:p-6 lg:p-8 min-h-screen pt-20 lg:pt-8 pb-24 lg:pb-8 relative z-10">
        <AnimatedRoutes />
        <Footer />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{
          style: { background: '#111113', color: '#fafafa', border: '1px solid rgba(102,126,234,0.15)', borderRadius: '14px', fontSize: '13px', fontFamily: 'Inter', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
          success: { iconTheme: { primary: '#43e97b', secondary: '#fff' } }
        }} />
        <div className="animated-bg" />
        <div className="noise" />
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
