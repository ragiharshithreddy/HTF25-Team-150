import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiClock, FiCheckCircle, FiXCircle, FiAlertCircle,
  FiCalendar, FiUser, FiEdit, FiTrash2, FiSearch, FiArrowRight
} from 'react-icons/fi';
import Layout from '../components/Layout';
import { applicationsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ApplicationsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Fetch applications
  const { data: applicationsData, isLoading } = useQuery('myApplications', () =>
    applicationsAPI.getMyApplications(),
    {
      refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
      refetchOnWindowFocus: true
    }
  );

  // Withdraw mutation
  const withdrawMutation = useMutation(
    (id) => applicationsAPI.withdraw(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myApplications');
        queryClient.invalidateQueries('projects');
        toast.success('Application withdrawn successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to withdraw application');
      },
    }
  );

  const applications = applicationsData?.data || [];
  const pendingCount = applications.filter((app) => app.status === 'pending').length;
  const shortlistedCount = applications.filter((app) => app.status === 'shortlisted').length;
  const approvedCount = applications.filter((app) => app.status === 'approved').length;
  const rejectedCount = applications.filter((app) => app.status === 'rejected').length;
  const interviewCount = applications.filter((app) => app.interview?.scheduled).length;
  const successRate = applications.length ? Math.round((approvedCount / applications.length) * 100) : 0;

  // Filter applications
  const filteredApplications = selectedStatus === 'all'
    ? applications
    : applications.filter(app => app.status === selectedStatus);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="w-5 h-5" />;
      case 'approved': return <FiCheckCircle className="w-5 h-5" />;
      case 'rejected': return <FiXCircle className="w-5 h-5" />;
      case 'shortlisted': return <FiAlertCircle className="w-5 h-5" />;
      default: return <FiClock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'shortlisted': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const statuses = [
    { value: 'all', label: 'All', count: applications.length },
    { value: 'pending', label: 'Pending', count: pendingCount },
    { value: 'shortlisted', label: 'Shortlisted', count: shortlistedCount },
    { value: 'approved', label: 'Approved', count: approvedCount },
    { value: 'rejected', label: 'Rejected', count: rejectedCount },
  ];

  return (
    <Layout user={user} title="My Applications">
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          className="student-panel relative mb-8 overflow-hidden p-8"
        >
            <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-fuchsia-500/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-4 h-56 w-56 rounded-full bg-emerald-500/25 blur-3xl" />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-lg">
                <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-300/40 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100/80">
                  Pipeline
                </p>
                <h1 className="text-3xl font-bold text-white md:text-4xl">My Applications</h1>
                <p className="mt-2 text-sm text-indigo-100/75">Track responses, interview invites, and feedback across every application.</p>
              </div>
              <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-100/80">Success rate</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{successRate}%</p>
                  <p className="mt-1 text-xs text-emerald-100/70">{approvedCount} approved</p>
                </div>
                <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.25em] text-amber-100/80">Pending</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{pendingCount}</p>
                  <p className="mt-1 text-xs text-amber-100/70">Awaiting review</p>
                </div>
                <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.25em] text-sky-100/80">Interviews</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{interviewCount}</p>
                  <p className="mt-1 text-xs text-sky-100/70">Scheduled</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Status Overview */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
            {statuses.map((status) => (
              <motion.button
                key={status.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedStatus(status.value)}
                className={`student-panel--subtle border border-white/10 p-4 text-center transition-all ${
                  selectedStatus === status.value ? 'ring-2 ring-purple-500/60' : ''
                }`}
              >
                <div className="text-2xl font-bold text-white">{status.count}</div>
                <div className="mt-1 text-sm text-white/70">{status.label}</div>
              </motion.button>
            ))}
          </div>

          {/* Applications List */}
          {isLoading ? (
            <div className="text-center text-white py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="student-panel relative overflow-hidden p-12 text-center"
            >
              {/* Decorative elements */}
              <div className="pointer-events-none absolute -top-12 right-0 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 left-0 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  {selectedStatus === 'all' ? (
                    <FiSearch className="h-12 w-12 text-white/60" />
                  ) : (
                    <FiAlertCircle className="h-12 w-12 text-white/60" />
                  )}
                </div>

                {/* Message */}
                <h3 className="mb-3 text-2xl font-bold text-white">
                  {selectedStatus === 'all' 
                    ? "No Applications Yet" 
                    : `No ${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Applications`}
                </h3>
                
                <p className="mx-auto mb-8 max-w-md text-white/60">
                  {selectedStatus === 'all'
                    ? "You haven't applied to any projects yet. Start by browsing available projects and find the perfect opportunity for you!"
                    : `You don't have any applications with ${selectedStatus} status. Try selecting a different filter or browse new projects.`}
                </p>

                {/* Action Buttons */}
                {selectedStatus === 'all' ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/student/projects')}
                    className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
                  >
                    <FiSearch className="h-5 w-5" />
                    Browse Available Projects
                    <FiArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                ) : (
                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedStatus('all')}
                      className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
                    >
                      View All Applications
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/student/projects')}
                      className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/25"
                    >
                      <FiSearch className="h-5 w-5" />
                      Browse Projects
                      <FiArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application, index) => (
                <motion.div
                  key={application._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="student-panel p-6 transition-all hover:shadow-[0_35px_75px_rgba(59,130,246,0.35)]"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Application Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Status Badge */}
                        <div className={`rounded-xl border ${getStatusColor(application.status)} p-3`}> 
                          {getStatusIcon(application.status)}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {application.projectId?.title || 'Project'}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/70">
                            <div className="flex items-center gap-2">
                              <FiUser className="w-4 h-4" />
                              <span>Role: {application.preferredRole}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiCalendar className="w-4 h-4" />
                              <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Motivation Preview */}
                          <p className="text-white/60 text-sm mt-3 line-clamp-2">
                            {application.motivation}
                          </p>

                          {/* Skills */}
                          {application.skills && application.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {application.skills.slice(0, 5).map((skill, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                              {application.skills.length > 5 && (
                                <span className="px-2 py-1 bg-white/10 text-white/50 rounded text-xs">
                                  +{application.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Admin Feedback */}
                          {application.adminFeedback && (
                            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                              <p className="text-xs text-white/50 mb-1">Admin Feedback:</p>
                              <p className="text-sm text-white/80">{application.adminFeedback}</p>
                            </div>
                          )}

                          {/* Interview Details */}
                          {application.interview && (
                            <div className="mt-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
                              <p className="text-xs text-blue-300 mb-2">Interview Scheduled</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/80">
                                <div>
                                  <span className="text-white/50">Date: </span>
                                  {new Date(application.interview.scheduledDate).toLocaleString()}
                                </div>
                                {application.interview.location && (
                                  <div>
                                    <span className="text-white/50">Location: </span>
                                    {application.interview.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <div className={`rounded-xl px-4 py-2 text-center text-sm font-semibold ${getStatusColor(application.status)}`}>
                        {application.status.toUpperCase()}
                      </div>

                      {application.status === 'pending' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to withdraw this application?')) {
                              withdrawMutation.mutate(application._id);
                            }
                          }}
                          disabled={withdrawMutation.isLoading}
                          className="flex items-center justify-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-red-200 transition hover:bg-red-500/30"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
    </Layout>
  );
};

export default ApplicationsPage;