import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';

const Navbar = ({ user, title = "Dashboard" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleForward = () => {
    navigate(1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 bg-gradient-to-r from-slate-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 shadow-lg"
    >
      <div className="flex items-center justify-between">
        {/* Left Section - Navigation Controls & Title */}
        <div className="flex items-center gap-4">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white/10 rounded-lg transition group"
              title="Go Back"
            >
              <FiChevronLeft className="w-5 h-5 text-white/70 group-hover:text-white transition" />
            </button>
            <button
              onClick={handleForward}
              className="p-2 hover:bg-white/10 rounded-lg transition group"
              title="Go Forward"
            >
              <FiChevronRight className="w-5 h-5 text-white/70 group-hover:text-white transition" />
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-white/10 rounded-lg transition group"
              title="Refresh"
            >
              <FiRefreshCw className="w-5 h-5 text-white/70 group-hover:text-white transition" />
            </button>
          </div>

          {/* Page Title */}
          <h2 className="text-xl font-bold text-white hidden md:block">{title}</h2>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects, courses, or certificates..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 focus:border-purple-400 focus:bg-white/15 text-white placeholder-white/50 transition-all duration-300 outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-3 hover:bg-white/10 rounded-xl transition group">
            <FiBell className="w-6 h-6 text-white/70 group-hover:text-white transition" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          {user && (
            <div className="flex items-center space-x-3 p-2 pr-4 hover:bg-white/10 rounded-xl cursor-pointer transition">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=7c3aed&color=fff`}
                alt={user.name || 'User'}
                className="w-10 h-10 rounded-full ring-2 ring-purple-400"
              />
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-white">{user.name || 'User'}</p>
                <p className="text-xs text-white/60">{user.year || user.role || 'Student'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
