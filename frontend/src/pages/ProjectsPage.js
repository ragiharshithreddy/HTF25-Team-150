import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import {
  FiSearch,
  FiFilter,
  FiCalendar,
  FiUsers,
  FiTrendingUp,
  FiCode,
  FiStar,
  FiX
} from 'react-icons/fi';
import Layout from '../components/Layout';
import { projectsAPI, applicationsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProjectsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // Fetch projects
  const { data: projectsData, isLoading } = useQuery('projects', () => 
    projectsAPI.getAll()
  );

  // Fetch my applications
  const { data: myApplicationsData } = useQuery('myApplications', () => 
    applicationsAPI.getMyApplications()
  );

  // Apply mutation
  const applyMutation = useMutation(
    ({ projectId, data }) => applicationsAPI.apply(projectId, data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('myApplications');
        queryClient.invalidateQueries('projects');
        toast.success('🎉 Application submitted successfully! Admin will review your application soon.');
        setShowApplicationModal(false);
        setSelectedProject(null);
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to submit application';
        
        // Custom messages based on error type
        if (errorMessage.includes('not accepting applications')) {
          toast.error('⛔ This project is not currently accepting applications.');
        } else if (errorMessage.includes('deadline has passed')) {
          toast.error('⏰ Application deadline has passed for this project.');
        } else if (errorMessage.includes('already applied')) {
          toast.error('✋ You have already applied to this project!');
        } else if (errorMessage.includes('No available slots')) {
          toast.error('😔 No available slots for this role. Try another role!');
        } else if (errorMessage.includes('role not found')) {
          toast.error('❌ The selected role is not available for this project.');
        } else {
          toast.error(`❌ ${errorMessage}`);
        }
      },
    }
  );

  const projects = projectsData?.data || [];
  const myApplications = myApplicationsData?.data || [];
  const totalProjects = projects.length;
  const featuredCount = projects.filter((project) => project.isFeatured).length;
  const appliedCount = myApplications.length;
  const upcomingDeadlineThreshold = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  }, []);
  const closingSoonCount = projects.filter((project) => {
    if (!project.deadline) return false;
    const deadlineDate = new Date(project.deadline);
    if (Number.isNaN(deadlineDate.getTime())) return false;
    const now = new Date();
    return deadlineDate >= now && deadlineDate <= upcomingDeadlineThreshold;
  }).length;

  // Check if already applied
  const hasApplied = (projectId) => {
    return myApplications.some(app => {
      const projectRef = app.projectId;
      if (!projectRef) return false;
      if (typeof projectRef === 'string') {
        return projectRef === projectId;
      }
      return projectRef._id === projectId;
    });
  };

  // Check if project is accepting applications
  const isAcceptingApplications = (project) => {
    if (project.status !== 'active') return false;
    if (new Date() > new Date(project.deadline)) return false;
    return true;
  };

  // Get application status message
  const getApplicationStatus = (project) => {
    if (hasApplied(project._id)) {
      return { message: 'Already Applied', color: 'bg-white/10 text-white/40', canApply: false };
    }
    if (project.status !== 'active') {
      return { message: 'Not Accepting Applications', color: 'bg-red-500/20 text-red-300', canApply: false };
    }
    if (new Date() > new Date(project.deadline)) {
      return { message: 'Deadline Passed', color: 'bg-orange-500/20 text-orange-300', canApply: false };
    }
    return { message: 'Apply Now', color: 'bg-gradient-to-r from-purple-500 to-sky-500 text-white shadow-[0_18px_40px_rgba(99,102,241,0.3)] hover:shadow-[0_24px_45px_rgba(59,130,246,0.35)]', canApply: true };
  };

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || project.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = ['all', 'web', 'mobile', 'ai-ml', 'blockchain', 'iot', 'data-science'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-300';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300';
      case 'advanced': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      web: 'bg-blue-500/20 text-blue-300',
      mobile: 'bg-purple-500/20 text-purple-300',
      'ai-ml': 'bg-pink-500/20 text-pink-300',
      blockchain: 'bg-orange-500/20 text-orange-300',
      iot: 'bg-teal-500/20 text-teal-300',
      'data-science': 'bg-indigo-500/20 text-indigo-300',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300';
  };

  const totalOpenRoles = filteredProjects.reduce((sum, project) => {
    const roleSlots = (project.availableRoles || []).reduce((roleSum, role) => {
      const total = Number(role.count) || 0;
      const filled = Number(role.filled) || 0;
      return roleSum + Math.max(total - filled, 0);
    }, 0);
    return sum + roleSlots;
  }, 0);

  const filteredFeaturedCount = filteredProjects.filter((project) => project.isFeatured).length;

  return (
    <Layout user={user} title="Browse Projects">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="student-panel relative mb-10 overflow-hidden p-8"
      >
            <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-violet-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-2 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-300/40 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100/80">
                  Discover
                </p>
                <h1 className="text-3xl font-bold text-white md:text-4xl">Browse Projects</h1>
                <p className="mt-2 text-sm text-indigo-100/75">Match with curated builds, see where cohorts need talent, and apply with confidence.</p>
              </div>
              <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-purple-400/40 bg-purple-500/10 p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.25em] text-purple-100/80">Open projects</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{totalProjects}</p>
                  <p className="mt-1 text-xs text-purple-100/70">{featuredCount} featured</p>
                </div>
                <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.25em] text-sky-100/80">Closing soon</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{closingSoonCount}</p>
                  <p className="mt-1 text-xs text-sky-100/70">Within 7 days</p>
                </div>
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-100/80">My pipeline</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{appliedCount}</p>
                  <p className="mt-1 text-xs text-emerald-100/70">Applications sent</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <div className="student-panel--subtle mb-8 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 transform text-white/50" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/40 outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/30"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 transform text-white/50" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/30"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-gray-800">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="relative">
                <FiTrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 transform text-white/50" />
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/30"
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff} className="bg-gray-800">
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="mb-6 grid grid-cols-1 gap-4 text-xs text-white/70 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="uppercase tracking-[0.3em] text-white/50">Matching</p>
              <p className="mt-2 text-lg font-semibold text-white">{filteredProjects.length} projects</p>
            </div>
            <div className="rounded-2xl border border-purple-400/30 bg-purple-500/10 p-4">
              <p className="uppercase tracking-[0.3em] text-purple-100/70">Open roles</p>
              <p className="mt-2 text-lg font-semibold text-white">{totalOpenRoles}</p>
            </div>
            <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4">
              <p className="uppercase tracking-[0.3em] text-sky-100/70">Featured in view</p>
              <p className="mt-2 text-lg font-semibold text-white">{filteredFeaturedCount}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-white py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4">Loading projects...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="student-panel cursor-pointer p-6 transition-all duration-300 hover:shadow-[0_35px_75px_rgba(59,130,246,0.35)]"
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(project.category)}`}>
                          {project.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                          {project.difficulty}
                        </span>
                        {project.isFeatured && (
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-300 flex items-center gap-1">
                            <FiStar className="w-3 h-3" /> Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/70 text-sm mb-4 line-clamp-3">{project.description}</p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 3).map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs flex items-center gap-1">
                        <FiCode className="w-3 h-3" /> {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-2 py-1 bg-white/10 text-white/50 rounded text-xs">
                        +{project.technologies.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-white/70">
                      <FiUsers className="w-4 h-4" />
                      <span>{project.maxTeamSize} members</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <FiCalendar className="w-4 h-4" />
                      <span>{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Project Status Badge */}
                  {!isAcceptingApplications(project) && !hasApplied(project._id) && (
                    <div className="mb-3 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-center text-sm">
                      {project.status !== 'active' ? (
                        <span className="text-red-300">⛔ Not Accepting Applications</span>
                      ) : (
                        <span className="text-orange-300">⏰ Deadline Passed</span>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const status = getApplicationStatus(project);
                      if (status.canApply) {
                        setSelectedProject(project);
                        setShowApplicationModal(true);
                      } else {
                        // Show toast with reason why can't apply
                        if (project.status !== 'active') {
                          toast.error('⛔ This project is not currently accepting applications');
                        } else if (new Date() > new Date(project.deadline)) {
                          toast.error('⏰ The application deadline has passed');
                        }
                      }
                    }}
                    disabled={!getApplicationStatus(project).canApply}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition ${getApplicationStatus(project).color} ${
                      !getApplicationStatus(project).canApply ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    {getApplicationStatus(project).message}
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {filteredProjects.length === 0 && !isLoading && (
          <div className="student-panel p-12 text-center text-white/75">
            <p className="text-xl font-semibold">No projects found matching your criteria</p>
            <p className="mt-2 text-sm text-white/60">Adjust filters or check back soon for fresh opportunities.</p>
          </div>
        )}

      {/* Application Modal */}
      {showApplicationModal && selectedProject && (
        <ApplicationModal
          project={selectedProject}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedProject(null);
          }}
          onSubmit={(data) => applyMutation.mutate({ projectId: selectedProject._id, data })}
          isSubmitting={applyMutation.isLoading}
        />
      )}
    </Layout>
  );
};// Application Modal Component
const ApplicationModal = ({ project, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    preferredRole: project.availableRoles[0]?.role || '',
    motivation: '',
    skills: [],
    skillInput: '',
    availability: {
      hoursPerWeek: 20,
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      preferredRole: formData.preferredRole,
      motivation: formData.motivation,
      skills: formData.skills,
      availability: formData.availability,
    };
    onSubmit(data);
  };

  const addSkill = () => {
    if (formData.skillInput.trim() && !formData.skills.includes(formData.skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.skillInput.trim()],
        skillInput: '',
      });
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Apply to {project.title}</h2>
            <p className="text-white/70">Submit your application</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preferred Role */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Preferred Role *
            </label>
            <select
              value={formData.preferredRole}
              onChange={(e) => setFormData({ ...formData, preferredRole: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {project.availableRoles.map((role, i) => (
                <option key={i} value={role.role} className="bg-gray-800">
                  {role.role} ({role.filled}/{role.count} filled)
                </option>
              ))}
            </select>
          </div>

          {/* Motivation */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Why do you want to join this project? *
            </label>
            <textarea
              value={formData.motivation}
              onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Explain your interest and relevant experience..."
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Your Skills
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={formData.skillInput}
                onChange={(e) => setFormData({ ...formData, skillInput: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add a skill and press Enter"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-sm flex items-center gap-2">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-white"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Hours per week
              </label>
              <input
                type="number"
                value={formData.availability.hoursPerWeek}
                onChange={(e) => setFormData({
                  ...formData,
                  availability: { ...formData.availability, hoursPerWeek: parseInt(e.target.value) }
                })}
                min="1"
                max="40"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Start date
              </label>
              <input
                type="date"
                value={formData.availability.startDate}
                onChange={(e) => setFormData({
                  ...formData,
                  availability: { ...formData.availability, startDate: e.target.value }
                })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProjectsPage;