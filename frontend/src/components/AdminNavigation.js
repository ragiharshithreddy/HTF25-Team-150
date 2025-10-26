import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiActivity, FiBriefcase, FiUsers, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const links = [
  { to: '/admin/dashboard', label: 'Overview', icon: FiActivity },
  { to: '/admin/projects', label: 'Projects', icon: FiBriefcase },
  { to: '/admin/applications', label: 'Applications', icon: FiUsers },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings }
];

const AdminNavigation = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-panel--subtle relative mb-10 px-5 py-4"
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap items-center gap-3">
          {links.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-indigo-400/60 bg-gradient-to-r from-indigo-500/40 via-violet-500/40 to-purple-500/40 text-white shadow-[0_12px_30px_rgba(99,102,241,0.35)]'
                      : 'border-white/10 bg-white/5 text-indigo-100/80 hover:border-indigo-300/40 hover:bg-indigo-500/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        
        <div className="flex items-center gap-3">
          {/* Admin Info */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl border border-white/10 bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
              <p className="text-xs text-white/60">Administrator</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition-all duration-200 hover:border-red-400/50 hover:bg-red-500/20 hover:text-red-100"
            title="Logout"
          >
            <FiLogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default AdminNavigation;
