import React from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiClock, FiCheckCircle, FiFolder } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { applicationsAPI, projectsAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: applicationsData } = useQuery('myApplications', applicationsAPI.getMyApplications);
  const applications = applicationsData?.data || [];
  
  const { data: projectsData } = useQuery('allProjects', projectsAPI.getAll);
  const projects = projectsData?.data || [];
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const availableProjects = projects.filter(p => !applications.some(app => app.project?._id === p._id)).length;
  const recentApplications = applications.slice(0, 3);
  const featuredProjects = projects.slice(0, 3);
  const activityData = [
    { name: 'Mon', applications: 2, viewed: 5 },
    { name: 'Tue', applications: 3, viewed: 8 },
    { name: 'Wed', applications: 1, viewed: 4 },
    { name: 'Thu', applications: 4, viewed: 10 },
    { name: 'Fri', applications: 2, viewed: 6 },
    { name: 'Sat', applications: 1, viewed: 3 },
    { name: 'Sun', applications: 0, viewed: 2 },
  ];
  const stats = [
    { title: 'Total Applications', value: totalApplications, icon: FiFolder, color: 'from-blue-500 to-purple-500', bgColor: 'bg-blue-500/10' },
    { title: 'Pending', value: pendingApplications, icon: FiClock, color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-500/10' },
    { title: 'Approved', value: approvedApplications, icon: FiCheckCircle, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/10' },
    { title: 'Available Projects', value: availableProjects, icon: FiTrendingUp, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500/10' },
  ];
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'shortlisted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };
  
  return (
    <Layout user={user} title="Dashboard">
      <div className="p-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8"
        >
            <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.name || 'Student'}!</h1>
            <p className="text-indigo-200">Here's what's happening with your projects</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="student-panel p-6 hover:shadow-[0_20px_50px_rgba(139,92,246,0.3)] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} p-3 rounded-xl`}>
                    <stat.icon className="text-2xl text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-indigo-200 text-sm">{stat.title}</p>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 student-panel p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Weekly Activity</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorViewed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorApplications)"
                  />
                  <Area
                    type="monotone"
                    dataKey="viewed"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorViewed)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="student-panel p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/student/projects')}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-purple-500/50"
                >
                  Browse Projects
                </button>
                <button
                  onClick={() => navigate('/student/applications')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl border border-white/30 transition-all"
                >
                  My Applications
                </button>
                <button
                  onClick={() => navigate('/student/resume')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl border border-white/30 transition-all"
                >
                  Build Resume
                </button>
              </div>
            </motion.div>
          </div>

          {/* Recent Applications & Featured Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Recent Applications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="student-panel p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Applications</h2>
                <button
                  onClick={() => navigate('/student/applications')}
                  className="text-blue-300 hover:text-blue-200 text-sm transition"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {recentApplications.length > 0 ? (
                  recentApplications.map((app) => (
                    <div
                      key={app._id}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                      onClick={() => navigate('/student/applications')}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-white font-semibold">
                          {app.projectId?.title || 'Project'}
                        </h3>
                        <span
                          className={
                            'px-3 py-1 rounded-full text-xs font-semibold border ' +
                            getStatusColor(app.status)
                          }
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-indigo-200 text-sm">{app.preferredRole}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-indigo-200">No applications yet</p>
                    <button
                      onClick={() => navigate('/student/projects')}
                      className="mt-4 text-purple-400 hover:text-purple-300 text-sm"
                    >
                      Browse projects to get started →
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Featured Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="student-panel p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Featured Projects</h2>
                <button
                  onClick={() => navigate('/student/projects')}
                  className="text-blue-300 hover:text-blue-200 text-sm transition"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {featuredProjects.length > 0 ? (
                  featuredProjects.map((project) => (
                    <div
                      key={project._id}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                      onClick={() => navigate('/student/projects')}
                    >
                      <h3 className="text-white font-semibold mb-2">{project.title}</h3>
                      <p className="text-indigo-200 text-sm line-clamp-2 mb-2">
                        {project.description}
                      </p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs">
                          {project.category}
                        </span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs">
                          {project.difficulty}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-indigo-200 text-center py-8">No projects available</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
    </Layout>
  );
};
export default StudentDashboard;
