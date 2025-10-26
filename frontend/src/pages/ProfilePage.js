import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
	FiUser, FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub,
	FiGlobe, FiSave, FiPlus, FiX, FiCamera, FiLock
} from 'react-icons/fi';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';

const ProfilePage = () => {
	const { user, updateProfile } = useAuth();
	const [profileForm, setProfileForm] = useState({
		name: '', email: '', phone: '', location: '', bio: '',
		linkedin: '', github: '', portfolio: '', skills: [], avatar: ''
	});
	const [profileImage, setProfileImage] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [skillInput, setSkillInput] = useState('');
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: '', newPassword: '', confirmPassword: ''
	});

	useEffect(() => {
		if (!user) return;
		setProfileForm({
			name: user.name || '', email: user.email || '', phone: user.phone || '',
			location: user.location || '', bio: user.bio || '',
			linkedin: user.linkedin || '', github: user.github || '',
			portfolio: user.portfolio || '', skills: user.skills || [],
			avatar: user.avatar || ''
		});
		setImagePreview(user.avatar || null);
	}, [user]);

	const profileMutation = useMutation((payload) => updateProfile(payload), {
		onSuccess: () => toast.success('Profile updated successfully!'),
		onError: (error) => toast.error(error?.message || 'Failed to update profile')
	});

	const passwordMutation = useMutation((payload) => authAPI.updatePassword(payload), {
		onSuccess: () => {
			toast.success('Password updated successfully');
			setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
		},
		onError: (error) => toast.error(error?.message || 'Failed to update password')
	});

	const handleProfileSubmit = async (e) => {
		e.preventDefault();
		if (profileMutation.isLoading) return;

		const formData = new FormData();
		formData.append('name', profileForm.name.trim());
		formData.append('email', profileForm.email.trim());
		if (profileForm.phone.trim()) formData.append('phone', profileForm.phone.trim());
		if (profileForm.location.trim()) formData.append('location', profileForm.location.trim());
		if (profileForm.bio.trim()) formData.append('bio', profileForm.bio.trim());
		if (profileForm.linkedin.trim()) formData.append('linkedin', profileForm.linkedin.trim());
		if (profileForm.github.trim()) formData.append('github', profileForm.github.trim());
		if (profileForm.portfolio.trim()) formData.append('portfolio', profileForm.portfolio.trim());
		formData.append('skills', JSON.stringify(profileForm.skills));
		if (profileImage) formData.append('avatar', profileImage);

		profileMutation.mutate(formData);
	};

	const handlePasswordSubmit = (e) => {
		e.preventDefault();
		if (!passwordForm.currentPassword || !passwordForm.newPassword) {
			toast.error('Please enter both current and new password');
			return;
		}
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			toast.error('New passwords do not match');
			return;
		}
		passwordMutation.mutate({
			currentPassword: passwordForm.currentPassword,
			newPassword: passwordForm.newPassword
		});
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				toast.error('Image size should be less than 5MB');
				return;
			}
			setProfileImage(file);
			const reader = new FileReader();
			reader.onloadend = () => setImagePreview(reader.result);
			reader.readAsDataURL(file);
		}
	};

	const addSkill = () => {
		const trimmed = skillInput.trim();
		if (!trimmed) return;
		if (profileForm.skills.includes(trimmed)) {
			toast.error('Skill already added');
			return;
		}
		setProfileForm(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
		setSkillInput('');
	};

	const removeSkill = (skill) => {
		setProfileForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
	};

	const profileCompletion = React.useMemo(() => {
		let score = 0;
		if (profileForm.name) score++;
		if (profileForm.email) score++;
		if (profileForm.phone) score++;
		if (profileForm.location) score++;
		if (profileForm.bio) score++;
		if (profileForm.linkedin || profileForm.github) score++;
		if (profileForm.skills.length > 2) score++;
		if (imagePreview) score++;
		return Math.round((score / 8) * 100);
	}, [profileForm, imagePreview]);

	return (
		<Layout user={user} title="Profile">
			<div className="p-6 lg:p-10">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-10"
				>
					<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<h1 className="text-4xl font-bold text-white">Your Profile</h1>
							<p className="mt-2 max-w-2xl text-base text-white/90">
								Keep your details up to date for better project matches.
							</p>
						</div>
						<div className="student-panel flex items-center gap-4 p-5">
							<div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/15">
								<FiUser className="h-6 w-6 text-emerald-300" />
							</div>
							<div>
								<p className="text-xs text-white/50">Profile Completion</p>
								<p className="text-2xl font-bold text-white">{profileCompletion}%</p>
							</div>
						</div>
					</div>
				</motion.div>

				<div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
					{/* Profile Form */}
					<div className="xl:col-span-2 space-y-6">
						<motion.form
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							onSubmit={handleProfileSubmit}
							className="student-panel p-6 space-y-6"
						>
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold text-white">Personal Information</h2>
								<button
									type="submit"
									disabled={profileMutation.isLoading}
									className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold text-white transition hover:from-purple-600 hover:to-blue-600"
								>
									{profileMutation.isLoading ? (
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
									) : (
										<FiSave className="h-4 w-4" />
									)}
									{profileMutation.isLoading ? 'Saving…' : 'Save Changes'}
								</button>
							</div>

							{/* Profile Photo */}
							<div className="flex items-center gap-6 p-4 rounded-xl bg-white/5 border border-white/10">
								<div className="relative">
									<div className="h-24 w-24 overflow-hidden rounded-full border-4 border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-blue-500/20">
										{imagePreview ? (
											<img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
										) : (
											<div className="flex h-full w-full items-center justify-center">
												<FiUser className="h-12 w-12 text-white/50" />
											</div>
										)}
									</div>
									<label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-purple-500 text-white shadow-lg transition hover:bg-purple-600">
										<FiCamera className="h-4 w-4" />
										<input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
									</label>
								</div>
								<div>
									<h3 className="text-lg font-semibold text-white">Profile Photo</h3>
									<p className="text-sm text-white/60">Upload a professional photo</p>
									<p className="text-xs text-white/40 mt-1">Max 5MB • JPG, PNG or GIF</p>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
										<FiUser className="h-4 w-4" /> Full Name *
									</label>
									<input
										type="text"
										required
										value={profileForm.name}
										onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
										className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
									/>
								</div>
								<div>
									<label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
										<FiMail className="h-4 w-4" /> Email *
									</label>
									<input
										type="email"
										required
										value={profileForm.email}
										onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
										className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
									/>
								</div>
								<div>
									<label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
										<FiPhone className="h-4 w-4" /> Phone
									</label>
									<input
										type="tel"
										value={profileForm.phone}
										onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
										className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
									/>
								</div>
								<div>
									<label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
										<FiMapPin className="h-4 w-4" /> Location
									</label>
									<input
										type="text"
										value={profileForm.location}
										onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
										placeholder="City, Country"
										className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder-white/40 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
									/>
								</div>
							</div>

							<div>
								<label className="mb-2 text-sm font-semibold text-white/70">Bio</label>
								<textarea
									rows={4}
									value={profileForm.bio}
									onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
									placeholder="Tell us about yourself, your skills, and what you're looking for..."
									className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
										<FiLinkedin className="h-4 w-4" /> LinkedIn
									</label>
									<input
										type="url"
										value={profileForm.linkedin}
										onChange={(e) => setProfileForm(prev => ({ ...prev, linkedin: e.target.value }))}
										placeholder="https://linkedin.com/in/..."
										className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder-white/40 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
									/>
								</div>
								<div>
									<label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
										<FiGithub className="h-4 w-4" /> GitHub
									</label>
									<input
										type="url"
										value={profileForm.github}
										onChange={(e) => setProfileForm(prev => ({ ...prev, github: e.target.value }))}
										placeholder="https://github.com/..."
										className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder-white/40 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
									/>
								</div>
								<div>
									<label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
										<FiGlobe className="h-4 w-4" /> Portfolio
									</label>
									<input
										type="url"
										value={profileForm.portfolio}
										onChange={(e) => setProfileForm(prev => ({ ...prev, portfolio: e.target.value }))}
										placeholder="https://..."
										className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder-white/40 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
									/>
								</div>
							</div>

							<div>
								<label className="mb-3 text-sm font-semibold text-white/70">Skills</label>
								<div className="flex gap-2 mb-3">
									<input
										type="text"
										value={skillInput}
										onChange={(e) => setSkillInput(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
										placeholder="Add a skill (e.g., React, Python)"
										className="flex-1 h-12 rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder-white/40 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
									/>
									<button
										type="button"
										onClick={addSkill}
										className="inline-flex items-center gap-2 rounded-xl bg-purple-500/20 px-6 py-3 font-semibold text-purple-300 border border-purple-500/30 transition hover:bg-purple-500/30"
									>
										<FiPlus className="h-4 w-4" /> Add
									</button>
								</div>
								<div className="flex flex-wrap gap-2">
									{profileForm.skills.map((skill, idx) => (
										<span
											key={idx}
											className="inline-flex items-center gap-2 rounded-lg bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 text-sm text-purple-300"
										>
											{skill}
											<button type="button" onClick={() => removeSkill(skill)} className="hover:text-white">
												<FiX className="h-3.5 w-3.5" />
											</button>
										</span>
									))}
								</div>
							</div>
						</motion.form>

						{/* Password Change */}
						<motion.form
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.1 }}
							onSubmit={handlePasswordSubmit}
							className="student-panel p-6 space-y-6"
						>
							<h2 className="text-2xl font-bold text-white flex items-center gap-2">
								<FiLock className="h-6 w-6" /> Change Password
							</h2>
							
							<div className="space-y-4">
								<div>
									<label className="mb-2 text-sm font-semibold text-white/70">Current Password</label>
									<input
										type="password"
										value={passwordForm.currentPassword}
										onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
										className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
									/>
								</div>
								<div>
									<label className="mb-2 text-sm font-semibold text-white/70">New Password</label>
									<input
										type="password"
										value={passwordForm.newPassword}
										onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
										className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
									/>
								</div>
								<div>
									<label className="mb-2 text-sm font-semibold text-white/70">Confirm New Password</label>
									<input
										type="password"
										value={passwordForm.confirmPassword}
										onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
										className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
									/>
								</div>
							</div>

							<button
								type="submit"
								disabled={passwordMutation.isLoading}
								className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold text-white transition hover:from-purple-600 hover:to-blue-600"
							>
								{passwordMutation.isLoading ? (
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
								) : (
									<FiLock className="h-4 w-4" />
								)}
								{passwordMutation.isLoading ? 'Updating…' : 'Update Password'}
							</button>
						</motion.form>
					</div>

					{/* Sidebar Info */}
					<div className="space-y-6">
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							className="student-panel p-6"
						>
							<h3 className="text-xl font-bold text-white mb-4">Profile Tips</h3>
							<ul className="space-y-3 text-sm text-white/70">
								<li className="flex gap-2">
									<span className="text-purple-400">•</span>
									<span>Add a professional photo to increase profile views by 40%</span>
								</li>
								<li className="flex gap-2">
									<span className="text-purple-400">•</span>
									<span>Complete all sections to improve project match accuracy</span>
								</li>
								<li className="flex gap-2">
									<span className="text-purple-400">•</span>
									<span>Add at least 5 skills for better recommendations</span>
								</li>
								<li className="flex gap-2">
									<span className="text-purple-400">•</span>
									<span>Link your GitHub to showcase your code contributions</span>
								</li>
								<li className="flex gap-2">
									<span className="text-purple-400">•</span>
									<span>Update your bio to reflect recent achievements</span>
								</li>
							</ul>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.1 }}
							className="student-panel p-6"
						>
							<h3 className="text-xl font-bold text-white mb-4">Account Stats</h3>
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-white/70">Member Since</span>
									<span className="font-semibold text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-white/70">Role</span>
									<span className="font-semibold text-white capitalize">{user?.role || 'Student'}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-white/70">Year</span>
									<span className="font-semibold text-white">{user?.year || 'N/A'}</span>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default ProfilePage;
