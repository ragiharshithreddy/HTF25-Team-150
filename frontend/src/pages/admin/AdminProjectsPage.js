import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiLayers,
  FiCalendar,
  FiFilter,
  FiSearch,
  FiUsers,
  FiTag,
  FiCpu
} from 'react-icons/fi';
import { projectsAPI, applicationsAPI } from '../../utils/api';
import AdminNavigation from '../../components/AdminNavigation';

const STATUS_OPTIONS = ['draft', 'active', 'closed', 'completed'];
const CATEGORY_OPTIONS = ['web', 'mobile', 'ai-ml', 'blockchain', 'iot', 'data-science', 'other'];
const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'];

const createEmptyForm = () => ({
  title: '',
  description: '',
  category: 'web',
  difficulty: 'intermediate',
  status: 'draft',
  batch: '',
  maxTeamSize: 4,
  deadline: '',
  startDate: '',
  endDate: '',
  requiredSkills: [],
  skillInput: '',
  technologies: [],
  techInput: '',
  availableRoles: [{ role: 'Team Member', count: 2 }],
  isFeatured: false,
  githubRepo: '',
  liveDemo: ''
});

const AdminProjectsPage = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formData, setFormData] = useState(createEmptyForm());
  const [activeFilters, setActiveFilters] = useState({ status: 'all', category: 'all', difficulty: 'all', search: '' });
  const [projectForDeletion, setProjectForDeletion] = useState(null);

  const { data: projectsResponse, isLoading } = useQuery(['adminProjects'], () => projectsAPI.getAll({ sort: '-createdAt', limit: 200 }));
  const projects = projectsResponse?.data || [];

  const { data: applicationStatsResponse } = useQuery(['adminProjectApplicationStats'], () => applicationsAPI.getStats(), { staleTime: 60000 });
  const topProjects = applicationStatsResponse?.data?.topProjects || [];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesStatus = activeFilters.status === 'all' ? true : project.status === activeFilters.status;
      const matchesCategory = activeFilters.category === 'all' ? true : project.category === activeFilters.category;
      const matchesDifficulty = activeFilters.difficulty === 'all' ? true : project.difficulty === activeFilters.difficulty;
      const matchesSearch = activeFilters.search
        ? (project.title?.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
            project.description?.toLowerCase().includes(activeFilters.search.toLowerCase()))
        : true;
      return matchesStatus && matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [projects, activeFilters]);

  const invalidate = () => {
    queryClient.invalidateQueries('adminProjects');
    queryClient.invalidateQueries('projects');
    queryClient.invalidateQueries('adminProjectStats');
    queryClient.invalidateQueries('adminProjectApplicationStats');
  };

  const createMutation = useMutation((payload) => projectsAPI.create(payload), {
    onSuccess: () => {
      toast.success('Project created successfully');
      invalidate();
      setIsFormOpen(false);
      setFormData(createEmptyForm());
    },
    onError: (error) => toast.error(error.message || 'Failed to create project'),
  });

  const updateMutation = useMutation(({ id, payload }) => projectsAPI.update(id, payload), {
    onSuccess: () => {
      toast.success('Project updated successfully');
      invalidate();
      setIsFormOpen(false);
      setFormData(createEmptyForm());
    },
    onError: (error) => toast.error(error.message || 'Failed to update project'),
  });

  const deleteMutation = useMutation((id) => projectsAPI.delete(id), {
    onSuccess: () => {
      toast.success('Project deleted');
      invalidate();
      setProjectForDeletion(null);
    },
    onError: (error) => toast.error(error.message || 'Failed to delete project'),
  });

  const openCreateModal = () => {
    setFormMode('create');
    setFormData(createEmptyForm());
    setIsFormOpen(true);
  };

  const openEditModal = (project) => {
    setFormMode('edit');
    setFormData({
      title: project.title || '',
      description: project.description || '',
      category: project.category || 'web',
      difficulty: project.difficulty || 'intermediate',
      status: project.status || 'draft',
      batch: project.batch || '',
      maxTeamSize: project.maxTeamSize || 4,
      deadline: project.deadline ? project.deadline.substring(0, 10) : '',
      startDate: project.startDate ? project.startDate.substring(0, 10) : '',
      endDate: project.endDate ? project.endDate.substring(0, 10) : '',
      requiredSkills: project.requiredSkills || [],
      skillInput: '',
      technologies: project.technologies || [],
      techInput: '',
      availableRoles: project.availableRoles?.length ? project.availableRoles.map(({ role, count }) => ({ role, count })) : [{ role: 'Team Member', count: 2 }],
      isFeatured: Boolean(project.isFeatured),
      githubRepo: project.githubRepo || '',
      liveDemo: project.liveDemo || '',
      _id: project._id
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Project title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Project description is required');
      return;
    }
    if (!formData.batch.trim()) {
      toast.error('Batch is required');
      return;
    }
    if (!formData.deadline) {
      toast.error('Deadline is required');
      return;
    }
    if (!formData.availableRoles.length) {
      toast.error('Add at least one role');
      return;
    }
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      difficulty: formData.difficulty,
      status: formData.status,
      batch: formData.batch.trim(),
      maxTeamSize: Number(formData.maxTeamSize) || 1,
      deadline: formData.deadline,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      requiredSkills: formData.requiredSkills,
      technologies: formData.technologies,
      availableRoles: formData.availableRoles.map((role) => ({
        role: role.role.trim(),
        count: Number(role.count) || 1,
      })),
      isFeatured: formData.isFeatured,
      githubRepo: formData.githubRepo || undefined,
      liveDemo: formData.liveDemo || undefined,
    };

    if (formMode === 'create') {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate({ id: formData._id, payload });
    }
  };

  const addSkill = () => {
    if (!formData.skillInput.trim()) return;
    if (formData.requiredSkills.includes(formData.skillInput.trim())) return;
    setFormData((prev) => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, prev.skillInput.trim()],
      skillInput: '',
    }));
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((item) => item !== skill),
    }));
  };

  const addTech = () => {
    if (!formData.techInput.trim()) return;
    if (formData.technologies.includes(formData.techInput.trim())) return;
    setFormData((prev) => ({
      ...prev,
      technologies: [...prev.technologies, prev.techInput.trim()],
      techInput: '',
    }));
  };

  const removeTech = (tech) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((item) => item !== tech),
    }));
  };

  const addRole = () => {
    setFormData((prev) => ({
      ...prev,
      availableRoles: [...prev.availableRoles, { role: 'New Role', count: 1 }],
    }));
  };

  const updateRole = (index, key, value) => {
    setFormData((prev) => {
      const nextRoles = [...prev.availableRoles];
      nextRoles[index] = { ...nextRoles[index], [key]: key === 'count' ? Number(value) : value };
      return { ...prev, availableRoles: nextRoles };
    });
  };

  const removeRole = (index) => {
    setFormData((prev) => ({
      ...prev,
      availableRoles: prev.availableRoles.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8">
      <div className="max-w-7xl mx-auto">
        <AdminNavigation />
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-panel relative mb-10 flex flex-col gap-6 overflow-hidden p-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-fuchsia-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-2 h-48 w-48 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="relative z-10 max-w-2xl">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100/70">
              <FiLayers className="h-3.5 w-3.5" /> Catalog
            </p>
            <h1 className="text-3xl font-bold text-white md:text-4xl">Project Catalog</h1>
            <p className="mt-2 text-sm text-indigo-100/75">Curate opportunities, update roles, and keep batches aligned with demand.</p>
          </div>
          <div className="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 px-5 py-3 text-left">
              <p className="text-xs uppercase tracking-[0.25em] text-sky-200/80">Featured</p>
              <p className="text-lg font-semibold text-white">{projects.filter((project) => project.isFeatured).length}</p>
            </div>
            <button onClick={openCreateModal} className="btn-primary inline-flex items-center gap-2">
              <FiPlus className="w-5 h-5" />
              New Project
            </button>
          </div>
        </motion.div>

  <div className="admin-panel--subtle mb-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Search title or description"
                value={activeFilters.search}
                onChange={(e) => setActiveFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <select
                value={activeFilters.status}
                onChange={(e) => setActiveFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all" className="bg-slate-900">All statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option} className="bg-slate-900">
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <FiLayers className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <select
                value={activeFilters.category}
                onChange={(e) => setActiveFilters((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all" className="bg-slate-900">All categories</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option} className="bg-slate-900">
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <FiCpu className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <select
                value={activeFilters.difficulty}
                onChange={(e) => setActiveFilters((prev) => ({ ...prev, difficulty: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all" className="bg-slate-900">All levels</option>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <option key={option} value={option} className="bg-slate-900">
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32 text-white text-lg">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="admin-panel p-16 text-center text-indigo-100/80">
            <FiLayers className="w-12 h-12 mx-auto mb-4 text-indigo-300" />
            <p className="text-xl font-semibold">No projects found for the current filters</p>
            <p className="text-sm mt-2 text-indigo-300/80">Adjust the filters or create a new project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="admin-panel p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{project.title}</h3>
                    <p className="text-white/60 text-sm line-clamp-2">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.isFeatured && (
                      <span className="px-3 py-1 text-xs rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30">Featured</span>
                    )}
                    <span className="px-3 py-1 text-xs rounded-full bg-white/10 text-white/70 border border-white/15">{project.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-2"><FiLayers className="w-4 h-4" /> {project.category}</div>
                  <div className="flex items-center gap-2"><FiTag className="w-4 h-4" /> {project.difficulty}</div>
                  <div className="flex items-center gap-2"><FiUsers className="w-4 h-4" /> Team size {project.maxTeamSize}</div>
                  <div className="flex items-center gap-2"><FiCalendar className="w-4 h-4" /> Apply by {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBA'}</div>
                </div>

                {project.availableRoles && project.availableRoles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.availableRoles.map((role, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded-full text-xs">
                        {role.role} ({role.filled || 0}/{role.count || 0})
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(project)} className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm">
                      <FiEdit className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => setProjectForDeletion(project)} className="btn-danger px-4 py-2 inline-flex items-center gap-2 text-sm">
                      <FiTrash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                  <div className="text-xs text-white/50">Created {new Date(project.createdAt).toLocaleDateString()}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {topProjects.length > 0 && (
          <div className="admin-panel mt-12 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Top Applied Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topProjects.map((project, idx) => (
                <div key={project._id || idx} className="p-4 bg-white/5 border border-white/10 rounded-xl text-white/80">
                  <p className="text-sm text-white/60">#{idx + 1}</p>
                  <p className="text-lg font-semibold text-white mt-1">{project.projectTitle || 'Untitled project'}</p>
                  <p className="text-sm text-white/60 mt-2">{project.applicationCount} applications</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-white/10 rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-1">{formMode === 'create' ? 'Create Project' : 'Update Project'}</h3>
                <p className="text-sm text-white/60">Define roles, skills, and expectations before publishing.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="btn-secondary px-4 py-2">Close</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">Batch *</label>
                  <input
                    type="text"
                    value={formData.batch}
                    onChange={(e) => setFormData((prev) => ({ ...prev, batch: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="eg. Spring 2025"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option} className="bg-slate-900">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData((prev) => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <option key={option} value={option} className="bg-slate-900">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option} className="bg-slate-900">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">Max Team Size *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxTeamSize}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxTeamSize: Number(e.target.value) }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">Deadline *</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">GitHub Repository</label>
                  <input
                    type="url"
                    value={formData.githubRepo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, githubRepo: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://github.com/example/project"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">Live Demo</label>
                  <input
                    type="url"
                    value={formData.liveDemo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, liveDemo: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">Required Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.skillInput}
                    onChange={(e) => setFormData((prev) => ({ ...prev, skillInput: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add a skill and press Enter"
                  />
                  <button type="button" onClick={addSkill} className="btn-secondary px-4">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requiredSkills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded-full text-xs inline-flex items-center gap-2">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-indigo-100">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">Technologies</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.techInput}
                    onChange={(e) => setFormData((prev) => ({ ...prev, techInput: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTech();
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add a technology and press Enter"
                  />
                  <button type="button" onClick={addTech} className="btn-secondary px-4">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-emerald-500/20 text-emerald-200 rounded-full text-xs inline-flex items-center gap-2">
                      {tech}
                      <button type="button" onClick={() => removeTech(tech)} className="text-emerald-100">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-white/70">Available Roles</p>
                  <button type="button" onClick={addRole} className="btn-secondary px-3 py-2 text-sm inline-flex items-center gap-2">
                    <FiPlus className="w-4 h-4" /> Add Role
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.availableRoles.map((role, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-white/5 border border-white/10 rounded-xl p-4">
                      <input
                        type="text"
                        value={role.role}
                        onChange={(e) => updateRole(index, 'role', e.target.value)}
                        className="md:col-span-8 px-4 py-2 bg-white/5 border border-white/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Role title"
                      />
                      <input
                        type="number"
                        min="1"
                        value={role.count}
                        onChange={(e) => updateRole(index, 'count', e.target.value)}
                        className="md:col-span-2 px-4 py-2 bg-white/5 border border-white/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Slots"
                      />
                      <button type="button" onClick={() => removeRole(index)} className="md:col-span-2 btn-danger px-3 py-2 text-sm">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-white/80">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                    className="w-4 h-4 text-indigo-500"
                  />
                  Feature this project on the landing page
                </label>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={createMutation.isLoading || updateMutation.isLoading}>
                  {createMutation.isLoading || updateMutation.isLoading
                    ? 'Saving...'
                    : formMode === 'create'
                      ? 'Create Project'
                      : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {projectForDeletion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-white/10 rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Delete Project</h3>
            <p className="text-sm text-white/70 mb-6">Are you sure you want to permanently delete "{projectForDeletion.title}"? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setProjectForDeletion(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(projectForDeletion._id)}
                className="btn-danger flex-1"
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminProjectsPage;
