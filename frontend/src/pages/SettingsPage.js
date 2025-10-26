import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
	FiSettings, FiBell, FiMail, FiMessageSquare, FiLock,
	FiEye, FiEyeOff, FiGlobe, FiMoon, FiSun, FiToggleLeft,
	FiToggleRight, FiTrash2, FiDownload, FiShield
} from 'react-icons/fi';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
	const { user, logout } = useAuth();
	const [settings, setSettings] = useState({
		emailNotifications: true,
		smsNotifications: false,
		pushNotifications: true,
		applicationUpdates: true,
		projectRecommendations: true,
		weeklyDigest: false,
		marketingEmails: false,
		twoFactorAuth: false,
		showProfile: true,
		showEmail: false,
		showPhone: false,
		language: 'en',
		timezone: 'UTC',
		theme: 'dark'
	});

	useEffect(() => {
		// Load settings from localStorage
		const saved = localStorage.getItem('userSettings');
		if (saved) {
			try {
				setSettings({ ...settings, ...JSON.parse(saved) });
			} catch (e) {
				console.error('Failed to load settings');
			}
		}
	}, []);

	const handleToggle = (key) => {
		const newSettings = { ...settings, [key]: !settings[key] };
		setSettings(newSettings);
		localStorage.setItem('userSettings', JSON.stringify(newSettings));
		toast.success('Setting updated successfully');
	};

	const handleSelectChange = (key, value) => {
		const newSettings = { ...settings, [key]: value };
		setSettings(newSettings);
		localStorage.setItem('userSettings', JSON.stringify(newSettings));
		toast.success('Setting updated successfully');
	};

	const handleExportData = () => {
		toast.success('Data export initiated. You will receive an email shortly.');
	};

	const handleDeleteAccount = () => {
		if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
			toast.error('Account deletion is not yet implemented');
		}
	};

	const ToggleSwitch = ({ enabled, onChange }) => (
		<button
			onClick={onChange}
			className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
				enabled ? 'bg-purple-500' : 'bg-white/20'
			}`}
		>
			<span
				className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
					enabled ? 'translate-x-6' : 'translate-x-1'
				}`}
			/>
		</button>
	);

	return (
		<Layout user={user} title="Settings">
			<div className="p-6 lg:p-10">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-10"
				>
					<h1 className="text-4xl font-bold text-white flex items-center gap-3">
						<FiSettings className="h-10 w-10" />
						Settings
					</h1>
					<p className="mt-2 max-w-2xl text-base text-white/90">
						Customize your experience and manage your account preferences.
					</p>
				</motion.div>

				<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
					{/* Main Settings */}
					<div className="xl:col-span-2 space-y-6">
						{/* Notification Settings */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							className="student-panel p-6"
						>
							<h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
								<FiBell className="h-6 w-6" />
								Notification Preferences
							</h2>

							<div className="space-y-5">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-white font-semibold">Email Notifications</h3>
										<p className="text-sm text-white/60">Receive updates via email</p>
									</div>
									<ToggleSwitch
										enabled={settings.emailNotifications}
										onChange={() => handleToggle('emailNotifications')}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-white font-semibold">SMS Notifications</h3>
										<p className="text-sm text-white/60">Get text messages for important updates</p>
									</div>
									<ToggleSwitch
										enabled={settings.smsNotifications}
										onChange={() => handleToggle('smsNotifications')}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-white font-semibold">Push Notifications</h3>
										<p className="text-sm text-white/60">Browser push notifications</p>
									</div>
									<ToggleSwitch
										enabled={settings.pushNotifications}
										onChange={() => handleToggle('pushNotifications')}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-white font-semibold">Application Updates</h3>
										<p className="text-sm text-white/60">Status changes on your applications</p>
									</div>
									<ToggleSwitch
										enabled={settings.applicationUpdates}
										onChange={() => handleToggle('applicationUpdates')}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-white font-semibold">Project Recommendations</h3>
										<p className="text-sm text-white/60">AI-suggested projects based on your skills</p>
									</div>
									<ToggleSwitch
										enabled={settings.projectRecommendations}
										onChange={() => handleToggle('projectRecommendations')}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-white font-semibold">Weekly Digest</h3>
										<p className="text-sm text-white/60">Summary of your activity every week</p>
									</div>
									<ToggleSwitch
										enabled={settings.weeklyDigest}
										onChange={() => handleToggle('weeklyDigest')}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-white font-semibold">Marketing Emails</h3>
										<p className="text-sm text-white/60">News, tips, and promotional content</p>
									</div>
									<ToggleSwitch
										enabled={settings.marketingEmails}
										onChange={() => handleToggle('marketingEmails')}
									/>
								</div>
							</div>
						</motion.div>

						{/* Privacy Settings */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.1 }}
							className="student-panel p-6"
						>
							<h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
								<FiShield className="h-6 w-6" />
								Privacy & Security
							</h2>

							<div className="space-y-5">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-white font-semibold">Two-Factor Authentication</h3>
										<p className="text-sm text-white/60">Add an extra layer of security</p>
									</div>
									<ToggleSwitch
										enabled={settings.twoFactorAuth}
										onChange={() => handleToggle('twoFactorAuth')}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-white font-semibold">Show Profile Publicly</h3>
										<p className="text-sm text-white/60">Let companies find you</p>
									</div>
									<ToggleSwitch
										enabled={settings.showProfile}
										onChange={() => handleToggle('showProfile')}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-white font-semibold">Show Email Address</h3>
										<p className="text-sm text-white/60">Display email on your profile</p>
									</div>
									<ToggleSwitch
										enabled={settings.showEmail}
										onChange={() => handleToggle('showEmail')}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-white font-semibold">Show Phone Number</h3>
										<p className="text-sm text-white/60">Display phone on your profile</p>
									</div>
									<ToggleSwitch
										enabled={settings.showPhone}
										onChange={() => handleToggle('showPhone')}
									/>
								</div>
							</div>
						</motion.div>

						{/* Preferences */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
							className="student-panel p-6"
						>
							<h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
								<FiGlobe className="h-6 w-6" />
								Preferences
							</h2>

							<div className="space-y-5">
								<div>
									<label className="block text-white font-semibold mb-2">Language</label>
									<select
										value={settings.language}
										onChange={(e) => handleSelectChange('language', e.target.value)}
										className="w-full h-12 rounded-xl border border-white/20 bg-white/10 px-4 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
									>
										<option value="en" className="bg-slate-900">English</option>
										<option value="es" className="bg-slate-900">Español</option>
										<option value="fr" className="bg-slate-900">Français</option>
										<option value="de" className="bg-slate-900">Deutsch</option>
										<option value="hi" className="bg-slate-900">हिन्दी</option>
									</select>
								</div>

								<div>
									<label className="block text-white font-semibold mb-2">Timezone</label>
									<select
										value={settings.timezone}
										onChange={(e) => handleSelectChange('timezone', e.target.value)}
										className="w-full h-12 rounded-xl border border-white/20 bg-white/10 px-4 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
									>
										<option value="UTC" className="bg-slate-900">UTC (GMT+0)</option>
										<option value="IST" className="bg-slate-900">IST (GMT+5:30)</option>
										<option value="EST" className="bg-slate-900">EST (GMT-5)</option>
										<option value="PST" className="bg-slate-900">PST (GMT-8)</option>
										<option value="CST" className="bg-slate-900">CST (GMT-6)</option>
									</select>
								</div>

								<div>
									<label className="block text-white font-semibold mb-2">Theme</label>
									<select
										value={settings.theme}
										onChange={(e) => handleSelectChange('theme', e.target.value)}
										className="w-full h-12 rounded-xl border border-white/20 bg-white/10 px-4 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
									>
										<option value="dark" className="bg-slate-900">Dark (Current)</option>
										<option value="light" className="bg-slate-900">Light (Coming Soon)</option>
										<option value="auto" className="bg-slate-900">Auto (System)</option>
									</select>
								</div>
							</div>
						</motion.div>

						{/* Data & Account */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.3 }}
							className="student-panel p-6"
						>
							<h2 className="text-2xl font-bold text-white mb-6">Data & Account</h2>

							<div className="space-y-4">
								<button
									onClick={handleExportData}
									className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500/20 border border-blue-500/30 px-6 py-3 font-semibold text-blue-300 transition hover:bg-blue-500/30"
								>
									<FiDownload className="h-5 w-5" />
									Export My Data
								</button>

								<button
									onClick={handleDeleteAccount}
									className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/20 border border-red-500/30 px-6 py-3 font-semibold text-red-300 transition hover:bg-red-500/30"
								>
									<FiTrash2 className="h-5 w-5" />
									Delete Account
								</button>
							</div>

							<p className="text-xs text-white/40 mt-4">
								Deleting your account will permanently remove all your data, including applications, certificates, and profile information. This action cannot be undone.
							</p>
						</motion.div>
					</div>

					{/* Sidebar Info */}
					<div className="space-y-6">
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							className="student-panel p-6"
						>
							<h3 className="text-xl font-bold text-white mb-4">Quick Tips</h3>
							<ul className="space-y-3 text-sm text-white/70">
								<li className="flex gap-2">
									<span className="text-purple-400">•</span>
									<span>Enable email notifications to never miss important updates</span>
								</li>
								<li className="flex gap-2">
									<span className="text-purple-400">•</span>
									<span>Turn on 2FA for enhanced account security</span>
								</li>
								<li className="flex gap-2">
									<span className="text-purple-400">•</span>
									<span>Make your profile public to get discovered by companies</span>
								</li>
								<li className="flex gap-2">
									<span className="text-purple-400">•</span>
									<span>Export your data regularly for backup</span>
								</li>
							</ul>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.1 }}
							className="student-panel p-6"
						>
							<h3 className="text-xl font-bold text-white mb-4">Need Help?</h3>
							<p className="text-sm text-white/70 mb-4">
								If you have questions about your settings or need assistance, we're here to help.
							</p>
							<button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-500/20 border border-purple-500/30 px-6 py-3 font-semibold text-purple-300 transition hover:bg-purple-500/30">
								<FiMessageSquare className="h-5 w-5" />
								Contact Support
							</button>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
							className="student-panel p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30"
						>
							<h3 className="text-xl font-bold text-white mb-2">Pro Tip</h3>
							<p className="text-sm text-white/80">
								Keep your profile public and enable project recommendations to increase your chances of getting matched with the perfect projects!
							</p>
						</motion.div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default SettingsPage;
