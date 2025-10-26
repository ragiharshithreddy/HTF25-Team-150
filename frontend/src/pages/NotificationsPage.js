import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
	FiBell, FiCheckCircle, FiXCircle, FiAlertCircle, FiClock,
	FiTrash2, FiCheck, FiFilter, FiRefreshCw
} from 'react-icons/fi';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

// Mock API - Replace with actual API calls
const notificationsAPI = {
	getAll: () => Promise.resolve({ data: mockNotifications }),
	markAsRead: (id) => Promise.resolve({ data: { id } }),
	markAllAsRead: () => Promise.resolve({ data: {} }),
	delete: (id) => Promise.resolve({ data: { id } })
};

const mockNotifications = [
	{
		_id: '1',
		type: 'application_approved',
		title: 'Application Approved! 🎉',
		message: 'Your application for "Student Portal Development" has been approved. Check your email for next steps.',
		read: false,
		createdAt: new Date(Date.now() - 3600000).toISOString()
	},
	{
		_id: '2',
		type: 'application_rejected',
		title: 'Application Status Update',
		message: 'Unfortunately, your application for "E-Commerce Platform" was not successful this time. Keep improving your skills!',
		read: false,
		createdAt: new Date(Date.now() - 7200000).toISOString()
	},
	{
		_id: '3',
		type: 'test_assigned',
		title: 'New Skill Test Assigned',
		message: 'You have been assigned a skill test for "React.js Developer" role. Complete it within 48 hours.',
		read: true,
		createdAt: new Date(Date.now() - 86400000).toISOString()
	},
	{
		_id: '4',
		type: 'interview_scheduled',
		title: 'Interview Scheduled',
		message: 'Your interview for "ML Data Analyzer" is scheduled for Nov 5, 2025 at 10:00 AM. Please be prepared.',
		read: true,
		createdAt: new Date(Date.now() - 172800000).toISOString()
	},
	{
		_id: '5',
		type: 'certificate_issued',
		title: 'Certificate Issued',
		message: 'Congratulations! Your blockchain-verified certificate for completing "Web Development Fundamentals" is ready.',
		read: true,
		createdAt: new Date(Date.now() - 259200000).toISOString()
	},
	{
		_id: '6',
		type: 'application_shortlisted',
		title: 'You\'re Shortlisted!',
		message: 'Great news! You\'ve been shortlisted for "Mobile App Development". The admin will contact you soon.',
		read: false,
		createdAt: new Date(Date.now() - 1800000).toISOString()
	}
];

const NotificationsPage = () => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [filter, setFilter] = useState('all'); // all, unread, read

	const { data: notificationsData, isLoading } = useQuery('notifications', notificationsAPI.getAll);
	const notifications = notificationsData?.data || [];

	const markAsReadMutation = useMutation(notificationsAPI.markAsRead, {
		onSuccess: () => {
			queryClient.invalidateQueries('notifications');
			toast.success('Notification marked as read');
		}
	});

	const markAllAsReadMutation = useMutation(notificationsAPI.markAllAsRead, {
		onSuccess: () => {
			queryClient.invalidateQueries('notifications');
			toast.success('All notifications marked as read');
		}
	});

	const deleteMutation = useMutation(notificationsAPI.delete, {
		onSuccess: () => {
			queryClient.invalidateQueries('notifications');
			toast.success('Notification deleted');
		}
	});

	const filteredNotifications = notifications.filter(n => {
		if (filter === 'unread') return !n.read;
		if (filter === 'read') return n.read;
		return true;
	});

	const unreadCount = notifications.filter(n => !n.read).length;

	const getNotificationIcon = (type) => {
		switch (type) {
			case 'application_approved':
				return <FiCheckCircle className="h-6 w-6 text-green-400" />;
			case 'application_rejected':
				return <FiXCircle className="h-6 w-6 text-red-400" />;
			case 'application_shortlisted':
				return <FiCheckCircle className="h-6 w-6 text-blue-400" />;
			case 'test_assigned':
				return <FiClock className="h-6 w-6 text-yellow-400" />;
			case 'interview_scheduled':
				return <FiAlertCircle className="h-6 w-6 text-purple-400" />;
			case 'certificate_issued':
				return <FiCheckCircle className="h-6 w-6 text-emerald-400" />;
			default:
				return <FiBell className="h-6 w-6 text-white/50" />;
		}
	};

	const getNotificationColor = (type) => {
		switch (type) {
			case 'application_approved':
			case 'application_shortlisted':
			case 'certificate_issued':
				return 'border-green-500/30 bg-green-500/10';
			case 'application_rejected':
				return 'border-red-500/30 bg-red-500/10';
			case 'test_assigned':
				return 'border-yellow-500/30 bg-yellow-500/10';
			case 'interview_scheduled':
				return 'border-purple-500/30 bg-purple-500/10';
			default:
				return 'border-white/10 bg-white/5';
		}
	};

	const getTimeAgo = (date) => {
		const seconds = Math.floor((new Date() - new Date(date)) / 1000);
		if (seconds < 60) return 'just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days}d ago`;
		return new Date(date).toLocaleDateString();
	};

	return (
		<Layout user={user} title="Notifications">
			<div className="p-6 lg:p-10">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-10"
				>
					<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<h1 className="text-4xl font-bold text-white flex items-center gap-3">
								<FiBell className="h-10 w-10" />
								Notifications
							</h1>
							<p className="mt-2 max-w-2xl text-base text-white/90">
								Stay updated on your applications, tests, and project activities.
							</p>
						</div>
						<div className="flex items-center gap-3">
							<button
								onClick={() => markAllAsReadMutation.mutate()}
								disabled={unreadCount === 0 || markAllAsReadMutation.isLoading}
								className="inline-flex items-center gap-2 rounded-xl bg-purple-500/20 border border-purple-500/30 px-6 py-3 font-semibold text-purple-300 transition hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<FiCheck className="h-4 w-4" />
								Mark All Read
							</button>
							<button
								onClick={() => queryClient.invalidateQueries('notifications')}
								className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
							>
								<FiRefreshCw className="h-4 w-4" />
								Refresh
							</button>
						</div>
					</div>
				</motion.div>

				{/* Stats & Filters */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
				>
					<div className="student-panel p-5">
						<p className="text-sm text-white/60">Total Notifications</p>
						<p className="text-3xl font-bold text-white mt-1">{notifications.length}</p>
					</div>
					<div className="student-panel p-5 border-2 border-red-500/30">
						<p className="text-sm text-white/60">Unread</p>
						<p className="text-3xl font-bold text-red-400 mt-1">{unreadCount}</p>
					</div>
					<div className="student-panel p-5">
						<p className="text-sm text-white/60">Read</p>
						<p className="text-3xl font-bold text-green-400 mt-1">{notifications.length - unreadCount}</p>
					</div>
					<div className="student-panel p-5">
						<p className="text-sm text-white/60 mb-2">Filter</p>
						<div className="flex gap-2">
							{['all', 'unread', 'read'].map((f) => (
								<button
									key={f}
									onClick={() => setFilter(f)}
									className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
										filter === f
											? 'bg-purple-500 text-white'
											: 'bg-white/10 text-white/70 hover:bg-white/20'
									}`}
								>
									{f.charAt(0).toUpperCase() + f.slice(1)}
								</button>
							))}
						</div>
					</div>
				</motion.div>

				{/* Notifications List */}
				<div className="space-y-4">
					{isLoading ? (
						<div className="student-panel p-12 text-center">
							<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
							<p className="text-white/80">Loading notifications...</p>
						</div>
					) : filteredNotifications.length === 0 ? (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							className="student-panel p-12 text-center"
						>
							<FiBell className="mx-auto mb-4 h-16 w-16 text-white/30" />
							<h3 className="text-2xl font-bold text-white mb-2">No Notifications</h3>
							<p className="text-white/60">
								{filter === 'unread'
									? "You're all caught up! No unread notifications."
									: filter === 'read'
									? 'No read notifications yet.'
									: 'No notifications to display.'}
							</p>
						</motion.div>
					) : (
						<AnimatePresence>
							{filteredNotifications.map((notification, index) => (
								<motion.div
									key={notification._id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: -100 }}
									transition={{ delay: index * 0.05 }}
									className={`student-panel p-6 ${getNotificationColor(notification.type)} ${
										!notification.read ? 'border-l-4 border-l-purple-500' : ''
									}`}
								>
									<div className="flex items-start gap-4">
										{/* Icon */}
										<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
											{getNotificationIcon(notification.type)}
										</div>

										{/* Content */}
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-4 mb-2">
												<h3 className="text-lg font-semibold text-white">
													{notification.title}
												</h3>
												<span className="flex-shrink-0 text-xs text-white/50">
													{getTimeAgo(notification.createdAt)}
												</span>
											</div>
											<p className="text-white/80 text-sm mb-3">{notification.message}</p>
											
											<div className="flex items-center gap-2">
												{!notification.read && (
													<button
														onClick={() => markAsReadMutation.mutate(notification._id)}
														disabled={markAsReadMutation.isLoading}
														className="inline-flex items-center gap-1.5 rounded-lg bg-green-500/20 border border-green-500/30 px-3 py-1.5 text-xs font-semibold text-green-300 transition hover:bg-green-500/30"
													>
														<FiCheck className="h-3 w-3" />
														Mark as Read
													</button>
												)}
												<button
													onClick={() => deleteMutation.mutate(notification._id)}
													disabled={deleteMutation.isLoading}
													className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/30"
												>
													<FiTrash2 className="h-3 w-3" />
													Delete
												</button>
											</div>
										</div>
									</div>
								</motion.div>
							))}
						</AnimatePresence>
					)}
				</div>
			</div>
		</Layout>
	);
};

export default NotificationsPage;
