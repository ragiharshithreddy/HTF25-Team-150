import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiUsers,
  FiSearch,
  FiAlertCircle,
  FiTrash2,
  FiXCircle,
  FiCheckCircle,
  FiSettings,
  FiBriefcase,
  FiMail,
  FiPhone
} from 'react-icons/fi';
import api from '../../utils/api';
import AdminNavigation from '../../components/AdminNavigation';

const AdminSettingsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [removeModal, setRemoveModal] = useState({
    open: false,
    student: null,
    project: null,
    reason: '',
    customReason: ''
  });

  const REMOVAL_REASONS = [
    { value: 'malpractice', label: 'Malpractice' },
    { value: 'academic_dishonesty', label: 'Academic Dishonesty' },
    { value: 'code_of_conduct', label: 'Code of Conduct Violation' },
    { value: 'plagiarism', label: 'Plagiarism' },
    { value: 'cheating', label: 'Cheating on Tests' },
    { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
    { value: 'non_participation', label: 'Non-Participation' },
    { value: 'poor_performance', label: 'Poor Performance' },
    { value: 'other', label: 'Other (Specify)' }
  ];

  // Fetch all students with their projects/applications
  const { data: students = [], isLoading } = useQuery(
    ['admin-students', searchTerm],
    async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      const { data } = await api.get(`/api/admin/students?${params}`);
      return data.data || [];
    },
    {
      refetchInterval: 10000, // Refetch every 10 seconds
      refetchOnWindowFocus: true
    }
  );

  // Remove student mutation
  const removeStudentMutation = useMutation(
    async ({ studentId, projectId, reason, customReason }) => {
      const payload = {
        studentId,
        projectId,
        reason,
        details: reason === 'other' ? customReason : undefined
      };
      const { data } = await api.post('/api/admin/students/remove', payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-students');
        queryClient.invalidateQueries('admin-applications');
        toast.success('Student removed successfully');
        setRemoveModal({
          open: false,
          student: null,
          project: null,
          reason: '',
          customReason: ''
        });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to remove student');
      }
    }
  );

  const handleRemoveSubmit = (e) => {
    e.preventDefault();
    if (!removeModal.student || !removeModal.reason) {
      toast.error('Please select a reason');
      return;
    }
    if (removeModal.reason === 'other' && !removeModal.customReason.trim()) {
      toast.error('Please specify the reason');
      return;
    }
    removeStudentMutation.mutate({
      studentId: removeModal.student._id,
      projectId: removeModal.project?._id,
      reason: removeModal.reason,
      customReason: removeModal.customReason
    });
  };

  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      student.name?.toLowerCase().includes(search) ||
      student.email?.toLowerCase().includes(search) ||
      student.phone?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8">
      <div className="max-w-7xl mx-auto">
        <AdminNavigation />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-7 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <FiSettings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
              <p className="text-white/60 mt-1">Manage students and project assignments</p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <div className="mb-8 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Search students by name, email, or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Students List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32 text-white text-lg">
            Loading students...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-16 text-center text-white/80 rounded-2xl border border-white/10 bg-white/5">
            <FiUsers className="w-12 h-12 mx-auto mb-4 text-white/50" />
            <p className="text-xl font-semibold">No students found</p>
            <p className="text-sm mt-2 text-white/60">Try adjusting your search</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {student.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white text-xl font-semibold">{student.name || 'Unknown Student'}</h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <FiMail className="w-4 h-4" />
                            <span>{student.email || 'N/A'}</span>
                          </div>
                          {student.phone && (
                            <div className="flex items-center gap-2 text-sm text-white/70">
                              <FiPhone className="w-4 h-4" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Student's Projects/Applications */}
                    {student.applications && student.applications.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs uppercase tracking-wide text-white/40 mb-3">Active Projects</p>
                        <div className="space-y-2">
                          {student.applications
                            .filter(app => app.status === 'approved')
                            .map((app, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                              >
                                <div className="flex items-center gap-3">
                                  <FiBriefcase className="w-4 h-4 text-indigo-300" />
                                  <div>
                                    <p className="text-white text-sm font-medium">
                                      {app.projectId?.title || 'Unknown Project'}
                                    </p>
                                    <p className="text-white/60 text-xs">
                                      {app.preferredRole || 'No role specified'}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    setRemoveModal({
                                      open: true,
                                      student,
                                      project: app.projectId,
                                      reason: '',
                                      customReason: ''
                                    })
                                  }
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-400/40 bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all text-sm"
                                >
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                  Remove
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Warning for students with no active projects */}
                    {(!student.applications || student.applications.filter(app => app.status === 'approved').length === 0) && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-center gap-2 text-amber-200">
                          <FiAlertCircle className="w-4 h-4" />
                          <p className="text-sm">No active projects</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-full lg:w-60">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Student Stats</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-white/70">
                          <span>Total Applications:</span>
                          <span className="font-semibold text-white">
                            {student.applications?.length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Approved:</span>
                          <span className="font-semibold text-emerald-300">
                            {student.applications?.filter(app => app.status === 'approved').length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Pending:</span>
                          <span className="font-semibold text-amber-300">
                            {student.applications?.filter(app => app.status === 'pending').length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Remove Student Modal */}
      {removeModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-white/10 rounded-2xl p-6 w-full max-w-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <FiAlertCircle className="w-5 h-5 text-red-300" />
              </div>
              <h3 className="text-xl font-semibold text-white">Remove Student from Project</h3>
            </div>

            <form onSubmit={handleRemoveSubmit} className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Student</p>
                <p className="text-white font-medium">{removeModal.student?.name}</p>
                {removeModal.project && (
                  <>
                    <p className="text-xs uppercase tracking-wide text-white/40 mb-2 mt-3">Project</p>
                    <p className="text-white font-medium">{removeModal.project.title}</p>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Reason for Removal <span className="text-red-400">*</span>
                </label>
                <select
                  value={removeModal.reason}
                  onChange={(e) =>
                    setRemoveModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="" className="bg-slate-900">
                    Select a reason...
                  </option>
                  {REMOVAL_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value} className="bg-slate-900">
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {removeModal.reason === 'other' && (
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    Specify Reason <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={removeModal.customReason}
                    onChange={(e) =>
                      setRemoveModal((prev) => ({ ...prev, customReason: e.target.value }))
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Provide details for removal"
                    required
                  />
                </div>
              )}

              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-start gap-2 text-red-200 text-sm">
                  <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>
                    This action will remove the student from the project and notify them via email.
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setRemoveModal({
                      open: false,
                      student: null,
                      project: null,
                      reason: '',
                      customReason: ''
                    })
                  }
                  className="flex-1 px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl border border-red-400/40 bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all"
                  disabled={removeStudentMutation.isLoading}
                >
                  {removeStudentMutation.isLoading ? 'Removing...' : 'Remove Student'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
