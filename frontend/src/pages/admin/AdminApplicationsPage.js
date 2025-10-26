import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiSearch,
  FiFilter,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiCalendar,
  FiPaperclip,
  FiVideo,
  FiMessageCircle,
  FiPhone
} from 'react-icons/fi';
import { applicationsAPI } from '../../utils/api';
import AdminNavigation from '../../components/AdminNavigation';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const statusMeta = {
  pending: {
    label: 'Pending',
    icon: FiClock,
    badge: 'bg-amber-500/15 text-amber-200 border border-amber-500/30'
  },
  shortlisted: {
    label: 'Shortlisted',
    icon: FiAlertCircle,
    badge: 'bg-sky-500/15 text-sky-200 border border-sky-500/30'
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
  }
};

const AdminApplicationsPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectModal, setRejectModal] = useState({ open: false, applicationId: null, reason: '' });
  const [interviewModal, setInterviewModal] = useState({
    open: false,
    applicationId: null,
    scheduledDate: '',
    interviewMode: 'online',
    meetingLink: '',
    notes: ''
  });

  const { data: applicationsResponse, isLoading } = useQuery(
    ['adminApplications'],
    () => applicationsAPI.getAll({ sort: '-createdAt', limit: 200 }),
    {
      refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
      refetchOnWindowFocus: true
    }
  );

  const applications = applicationsResponse?.data || [];
  const pendingCount = applications.filter((app) => app.status === 'pending').length;
  const shortlistedCount = applications.filter((app) => app.status === 'shortlisted').length;
  const approvedCount = applications.filter((app) => app.status === 'approved').length;
  const rejectedCount = applications.filter((app) => app.status === 'rejected').length;
  const scheduledInterviews = applications.filter((app) => app.interview?.scheduled).length;
  const approvalRatio = applications.length ? Math.round((approvedCount / applications.length) * 100) : 0;

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = statusFilter === 'all' ? true : app.status === statusFilter;
      if (!matchesStatus) return false;
      if (!searchTerm.trim()) return true;
      const needle = searchTerm.trim().toLowerCase();
      const studentName = app.studentId?.name?.toLowerCase() || '';
      const studentEmail = app.studentId?.email?.toLowerCase() || '';
      const projectTitle = app.projectId?.title?.toLowerCase() || '';
      return studentName.includes(needle) || studentEmail.includes(needle) || projectTitle.includes(needle);
    });
  }, [applications, searchTerm, statusFilter]);

  const invalidate = () => {
    queryClient.invalidateQueries('adminApplications');
    queryClient.invalidateQueries('adminApplicationStats');
    queryClient.invalidateQueries('adminLatestApplications');
    queryClient.invalidateQueries('adminProjectStats');
  };

  const shortlistMutation = useMutation((id) => applicationsAPI.shortlist(id), {
    onSuccess: () => {
      toast.success('Application shortlisted');
      invalidate();
    },
    onError: (error) => toast.error(error.message || 'Failed to shortlist application'),
  });

  const approveMutation = useMutation((id) => applicationsAPI.approve(id), {
    onSuccess: () => {
      toast.success('Application approved');
      invalidate();
    },
    onError: (error) => toast.error(error.message || 'Failed to approve application'),
  });

  const rejectMutation = useMutation(
    ({ id, reason }) => applicationsAPI.reject(id, { reason }),
    {
      onSuccess: () => {
        toast.success('Application rejected');
        invalidate();
        setRejectModal({ open: false, applicationId: null, reason: '' });
      },
      onError: (error) => toast.error(error.message || 'Failed to reject application'),
    }
  );

  const interviewMutation = useMutation(
    ({ id, payload }) => applicationsAPI.scheduleInterview(id, payload),
    {
      onSuccess: () => {
        toast.success('Interview scheduled');
        invalidate();
        setInterviewModal({ open: false, applicationId: null, scheduledDate: '', interviewMode: 'online', meetingLink: '', notes: '' });
      },
      onError: (error) => toast.error(error.message || 'Failed to schedule interview'),
    }
  );

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
    if (!rejectModal.applicationId) return;
    if (!rejectModal.reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    rejectMutation.mutate({ id: rejectModal.applicationId, reason: rejectModal.reason.trim() });
  };

  const handleInterviewSubmit = (e) => {
    e.preventDefault();
    if (!interviewModal.applicationId) return;
    if (!interviewModal.scheduledDate) {
      toast.error('Select an interview date');
      return;
    }
    const payload = {
      scheduledDate: interviewModal.scheduledDate,
      interviewMode: interviewModal.interviewMode,
      meetingLink: interviewModal.meetingLink || undefined,
      notes: interviewModal.notes || undefined,
    };
    interviewMutation.mutate({ id: interviewModal.applicationId, payload });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8">
      <div className="max-w-7xl mx-auto">
        <AdminNavigation />
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-panel relative mb-10 overflow-hidden p-7"
        >
          <div className="pointer-events-none absolute -top-28 right-0 h-60 w-60 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100/80">
                Pipeline
              </p>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Application Pipeline</h1>
              <p className="mt-2 text-sm text-indigo-100/75">Review, shortlist, and approve candidates across every project.</p>
            </div>
            <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">Approval rate</p>
                <p className="mt-2 text-3xl font-semibold text-white">{approvalRatio}%</p>
                <p className="mt-1 text-xs text-emerald-100/70">{approvedCount} approvals</p>
              </div>
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-amber-200/80">Pending</p>
                <p className="mt-2 text-3xl font-semibold text-white">{pendingCount}</p>
                <p className="mt-1 text-xs text-amber-100/70">Awaiting review</p>
              </div>
              <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-sky-200/80">Interviews</p>
                <p className="mt-2 text-3xl font-semibold text-white">{scheduledInterviews}</p>
                <p className="mt-1 text-xs text-sky-100/70">Scheduled</p>
              </div>
            </div>
          </div>
        </motion.div>

  <div className="admin-panel--subtle mb-8 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Search by student or project"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-100/70">Visible</p>
                <p className="text-xl font-semibold text-white">{filteredApplications.length}</p>
              </div>
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Total</p>
                <p className="text-xl font-semibold text-white">{applications.length}</p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32 text-white text-lg">
            Loading applications...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="admin-panel p-16 text-center text-indigo-100/80">
            <FiUsers className="w-12 h-12 mx-auto mb-4 text-indigo-300" />
            <p className="text-xl font-semibold">No applications match the current filters</p>
            <p className="text-sm mt-2 text-indigo-300/80">Try adjusting the status or search keywords.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application, index) => (
              <motion.div
                key={application._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="admin-panel p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-white text-lg font-semibold">{application.studentId?.name || 'Unknown Student'}</p>
                        <p className="text-white/60 text-sm">{application.studentId?.email}</p>
                      </div>
                      {renderStatusBadge(application.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                          <FiUsers className="w-4 h-4" />
                        </div>
                        <span className="truncate">{application.projectId?.title || 'Project removed'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                          <FiCalendar className="w-4 h-4" />
                        </div>
                        <span className="truncate">{new Date(application.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                          <FiPaperclip className="w-4 h-4" />
                        </div>
                        <span className="truncate">{application.preferredRole || 'Role n/a'}</span>
                      </div>
                      {application.studentId?.phone && (
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                            <FiPhone className="w-4 h-4" />
                          </div>
                          <span className="truncate">{application.studentId.phone}</span>
                        </div>
                      )}
                    </div>

                    {application.motivation && (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Motivation</p>
                        <p className="text-sm text-white/80 leading-relaxed line-clamp-3">{application.motivation}</p>
                      </div>
                    )}

                    {application.interview?.scheduled && (
                      <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30">
                        <p className="text-xs uppercase tracking-wide text-sky-200 mb-2">Interview Scheduled</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-sky-100">
                          <div className="flex items-center gap-2">
                            <FiCalendar className="w-4 h-4" />
                            <span>{new Date(application.interview.scheduledDate).toLocaleString()}</span>
                          </div>
                          {application.interview.interviewMode && (
                            <div className="flex items-center gap-2">
                              <FiVideo className="w-4 h-4" />
                              <span>{application.interview.interviewMode}</span>
                            </div>
                          )}
                          {application.interview.meetingLink && (
                            <div className="flex items-center gap-2">
                              <FiMessageCircle className="w-4 h-4" />
                              <a href={application.interview.meetingLink} target="_blank" rel="noopener noreferrer" className="underline">
                                Join Link
                              </a>
                            </div>
                          )}
                          {application.interview.notes && (
                            <div className="text-sm text-sky-100/80">
                              Notes: {application.interview.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {application.skills && application.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {application.skills.slice(0, 8).map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs">
                            {skill}
                          </span>
                        ))}
                        {application.skills.length > 8 && (
                          <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs">
                            +{application.skills.length - 8} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="w-full lg:w-60 flex flex-col gap-3">
                    <button
                      disabled={application.status !== 'pending' || shortlistMutation.isLoading}
                      onClick={() => shortlistMutation.mutate(application._id)}
                      className="btn-secondary"
                    >
                      Shortlist
                    </button>
                    <button
                      disabled={!(application.status === 'pending' || application.status === 'shortlisted') || approveMutation.isLoading}
                      onClick={() => approveMutation.mutate(application._id)}
                      className="btn-primary"
                    >
                      Approve
                    </button>
                    <button
                      disabled={rejectMutation.isLoading}
                      onClick={() => setRejectModal({ open: true, applicationId: application._id, reason: '' })}
                      className="btn-danger"
                    >
                      Reject
                    </button>
                    <button
                      disabled={application.status !== 'shortlisted' || interviewMutation.isLoading}
                      onClick={() => setInterviewModal({
                        open: true,
                        applicationId: application._id,
                        scheduledDate: application.interview?.scheduledDate ? application.interview.scheduledDate.split('T')[0] : '',
                        interviewMode: application.interview?.interviewMode || 'online',
                        meetingLink: application.interview?.meetingLink || '',
                        notes: application.interview?.notes || ''
                      })}
                      className="btn-secondary border border-indigo-400/40 hover:bg-indigo-500/20"
                    >
                      Schedule Interview
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-white/10 rounded-2xl p-6 w-full max-w-lg"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Reject Application</h3>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Reason</label>
                <textarea
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Let the student know why the application was rejected"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setRejectModal({ open: false, applicationId: null, reason: '' })} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-danger flex-1" disabled={rejectMutation.isLoading}>
                  {rejectMutation.isLoading ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {interviewModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-white/10 rounded-2xl p-6 w-full max-w-2xl"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Schedule Interview</h3>
            <form onSubmit={handleInterviewSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={interviewModal.scheduledDate}
                    onChange={(e) => setInterviewModal((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">Mode</label>
                  <select
                    value={interviewModal.interviewMode}
                    onChange={(e) => setInterviewModal((prev) => ({ ...prev, interviewMode: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="online" className="bg-slate-900">Online</option>
                    <option value="in-person" className="bg-slate-900">In Person</option>
                    <option value="phone" className="bg-slate-900">Phone</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Meeting link (optional)</label>
                <input
                  type="url"
                  value={interviewModal.meetingLink}
                  onChange={(e) => setInterviewModal((prev) => ({ ...prev, meetingLink: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Notes</label>
                <textarea
                  value={interviewModal.notes}
                  onChange={(e) => setInterviewModal((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Share preparation guides, expectations, or venue details"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setInterviewModal({ open: false, applicationId: null, scheduledDate: '', interviewMode: 'online', meetingLink: '', notes: '' })} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={interviewMutation.isLoading}>
                  {interviewMutation.isLoading ? 'Scheduling...' : 'Schedule'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminApplicationsPage;
