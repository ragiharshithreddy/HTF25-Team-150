import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiBriefcase, FiFileText, FiAward,
  FiUser, FiBook, FiBell, FiSettings,
  FiLogOut, FiMenu, FiX, FiTarget, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState);
    if (onToggle) onToggle(newState);
    window.dispatchEvent(new Event('sidebarToggle'));
  };

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/student/dashboard' },
    { icon: FiBriefcase, label: 'Projects', path: '/student/projects' },
    { icon: FiFileText, label: 'Applications', path: '/student/applications' },
    { icon: FiTarget, label: 'Resume', path: '/student/resume' },
    { icon: FiBook, label: 'Tests', path: '/student/tests' },
    { icon: FiAward, label: 'Certificates', path: '/student/certificates' },
    { icon: FiBell, label: 'Notifications', path: '/student/notifications' },
    { icon: FiUser, label: 'Profile', path: '/student/profile' },
    { icon: FiSettings, label: 'Settings', path: '/student/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-purple-600 rounded-xl shadow-lg hover:bg-purple-700 transition"
      >
        {isMobileMenuOpen ? (
          <FiX className="w-6 h-6 text-white" />
        ) : (
          <FiMenu className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-0 h-screen w-64 z-40 bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 shadow-2xl"
          >
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <FiBriefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">ProjectHub</h1>
                  <p className="text-xs text-purple-200">Student Portal</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 overflow-y-auto h-[calc(100vh-180px)]">
              <ul className="space-y-2">
                {menuItems.map((item, index) => (
                  <motion.li
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-white/10">
              <button onClick={handleLogout} className="sidebar-item w-full text-red-300 hover:bg-red-500/20">
                <FiLogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? '80px' : '256px' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="hidden lg:block fixed left-0 top-0 h-screen bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 shadow-2xl z-40"
      >
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className="absolute -right-3 top-8 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition border-2 border-purple-400"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <FiChevronRight className="w-4 h-4 text-white" />
          ) : (
            <FiChevronLeft className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0">
              <FiBriefcase className="w-6 h-6 text-white" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-xl font-bold text-white whitespace-nowrap">ProjectHub</h1>
                  <p className="text-xs text-purple-200 whitespace-nowrap">Student Portal</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto h-[calc(100vh-180px)]">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  className={`sidebar-item ${isActive(item.path) ? 'active' : ''} ${
                    isCollapsed ? 'justify-center' : ''
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`sidebar-item w-full text-red-300 hover:bg-red-500/20 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <FiLogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
