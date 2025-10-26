import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import {
	FiUsers,
	FiCheckCircle,
	FiClock,
	FiFolder,
	FiActivity,
	FiTrendingUp
} from 'react-icons/fi';
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	PieChart,
	Pie,
	Cell,
	Legend
} from 'recharts';
import { applicationsAPI, projectsAPI } from '../../utils/api';
import AdminNavigation from '../../components/AdminNavigation';

const STATUS_LABELS = {
	pending: 'Pending',
	shortlisted: 'Shortlisted',
	approved: 'Approved',
	rejected: 'Rejected'
};

const PIE_COLORS = ['#6366F1', '#22D3EE', '#F97316', '#10B981', '#EC4899', '#F59E0B'];

const AdminDashboard = () => {
	const {
		data: applicationStatsResponse,
		isLoading: applicationsLoading
	} = useQuery('adminApplicationStats', applicationsAPI.getStats);

	const {
		data: projectStatsResponse,
		isLoading: projectsLoading
	} = useQuery('adminProjectStats', projectsAPI.getStats);

	const {
		data: latestApplicationsResponse,
		isLoading: latestLoading
	} = useQuery(['adminLatestApplications'], () => applicationsAPI.getAll({ limit: 6 }));

	const applicationStats = applicationStatsResponse?.data || {};
	const projectStats = projectStatsResponse?.data || {};
	const latestApplications = latestApplicationsResponse?.data || [];

	const statusStats = applicationStats.statusStats || [];
	const totalApplications = applicationStats.total || 0;
	const pendingApplications = statusStats.find((item) => item._id === 'pending')?.count || 0;
	const approvedApplications = statusStats.find((item) => item._id === 'approved')?.count || 0;
	const shortlistedApplications = statusStats.find((item) => item._id === 'shortlisted')?.count || 0;

	const projectStatusStats = projectStats.statusStats || [];
	const activeProjects = projectStatusStats.find((item) => item._id === 'active')?.count || 0;

	const categoryStats = projectStats.categoryStats || [];
	const topProjects = applicationStats.topProjects || [];

	const approvalRate = totalApplications ? Math.round((approvedApplications / totalApplications) * 100) : 0;
	const shortlistRate = totalApplications ? Math.round((shortlistedApplications / totalApplications) * 100) : 0;
	const pendingRatio = totalApplications ? Math.round((pendingApplications / totalApplications) * 100) : 0;

	const statusChartData = useMemo(
		() =>
			statusStats.map((item) => ({
				name: STATUS_LABELS[item._id] || item._id,
				value: item.count || 0
			})),
		[statusStats]
	);

	const categoryChartData = useMemo(
		() =>
			categoryStats.map((item) => ({
				name: item._id || 'Uncategorized',
				value: item.count || 0
			})),
		[categoryStats]
	);

	const isLoading = applicationsLoading || projectsLoading || latestLoading;

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
				<div className="text-white text-xl">Loading admin insights...</div>
			</div>
		);
	}

	const statsCards = [
		{
			title: 'Total Applications',
			value: totalApplications,
			description: 'All time submissions',
			icon: FiFolder,
			accent: 'from-indigo-500/80 via-sky-500/70 to-indigo-400/80'
		},
		{
			title: 'Pending Review',
			value: pendingApplications,
			description: `${pendingRatio}% of pipeline`,
			icon: FiClock,
			accent: 'from-amber-500/80 via-orange-500/70 to-amber-400/80'
		},
		{
			title: 'Approved',
			value: approvedApplications,
			description: `${approvalRate}% approval rate`,
			icon: FiCheckCircle,
			accent: 'from-emerald-500/80 via-teal-500/70 to-emerald-400/80'
		},
		{
			title: 'Active Projects',
			value: activeProjects,
			description: 'Open for placement',
			icon: FiActivity,
			accent: 'from-purple-500/80 via-fuchsia-500/70 to-purple-400/80'
		}
	];

	const formatStatus = (status) => STATUS_LABELS[status] || status;

	const formatDate = (value) => {
		if (!value) return '—';
		const date = new Date(value);
		return date.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8">
			<div className="max-w-7xl mx-auto">
				<AdminNavigation />
				<motion.div
					initial={{ opacity: 0, y: -18 }}
					animate={{ opacity: 1, y: 0 }}
					className="admin-panel relative mb-12 overflow-hidden p-8"
				>
					<div className="pointer-events-none absolute inset-0 opacity-70">
						<div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-indigo-500/40 blur-3xl" />
						<div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-sky-500/30 blur-3xl" />
					</div>
					<div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
						<div className="max-w-2xl">
							<p className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100/80">
								<span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live Ops
							</p>
							<h1 className="text-4xl font-bold text-white">Admin Command Center</h1>
							<p className="mt-3 text-sm leading-relaxed text-indigo-100/80">
								Monitor applications, track project health, and move approvals forward without losing momentum.
							</p>
						</div>
						<div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
							<div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-white/90">
								<p className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">Approval rate</p>
								<p className="mt-2 text-3xl font-semibold text-white">{approvalRate}%</p>
								<p className="mt-1 text-xs text-emerald-100/70">{approvedApplications} approvals</p>
							</div>
							<div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-white/90">
								<p className="text-xs uppercase tracking-[0.25em] text-amber-200/80">Awaiting review</p>
								<p className="mt-2 text-3xl font-semibold text-white">{pendingApplications}</p>
								<p className="mt-1 text-xs text-amber-100/70">{pendingRatio}% of pipeline</p>
							</div>
							<div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 text-white/90">
								<p className="text-xs uppercase tracking-[0.25em] text-sky-200/80">Shortlisted</p>
								<p className="mt-2 text-3xl font-semibold text-white">{shortlistedApplications}</p>
								<p className="mt-1 text-xs text-sky-100/70">{shortlistRate}% conversion</p>
							</div>
						</div>
					</div>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
					{statsCards.map((card, index) => (
						<motion.div
							key={card.title}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
							className="admin-panel--subtle p-6"
						>
							<div className="flex items-center justify-between">
								<div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} shadow-[0_15px_25px_rgba(79,70,229,0.35)]`}>
									<card.icon className="text-2xl text-white" />
								</div>
								<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-100/80">
									Live
								</span>
							</div>
							<div className="mt-6">
								<p className="text-xs uppercase tracking-[0.3em] text-indigo-200/60">{card.title}</p>
								<p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
								<p className="mt-2 text-xs text-indigo-100/70">{card.description}</p>
							</div>
						</motion.div>
					))}
				</div>

				<div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className="admin-panel xl:col-span-2 p-6"
					>
						<div className="flex items-center justify-between mb-6">
							<div>
								<h2 className="text-2xl font-semibold text-white">Applications by Status</h2>
								<p className="text-indigo-200 text-sm">Track how candidates progress through the pipeline</p>
							</div>
							<FiTrendingUp className="text-indigo-200 text-2xl" />
						</div>
						{statusChartData.length > 0 ? (
							<ResponsiveContainer width="100%" height={320}>
								<BarChart data={statusChartData}>
									<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
									<XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
									<YAxis allowDecimals={false} stroke="rgba(255,255,255,0.5)" />
									<Tooltip
										contentStyle={{
											backgroundColor: 'rgba(15, 23, 42, 0.92)',
											border: '1px solid rgba(255,255,255,0.2)',
											borderRadius: '12px',
											color: '#fff'
										}}
									/>
									<Bar dataKey="value" fill="#6366F1" radius={[12, 12, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						) : (
							<div className="text-indigo-200 text-sm">No application data yet.</div>
						)}
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="admin-panel p-6"
					>
						<h2 className="text-2xl font-semibold text-white mb-6">Projects by Category</h2>
						{categoryChartData.length > 0 ? (
							<ResponsiveContainer width="100%" height={320}>
								<PieChart>
									<Pie
										data={categoryChartData}
										dataKey="value"
										nameKey="name"
										innerRadius={60}
										outerRadius={110}
										paddingAngle={4}
									>
										{categoryChartData.map((entry, index) => (
											<Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
										))}
									</Pie>
									<Legend
										verticalAlign="bottom"
										height={36}
										wrapperStyle={{ color: 'rgba(226,232,240,0.8)' }}
									/>
								</PieChart>
							</ResponsiveContainer>
						) : (
							<div className="text-indigo-200 text-sm">No projects available yet.</div>
						)}
					</motion.div>
				</div>

				<div className="mt-12 grid grid-cols-1 gap-8 xl:grid-cols-2">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.15 }}
						className="admin-panel p-6"
					>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl font-semibold text-white">Latest Applications</h2>
							<FiUsers className="text-indigo-200 text-2xl" />
						</div>
						<div className="space-y-4">
							{latestApplications.length > 0 ? (
								latestApplications.map((application) => (
									<div
										key={application._id}
										className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
									>
										<div className="flex justify-between items-start">
											<div>
												<p className="text-white font-semibold">
													{application.studentId?.name || 'Unknown Student'}
												</p>
												<p className="text-indigo-200 text-sm">
													{application.projectId?.title || 'Untitled Project'}
												</p>
											</div>
											<span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-100 border border-white/20">
												{formatStatus(application.status)}
											</span>
										</div>
										<div className="flex justify-between items-center mt-3 text-xs text-indigo-200">
											<span>{application.preferredRole || '—'}</span>
											<span>{formatDate(application.createdAt)}</span>
										</div>
									</div>
								))
							) : (
								<div className="text-indigo-200 text-sm">No applications submitted yet.</div>
							)}
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.25 }}
						className="admin-panel p-6"
					>
						<h2 className="text-2xl font-semibold text-white mb-6">Top Projects by Interest</h2>
						<div className="space-y-4">
							{topProjects.length > 0 ? (
								topProjects.map((project, index) => (
									<div
										key={project._id || project.projectTitle}
										className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
									>
										<div>
											<p className="text-white font-semibold">{project.projectTitle || 'Untitled Project'}</p>
											<p className="text-indigo-200 text-sm">{project.applicationCount} applications</p>
										</div>
										<span className="text-indigo-100 text-sm">#{index + 1}</span>
									</div>
								))
							) : (
								<div className="text-indigo-200 text-sm">No application activity recorded yet.</div>
							)}
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
