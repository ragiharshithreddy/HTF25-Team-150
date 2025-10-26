import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiClock,
  FiUsers,
  FiTrendingUp,
  FiFileText,
  FiLogOut,
  FiEye,
  FiShield,
  FiSettings,
  FiBriefcase,
  FiPauseCircle,
  FiPlayCircle,
  FiTrash2
} from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectModal, setRejectModal] = useState({ open: false, companyId: null, reason: '' });
  const [suspendModal, setSuspendModal] = useState({ open: false, companyId: null, reason: '' });
  const [detailsModal, setDetailsModal] = useState({ open: false, company: null });

  const STATUS_OPTIONS = [
    { value: 'all', label: 'All Companies' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const statusMeta = {
    pending: {
      label: 'Pending',
      icon: FiClock,
      badge: 'bg-amber-500/15 text-amber-200 border border-amber-500/30'
    },
    approved: {
      label: 'Approved',
      icon: FiCheckCircle,
      badge: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30'
    },
    rejected: {
      label: 'Rejected',
      icon: FiXCircle,
      badge: 'bg-rose-500/15 text-rose-200 border border-rose-500/30'
    },
    suspended: {
      label: 'Suspended',
      icon: FiPauseCircle,
      badge: 'bg-orange-500/15 text-orange-200 border border-orange-500/30'
    }
  };

  // Fetch system stats
  const { data: stats } = useQuery('superadmin-stats', async () => {
    const { data } = await api.get('/superadmin/stats');
    return data.data;
  }, {
    refetchInterval: 10000, // Refetch every 10 seconds
    refetchOnWindowFocus: true
  });

  // Fetch companies
  const { data: companies = [], isLoading } = useQuery(
    ['superadmin-companies', statusFilter, searchTerm],
    async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      const { data } = await api.get(`/superadmin/companies?${params}`);
      return data.data;
    },
    {
      refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
      refetchOnWindowFocus: true
    }
  );

  // Approve mutation
  const approveMutation = useMutation(
    async (companyId) => {
      const { data } = await api.put(`/superadmin/companies/${companyId}/approve`);
      return data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('superadmin-companies');
        queryClient.invalidateQueries('superadmin-stats');
        toast.success('✅ Company approved! Admin can now create projects and manage students.');
      },
      onError: (error) => toast.error(error.response?.data?.message || '❌ Failed to approve company')
    }
  );

  // Reject mutation
  const rejectMutation = useMutation(
    async ({ companyId, reason }) => {
      const { data } = await api.put(`/superadmin/companies/${companyId}/reject`, { reason });
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('superadmin-companies');
        queryClient.invalidateQueries('superadmin-stats');
        toast.success('⛔ Company registration rejected. Admin has been notified.');
        setRejectModal({ open: false, companyId: null, reason: '' });
      },
      onError: (error) => toast.error(error.response?.data?.message || '❌ Failed to reject company')
    }
  );

  // Suspend mutation
  const suspendMutation = useMutation(
    async ({ companyId, reason }) => {
      const { data } = await api.put(`/superadmin/companies/${companyId}/suspend`, { reason });
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('superadmin-companies');
        queryClient.invalidateQueries('superadmin-stats');
        toast.success('⚠️ Company suspended. They cannot create new projects until reactivated.');
        setSuspendModal({ open: false, companyId: null, reason: '' });
      },
      onError: (error) => toast.error(error.response?.data?.message || '❌ Failed to suspend company')
    }
  );

  // Reactivate mutation
  const reactivateMutation = useMutation(
    async (companyId) => {
      const { data } = await api.put(`/superadmin/companies/${companyId}/reactivate`);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('superadmin-companies');
        queryClient.invalidateQueries('superadmin-stats');
        toast.success('✅ Company reactivated! They can now post projects again.');
      },
      onError: (error) => toast.error(error.response?.data?.message || '❌ Failed to reactivate company')
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    async (companyId) => {
      const { data } = await api.delete(`/superadmin/companies/${companyId}`);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('superadmin-companies');
        queryClient.invalidateQueries('superadmin-stats');
        toast.success('🗑️ Company permanently deleted from the system.');
      },
      onError: (error) => toast.error(error.response?.data?.message || '❌ Failed to delete company')
    }
  );

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const renderStatusBadge = (status) => {
    const meta = statusMeta[status];
    if (!meta) return null;
    const Icon = meta.icon;
    return (
      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${meta.badge}`}>
        <Icon className="w-4 h-4" />
        {meta.label}
      </span>
    );
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectModal.companyId || !rejectModal.reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    rejectMutation.mutate({ companyId: rejectModal.companyId, reason: rejectModal.reason.trim() });
  };

  const handleSuspendSubmit = (e) => {
    e.preventDefault();
    if (!suspendModal.companyId || !suspendModal.reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    suspendMutation.mutate({ companyId: suspendModal.companyId, reason: suspendModal.reason.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* SuperAdmin Navigation */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FiShield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SuperAdmin Panel</h1>
                <p className="text-sm text-white/60">{user?.name || 'Administrator'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition-all"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <FiBriefcase className="w-8 h-8 text-indigo-300" />
                <span className="text-xs uppercase tracking-widest text-indigo-200/70">Companies</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.companies?.total || 0}</p>
              <p className="text-sm text-indigo-200/60">
                {stats.companies?.pending || 0} pending approval
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <FiUsers className="w-8 h-8 text-emerald-300" />
                <span className="text-xs uppercase tracking-widest text-emerald-200/70">Students</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.users?.students || 0}</p>
              <p className="text-sm text-emerald-200/60">Registered users</p>
            </div>

            <div className="rounded-2xl border border-sky-400/30 bg-gradient-to-br from-sky-500/10 to-blue-500/10 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <FiFileText className="w-8 h-8 text-sky-300" />
                <span className="text-xs uppercase tracking-widest text-sky-200/70">Projects</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.projects?.total || 0}</p>
              <p className="text-sm text-sky-200/60">
                {stats.projects?.active || 0} active
              </p>
            </div>

            <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <FiTrendingUp className="w-8 h-8 text-amber-300" />
                <span className="text-xs uppercase tracking-widest text-amber-200/70">Applications</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.applications?.total || 0}</p>
              <p className="text-sm text-amber-200/60">
                {stats.applications?.pending || 0} pending
              </p>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="mb-8 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Search companies by name or domain"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Companies List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32 text-white text-lg">
            Loading companies...
          </div>
        ) : companies.length === 0 ? (
          <div className="p-16 text-center text-white/80 rounded-2xl border border-white/10 bg-white/5">
            <FiBriefcase className="w-12 h-12 mx-auto mb-4 text-white/50" />
            <p className="text-xl font-semibold">No companies found</p>
            <p className="text-sm mt-2 text-white/60">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            {companies.map((company, index) => (
              <motion.div
                key={company._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <h3 className="text-white text-xl font-semibold">{company.name}</h3>
                        <p className="text-white/60 text-sm">{company.domain}</p>
                      </div>
                      {renderStatusBadge(company.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                          <FiUsers className="w-4 h-4" />
                        </div>
                        <span className="truncate">Admin: {company.adminId?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                          <FiSettings className="w-4 h-4" />
                        </div>
                        <span className="truncate">{company.adminId?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                          <FiClock className="w-4 h-4" />
                        </div>
                        <span className="truncate">Registered: {new Date(company.createdAt).toLocaleDateString()}</span>
                      </div>
                      {company.approvedBy && (
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                            <FiCheckCircle className="w-4 h-4" />
                          </div>
                          <span className="truncate">Approved by: {company.approvedBy?.name || 'Unknown'}</span>
                        </div>
                      )}
                    </div>

                    {company.description && (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Description</p>
                        <p className="text-sm text-white/80 leading-relaxed line-clamp-2">{company.description}</p>
                      </div>
                    )}

                    {company.rejectionReason && (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                        <p className="text-xs uppercase tracking-wide text-rose-200 mb-2">Reason</p>
                        <p className="text-sm text-rose-100/80">{company.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  <div className="w-full lg:w-60 flex flex-col gap-3">
                    <button
                      onClick={() => setDetailsModal({ open: true, company })}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                    >
                      <FiEye className="w-4 h-4" />
                      View Details
                    </button>

                    {company.status === 'pending' && (
                      <>
                        <button
                          onClick={() => approveMutation.mutate(company._id)}
                          disabled={approveMutation.isLoading}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 transition-all"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ open: true, companyId: company._id, reason: '' })}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-rose-400/40 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 transition-all"
                        >
                          <FiXCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}

                    {company.status === 'approved' && (
                      <button
                        onClick={() => setSuspendModal({ open: true, companyId: company._id, reason: '' })}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-orange-400/40 bg-orange-500/20 text-orange-200 hover:bg-orange-500/30 transition-all"
                      >
                        <FiPauseCircle className="w-4 h-4" />
                        Suspend
                      </button>
                    )}

                    {company.status === 'suspended' && (
                      <button
                        onClick={() => reactivateMutation.mutate(company._id)}
                        disabled={reactivateMutation.isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 transition-all"
                      >
                        <FiPlayCircle className="w-4 h-4" />
                        Reactivate
                      </button>
                    )}

                    {(company.status === 'rejected' || company.status === 'suspended') && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this company?')) {
                            deleteMutation.mutate(company._id);
                          }
                        }}
                        disabled={deleteMutation.isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-400/40 bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-white/10 rounded-2xl p-6 w-full max-w-lg"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Reject Company</h3>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Reason *</label>
                <textarea
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Provide a reason for rejection"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRejectModal({ open: false, companyId: null, reason: '' })}
                  className="flex-1 px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl border border-rose-400/40 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 transition-all"
                  disabled={rejectMutation.isLoading}
                >
                  {rejectMutation.isLoading ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-white/10 rounded-2xl p-6 w-full max-w-lg"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Suspend Company</h3>
            <form onSubmit={handleSuspendSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Reason *</label>
                <textarea
                  value={suspendModal.reason}
                  onChange={(e) => setSuspendModal((prev) => ({ ...prev, reason: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Provide a reason for suspension"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSuspendModal({ open: false, companyId: null, reason: '' })}
                  className="flex-1 px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl border border-orange-400/40 bg-orange-500/20 text-orange-200 hover:bg-orange-500/30 transition-all"
                  disabled={suspendMutation.isLoading}
                >
                  {suspendMutation.isLoading ? 'Suspending...' : 'Suspend'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModal.open && detailsModal.company && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Company Details</h3>
              <button
                onClick={() => setDetailsModal({ open: false, company: null })}
                className="text-white/60 hover:text-white transition-colors"
              >
                <FiXCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Company Name</p>
                <p className="text-white text-lg font-semibold">{detailsModal.company.name}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Domain</p>
                <p className="text-white">{detailsModal.company.domain}</p>
              </div>

              {detailsModal.company.description && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Description</p>
                  <p className="text-white/80 text-sm leading-relaxed">{detailsModal.company.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Status</p>
                  <div className="mt-2">{renderStatusBadge(detailsModal.company.status)}</div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Registration Date</p>
                  <p className="text-white">{new Date(detailsModal.company.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Admin Contact</p>
                <p className="text-white">{detailsModal.company.adminId?.name || 'N/A'}</p>
                <p className="text-white/60 text-sm">{detailsModal.company.adminId?.email || 'N/A'}</p>
                {detailsModal.company.adminId?.phone && (
                  <p className="text-white/60 text-sm">{detailsModal.company.adminId.phone}</p>
                )}
              </div>

              {detailsModal.company.approvedBy && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Approved By</p>
                  <p className="text-white">{detailsModal.company.approvedBy?.name || 'Unknown'}</p>
                  {detailsModal.company.approvedAt && (
                    <p className="text-white/60 text-sm">
                      {new Date(detailsModal.company.approvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {detailsModal.company.rejectionReason && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <p className="text-xs uppercase tracking-wide text-rose-200 mb-2">Rejection/Suspension Reason</p>
                  <p className="text-sm text-rose-100/80">{detailsModal.company.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetailsModal({ open: false, company: null })}
                className="px-6 py-2 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
