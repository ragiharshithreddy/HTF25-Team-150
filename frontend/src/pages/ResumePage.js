import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
	FiPlus,
	FiEdit,
	FiTrash2,
	FiTrendingUp,
	FiClipboard,
	FiCheckCircle,
	FiAlertCircle,
	FiTarget,
	FiLayers,
	FiChevronRight,
	FiBookOpen,
	FiBriefcase,
	FiAward,
	FiDownload,
	FiCopy,
	FiX
} from 'react-icons/fi';
import Layout from '../components/Layout';
import { resumeAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const sanitizeDate = (value) => (value ? value.slice(0, 10) : '');

const buildFormState = (resume, fallbackTemplateId) => {
	const data = resume?.resumeData || {};
	const personalInfo = data.personalInfo || {};
	return {
		templateId: resume?.templateId || fallbackTemplateId || '',
		fullName: personalInfo.fullName || '',
		email: personalInfo.email || '',
		phone: personalInfo.phone || '',
		location: personalInfo.location || '',
		linkedin: personalInfo.linkedin || '',
		github: personalInfo.github || '',
		portfolio: personalInfo.portfolio || '',
		summary: data.summary || '',
		targetRole: '',
		highlight: Array.isArray(data.customSections)
			? (data.customSections.find((section) => section.title?.toLowerCase().includes('highlight'))?.content || '')
			: '',
		skills: (data.skills || []).flatMap((skillGroup) => skillGroup.items || []),
		experience: (data.experience || []).map((exp) => ({
			company: exp.company || '',
			position: exp.position || '',
			location: exp.location || '',
			startDate: sanitizeDate(exp.startDate || ''),
			endDate: sanitizeDate(exp.endDate || ''),
			current: Boolean(exp.current) && !exp.endDate,
			description: exp.description || '',
			achievements: Array.isArray(exp.achievements) ? exp.achievements.join('\n') : '',
		})),
		education: (data.education || []).map((edu) => ({
			institution: edu.institution || '',
			degree: edu.degree || '',
			field: edu.field || '',
			startDate: sanitizeDate(edu.startDate || ''),
			endDate: sanitizeDate(edu.endDate || ''),
			gpa: edu.gpa || '',
			achievements: Array.isArray(edu.achievements) ? edu.achievements.join('\n') : '',
		})),
		projects: (data.projects || []).map((project) => ({
			title: project.title || '',
			description: project.description || '',
			role: project.role || '',
			technologies: (project.technologies || []).join(', '),
			githubUrl: project.githubUrl || '',
			liveUrl: project.liveUrl || '',
		})),
		certifications: (data.certifications || []).map((cert) => ({
			name: cert.name || '',
			issuer: cert.issuer || '',
			date: sanitizeDate(cert.date || ''),
			credentialUrl: cert.credentialUrl || '',
		})),
	};
};

const buildResumePayload = (formState) => {
	const cleanedSkills = formState.skills.map((skill) => skill.trim()).filter(Boolean);
	const experience = formState.experience
		.map((exp) => ({
			company: exp.company.trim(),
			position: exp.position.trim(),
			location: exp.location.trim() || undefined,
			startDate: exp.startDate || undefined,
			endDate: exp.current ? undefined : exp.endDate || undefined,
			current: Boolean(exp.current),
			description: exp.description.trim(),
			achievements: exp.achievements
				? exp.achievements.split('\n').map((line) => line.trim()).filter(Boolean)
				: [],
		}))
		.filter((exp) => exp.company || exp.position || exp.description);

	const education = formState.education
		.map((edu) => ({
			institution: edu.institution.trim(),
			degree: edu.degree.trim(),
			field: edu.field.trim(),
			startDate: edu.startDate || undefined,
			endDate: edu.endDate || undefined,
			gpa: edu.gpa.trim() || undefined,
			achievements: edu.achievements
				? edu.achievements.split('\n').map((line) => line.trim()).filter(Boolean)
				: [],
		}))
		.filter((edu) => edu.institution || edu.degree || edu.field);

	const projects = formState.projects
		.map((project) => ({
			title: project.title.trim(),
			description: project.description.trim(),
			role: project.role.trim() || undefined,
			technologies: project.technologies
				? project.technologies.split(',').map((tech) => tech.trim()).filter(Boolean)
				: [],
			githubUrl: project.githubUrl.trim() || undefined,
			liveUrl: project.liveUrl.trim() || undefined,
		}))
		.filter((project) => project.title || project.description);

	const certifications = formState.certifications
		.map((cert) => ({
			name: cert.name.trim(),
			issuer: cert.issuer.trim(),
			date: cert.date || undefined,
			credentialUrl: cert.credentialUrl.trim() || undefined,
		}))
		.filter((cert) => cert.name || cert.issuer);

	const customSections = [];
	if (formState.targetRole.trim()) {
		customSections.push({ title: 'Target Role', content: formState.targetRole.trim() });
	}
	if (formState.highlight.trim()) {
		customSections.push({ title: 'Career Highlights', content: formState.highlight.trim() });
	}

	return {
		templateId: formState.templateId,
		resumeData: {
			personalInfo: {
				fullName: formState.fullName.trim(),
				email: formState.email.trim(),
				phone: formState.phone.trim(),
				location: formState.location.trim(),
				linkedin: formState.linkedin.trim(),
				github: formState.github.trim(),
				portfolio: formState.portfolio.trim(),
			},
			summary: formState.summary.trim(),
			skills: cleanedSkills.length
				? [{ category: 'Core Skills', items: cleanedSkills, verified: false }]
				: [],
			experience,
			education,
			projects,
			certifications,
			customSections,
		},
	};
};

const defaultExperience = {
	company: '',
	position: '',
	location: '',
	startDate: '',
	endDate: '',
	current: false,
	description: '',
	achievements: '',
};

const defaultEducation = {
	institution: '',
	degree: '',
	field: '',
	startDate: '',
	endDate: '',
	gpa: '',
	achievements: '',
};

const defaultProject = {
	title: '',
	description: '',
	role: '',
	technologies: '',
	githubUrl: '',
	liveUrl: '',
};

const defaultCertification = {
	name: '',
	issuer: '',
	date: '',
	credentialUrl: '',
};

const ResumeEditor = ({
	open,
	mode,
	templates,
	initialResume,
	isSaving,
	onSubmit,
	onClose,
}) => {
	const [form, setForm] = useState(() => buildFormState(initialResume, initialResume?.templateId));
	const [skillInput, setSkillInput] = useState('');

	useEffect(() => {
		if (open) {
			setForm(buildFormState(initialResume, initialResume?.templateId));
			setSkillInput('');
		}
	}, [open, initialResume]);

	const updateForm = (patch) => {
		setForm((prev) => ({ ...prev, ...patch }));
	};

	const handleExperienceChange = (index, key, value) => {
		setForm((prev) => {
			const next = [...prev.experience];
			next[index] = { ...next[index], [key]: value };
			if (key === 'current' && value) {
				next[index].endDate = '';
			}
			return { ...prev, experience: next };
		});
	};

	const handleEducationChange = (index, key, value) => {
		setForm((prev) => {
			const next = [...prev.education];
			next[index] = { ...next[index], [key]: value };
			return { ...prev, education: next };
		});
	};

	const handleProjectChange = (index, key, value) => {
		setForm((prev) => {
			const next = [...prev.projects];
			next[index] = { ...next[index], [key]: value };
			return { ...prev, projects: next };
		});
	};

	const handleCertificationChange = (index, key, value) => {
		setForm((prev) => {
			const next = [...prev.certifications];
			next[index] = { ...next[index], [key]: value };
			return { ...prev, certifications: next };
		});
	};

	const addSkill = () => {
		const trimmed = skillInput.trim();
		if (!trimmed) return;
		if (form.skills.includes(trimmed)) {
			toast.error('Skill already added');
			return;
		}
		setForm((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
		setSkillInput('');
	};

	const removeSkill = (skill) => {
		setForm((prev) => ({ ...prev, skills: prev.skills.filter((item) => item !== skill) }));
	};

	const validateForm = () => {
		if (!form.templateId) {
			toast.error('Select a template to continue');
			return false;
		}
		if (!form.fullName.trim()) {
			toast.error('Full name is required');
			return false;
		}
		if (!form.email.trim()) {
			toast.error('Email is required');
			return false;
		}
		if (!form.summary.trim()) {
			toast.error('Add a professional summary');
			return false;
		}
		return true;
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		if (!validateForm()) return;
		onSubmit(buildResumePayload(form));
	};

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<motion.div
						className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/15 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 30 }}
						transition={{ duration: 0.2 }}
					>
						<div className="mb-6 flex items-start justify-between gap-6">
							<div>
								<h2 className="text-2xl font-semibold text-white">
									{mode === 'create' ? 'Create a new resume' : 'Update your resume'}
								</h2>
								<p className="text-sm text-white/60">
									Capture your latest experience, skills, and highlights. ATS guidance updates automatically.
								</p>
							</div>
							<button type="button" onClick={onClose} className="btn-secondary inline-flex items-center gap-2">
								<FiX className="h-4 w-4" /> Close
							</button>
						</div>

						<form onSubmit={handleSubmit} className="space-y-8">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Template</label>
									<select
										value={form.templateId}
										onChange={(event) => updateForm({ templateId: event.target.value })}
										className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
									>
										<option value="" className="bg-slate-900">Choose a template</option>
										{templates.map((template) => (
											<option key={template.templateId || template._id} value={template.templateId || template._id} className="bg-slate-900">
												{template.name} · {template.category}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Target role</label>
									<input
										type="text"
										value={form.targetRole}
										onChange={(event) => updateForm({ targetRole: event.target.value })}
										placeholder="e.g. Frontend Engineer"
										className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Full name *</label>
									<input
										type="text"
										value={form.fullName}
										onChange={(event) => updateForm({ fullName: event.target.value })}
										className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
									/>
								</div>
								<div>
									<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Email *</label>
									<input
										type="email"
										value={form.email}
										onChange={(event) => updateForm({ email: event.target.value })}
										className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div>
									<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Phone</label>
									<input
										type="text"
										value={form.phone}
										onChange={(event) => updateForm({ phone: event.target.value })}
										className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
									/>
								</div>
								<div>
									<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Location</label>
									<input
										type="text"
										value={form.location}
										onChange={(event) => updateForm({ location: event.target.value })}
										placeholder="City, Country"
										className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
									/>
								</div>
								<div>
									<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Portfolio</label>
									<input
										type="url"
										value={form.portfolio}
										onChange={(event) => updateForm({ portfolio: event.target.value })}
										placeholder="https://"
										className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">LinkedIn</label>
									<input
										type="url"
										value={form.linkedin}
										onChange={(event) => updateForm({ linkedin: event.target.value })}
										placeholder="https://linkedin.com/in/"
										className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
									/>
								</div>
								<div>
									<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">GitHub</label>
									<input
										type="url"
										value={form.github}
										onChange={(event) => updateForm({ github: event.target.value })}
										placeholder="https://github.com/"
										className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
									/>
								</div>
							</div>

							<div>
								<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Professional summary *</label>
								<textarea
									rows={4}
									value={form.summary}
									onChange={(event) => updateForm({ summary: event.target.value })}
									placeholder="Summarize your experience, impact, and ambition in 3-4 sentences."
									className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
								/>
							</div>

							<div>
								<div className="mb-3 flex items-center justify-between">
									<div>
										<span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Core skills</span>
										<p className="text-xs text-white/40">Add skills individually. Press enter or use the add button.</p>
									</div>
									<div className="flex gap-2">
										<input
											type="text"
											value={skillInput}
											onChange={(event) => setSkillInput(event.target.value)}
											onKeyDown={(event) => {
												if (event.key === 'Enter') {
													event.preventDefault();
													addSkill();
												}
											}}
											placeholder="React, TypeScript, UX..."
											className="h-10 w-52 rounded-lg border border-white/15 bg-white/5 px-3 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
										/>
										<button type="button" onClick={addSkill} className="btn-secondary inline-flex items-center gap-2">
											<FiPlus className="h-4 w-4" /> Add
										</button>
									</div>
								</div>
								<div className="flex flex-wrap gap-2">
									{form.skills.map((skill) => (
										<span key={skill} className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs text-indigo-100">
											{skill}
											<button type="button" onClick={() => removeSkill(skill)} className="text-indigo-100/70 hover:text-white">
												<FiX className="h-3 w-3" />
											</button>
										</span>
									))}
									{form.skills.length === 0 && (
										<span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">No skills added yet</span>
									)}
								</div>
							</div>

							<section>
								<div className="mb-4 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-3 text-blue-200">
											<FiBriefcase className="h-5 w-5" />
										</div>
										<div>
											<h3 className="text-lg font-semibold text-white">Experience</h3>
											<p className="text-xs text-white/40">Quantify your impact. Use metrics where possible.</p>
										</div>
									</div>
									<button
										type="button"
										onClick={() => updateForm({ experience: [...form.experience, { ...defaultExperience }] })}
										className="btn-secondary inline-flex items-center gap-2"
									>
										<FiPlus className="h-4 w-4" /> Add role
									</button>
								</div>

								{form.experience.length === 0 && (
									<div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/50">
										Start by capturing your most recent role.
									</div>
								)}

								<div className="space-y-6">
									{form.experience.map((exp, index) => (
										<div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-6">
											<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
												<input
													type="text"
													value={exp.position}
													onChange={(event) => handleExperienceChange(index, 'position', event.target.value)}
													placeholder="Title"
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
												<input
													type="text"
													value={exp.company}
													onChange={(event) => handleExperienceChange(index, 'company', event.target.value)}
													placeholder="Company"
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
												<input
													type="text"
													value={exp.location}
													onChange={(event) => handleExperienceChange(index, 'location', event.target.value)}
													placeholder="Location"
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
												<div className="grid grid-cols-2 gap-3">
													<input
														type="date"
														value={exp.startDate}
														onChange={(event) => handleExperienceChange(index, 'startDate', event.target.value)}
														className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
													/>
													<input
														type="date"
														value={exp.current ? '' : exp.endDate}
														onChange={(event) => handleExperienceChange(index, 'endDate', event.target.value)}
														disabled={exp.current}
														className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-40"
													/>
												</div>
											</div>

											<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Key achievements</label>
											<textarea
												rows={3}
												value={exp.achievements}
												onChange={(event) => handleExperienceChange(index, 'achievements', event.target.value)}
												placeholder="Impact bullet points, one per line"
												className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
											/>

											<div className="mt-4 flex items-center justify-between">
												<label className="inline-flex items-center gap-2 text-sm text-white/70">
													<input
														type="checkbox"
														checked={exp.current}
														onChange={(event) => handleExperienceChange(index, 'current', event.target.checked)}
														className="h-4 w-4 rounded border border-white/20 bg-white/10 text-indigo-500"
													/>
													Currently in this role
												</label>
												<button
													type="button"
													onClick={() => updateForm({ experience: form.experience.filter((_, idx) => idx !== index) })}
													className="btn-danger inline-flex items-center gap-2"
												>
													<FiTrash2 className="h-4 w-4" /> Remove
												</button>
											</div>
										</div>
									))}
								</div>
							</section>

							<section>
								<div className="mb-4 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-emerald-200">
											<FiBookOpen className="h-5 w-5" />
										</div>
										<div>
											<h3 className="text-lg font-semibold text-white">Education</h3>
											<p className="text-xs text-white/40">Include relevant degrees, bootcamps, and training.</p>
										</div>
									</div>
									<button
										type="button"
										onClick={() => updateForm({ education: [...form.education, { ...defaultEducation }] })}
										className="btn-secondary inline-flex items-center gap-2"
									>
										<FiPlus className="h-4 w-4" /> Add entry
									</button>
								</div>

								{form.education.length === 0 && (
									<div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/50">
										Highlight your formal education or certifications.
									</div>
								)}

								<div className="space-y-6">
									{form.education.map((edu, index) => (
										<div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-6">
											<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
												<input
													type="text"
													value={edu.institution}
													onChange={(event) => handleEducationChange(index, 'institution', event.target.value)}
													placeholder="Institution"
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
												<input
													type="text"
													value={edu.degree}
													onChange={(event) => handleEducationChange(index, 'degree', event.target.value)}
													placeholder="Degree"
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
												<input
													type="text"
													value={edu.field}
													onChange={(event) => handleEducationChange(index, 'field', event.target.value)}
													placeholder="Field of study"
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
												<div className="grid grid-cols-2 gap-3">
													<input
														type="date"
														value={edu.startDate}
														onChange={(event) => handleEducationChange(index, 'startDate', event.target.value)}
														className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
													/>
													<input
														type="date"
														value={edu.endDate}
														onChange={(event) => handleEducationChange(index, 'endDate', event.target.value)}
														className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
													/>
												</div>
											</div>

											<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
												<textarea
													rows={3}
													value={edu.achievements}
													onChange={(event) => handleEducationChange(index, 'achievements', event.target.value)}
													placeholder="Dean's list, scholarships, notable coursework"
													className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
												<input
													type="text"
													value={edu.gpa}
													onChange={(event) => handleEducationChange(index, 'gpa', event.target.value)}
													placeholder="GPA"
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
											</div>

											<div className="mt-4 flex justify-end">
												<button
													type="button"
													onClick={() => updateForm({ education: form.education.filter((_, idx) => idx !== index) })}
													className="btn-danger inline-flex items-center gap-2"
												>
													<FiTrash2 className="h-4 w-4" /> Remove
												</button>
											</div>
										</div>
									))}
								</div>
							</section>

							<section>
								<div className="mb-4 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-3 text-purple-200">
											<FiTarget className="h-5 w-5" />
										</div>
										<div>
											<h3 className="text-lg font-semibold text-white">Projects</h3>
											<p className="text-xs text-white/40">Showcase 2-3 projects that demonstrate the skills you listed.</p>
										</div>
									</div>
									<button
										type="button"
										onClick={() => updateForm({ projects: [...form.projects, { ...defaultProject }] })}
										className="btn-secondary inline-flex items-center gap-2"
									>
										<FiPlus className="h-4 w-4" /> Add project
									</button>
								</div>

								{form.projects.length === 0 && (
									<div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/50">
										Include platform projects or personal builds with tangible outcomes.
									</div>
								)}

								<div className="space-y-6">
									{form.projects.map((project, index) => (
										<div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-6">
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
												<input
													type="text"
													value={project.title}
													onChange={(event) => handleProjectChange(index, 'title', event.target.value)}
													placeholder="Project name"
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
												<input
													type="text"
													value={project.role}
													onChange={(event) => handleProjectChange(index, 'role', event.target.value)}
													placeholder="Role (optional)"
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
												<textarea
													rows={3}
													value={project.description}
													onChange={(event) => handleProjectChange(index, 'description', event.target.value)}
													placeholder="Impact summary / what you built"
													className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
												<input
													type="text"
													value={project.technologies}
													onChange={(event) => handleProjectChange(index, 'technologies', event.target.value)}
													placeholder="Technologies (comma separated)"
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
												<input
													type="url"
													value={project.githubUrl}
													onChange={(event) => handleProjectChange(index, 'githubUrl', event.target.value)}
													placeholder="GitHub URL"
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
												<input
													type="url"
													value={project.liveUrl}
													onChange={(event) => handleProjectChange(index, 'liveUrl', event.target.value)}
													placeholder="Demo URL"
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
											</div>
											<div className="mt-4 flex justify-end">
												<button
													type="button"
													onClick={() => updateForm({ projects: form.projects.filter((_, idx) => idx !== index) })}
													className="btn-danger inline-flex items-center gap-2"
												>
													<FiTrash2 className="h-4 w-4" /> Remove
												</button>
											</div>
										</div>
									))}
								</div>
							</section>

							<section>
								<div className="mb-4 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-amber-200">
											<FiAward className="h-5 w-5" />
										</div>
										<div>
											<h3 className="text-lg font-semibold text-white">Certifications</h3>
											<p className="text-xs text-white/40">Highlight platform-issued or external credentials.</p>
										</div>
									</div>
									<button
										type="button"
										onClick={() => updateForm({ certifications: [...form.certifications, { ...defaultCertification }] })}
										className="btn-secondary inline-flex items-center gap-2"
									>
										<FiPlus className="h-4 w-4" /> Add certification
									</button>
								</div>

								{form.certifications.length === 0 && (
									<div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/50">
										Pull in platform certificates or external recognitions.
									</div>
								)}

								<div className="space-y-6">
									{form.certifications.map((cert, index) => (
										<div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-6">
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
												<input
													type="text"
													value={cert.name}
													onChange={(event) => handleCertificationChange(index, 'name', event.target.value)}
													placeholder="Certificate name"
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
												<input
													type="text"
													value={cert.issuer}
													onChange={(event) => handleCertificationChange(index, 'issuer', event.target.value)}
													placeholder="Issuer"
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
												<input
													type="date"
													value={cert.date}
													onChange={(event) => handleCertificationChange(index, 'date', event.target.value)}
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
												<input
													type="url"
													value={cert.credentialUrl}
													onChange={(event) => handleCertificationChange(index, 'credentialUrl', event.target.value)}
													placeholder="Verification URL"
													className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
												/>
											</div>
											<div className="mt-4 flex justify-end">
												<button
													type="button"
													onClick={() => updateForm({ certifications: form.certifications.filter((_, idx) => idx !== index) })}
													className="btn-danger inline-flex items-center gap-2"
												>
													<FiTrash2 className="h-4 w-4" /> Remove
												</button>
											</div>
										</div>
									))}
								</div>
							</section>

							<div>
								<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Career highlights</label>
								<textarea
									rows={3}
									value={form.highlight}
									onChange={(event) => updateForm({ highlight: event.target.value })}
									placeholder="One concise paragraph with your proudest achievements."
									className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
								/>
							</div>

							<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
								<button type="button" onClick={onClose} className="btn-secondary sm:min-w-[180px]">
									Cancel
								</button>
								<button type="submit" disabled={isSaving} className="btn-primary sm:min-w-[200px]">
									{isSaving ? 'Saving...' : mode === 'create' ? 'Create resume' : 'Save changes'}
								</button>
							</div>
						</form>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

const ResumePage = () => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [isEditorOpen, setIsEditorOpen] = useState(false);
	const [editorMode, setEditorMode] = useState('create');
	const [editorResume, setEditorResume] = useState(null);
	const [analysisCache, setAnalysisCache] = useState({});
	const [analyzingId, setAnalyzingId] = useState(null);

	const { data: templatesData, isLoading: templatesLoading } = useQuery('resumeTemplates', resumeAPI.getTemplates);
	const templateList = useMemo(() => templatesData?.data || [], [templatesData]);

	const {
		data: resumesData,
		isLoading,
		isFetching,
	} = useQuery('studentResumes', resumeAPI.getMyResumes);

	const resumes = useMemo(() => resumesData?.data || [], [resumesData]);

	const stats = useMemo(() => {
		if (!resumes.length) {
			return { total: 0, averageScore: 0, topScore: 0, updated: null };
		}
		const scores = resumes.map((resume) => {
			const storedScore = resume.atsAnalysis?.score ?? resume.atsScore ?? 0;
			return Number.isFinite(storedScore) ? storedScore : 0;
		});
		const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
		const topScore = Math.max(...scores);
		const updated = resumes[0]?.updatedAt || resumes[0]?.lastModified || null;
		return { total: resumes.length, averageScore, topScore, updated };
	}, [resumes]);

	const closeEditor = () => {
		setIsEditorOpen(false);
		setEditorResume(null);
		setEditorMode('create');
	};

	const createMutation = useMutation((payload) => resumeAPI.createResume(payload), {
		onSuccess: () => {
			toast.success('Resume created successfully');
			queryClient.invalidateQueries('studentResumes');
			closeEditor();
		},
		onError: (error) => {
			toast.error(error?.message || 'Unable to create resume');
		},
	});

	const updateMutation = useMutation(
		({ id, payload }) => resumeAPI.updateResume(id, payload),
		{
			onSuccess: () => {
				toast.success('Resume updated');
				queryClient.invalidateQueries('studentResumes');
				closeEditor();
			},
			onError: (error) => {
				toast.error(error?.message || 'Unable to update resume');
			},
		}
	);

	const deleteMutation = useMutation((id) => resumeAPI.deleteResume(id), {
		onSuccess: () => {
			toast.success('Resume removed');
			queryClient.invalidateQueries('studentResumes');
		},
		onError: (error) => {
			toast.error(error?.message || 'Failed to delete resume');
		},
	});

	const duplicateMutation = useMutation((payload) => resumeAPI.createResume(payload), {
		onSuccess: () => {
			toast.success('Resume duplicated');
			queryClient.invalidateQueries('studentResumes');
		},
		onError: (error) => {
			toast.error(error?.message || 'Unable to duplicate resume');
		},
	});

	const analyzeMutation = useMutation((id) => resumeAPI.analyze(id), {
		onMutate: (id) => setAnalyzingId(id),
		onSuccess: (response, id) => {
			toast.success('ATS analysis refreshed');
			if (response?.data) {
				setAnalysisCache((prev) => ({ ...prev, [id]: response.data }));
			}
		},
		onError: (error) => {
			toast.error(error?.message || 'Unable to analyze resume');
		},
		onSettled: () => {
			setAnalyzingId(null);
			queryClient.invalidateQueries('studentResumes');
		},
	});

	const handleCreate = (templateId) => {
		setEditorMode('create');
		setEditorResume({ templateId });
		setIsEditorOpen(true);
	};

	const handleEdit = (resume) => {
		setEditorMode('edit');
		setEditorResume(resume);
		setIsEditorOpen(true);
	};

	const handleSubmit = (payload) => {
		if (editorMode === 'create') {
			createMutation.mutate(payload);
		} else if (editorResume?._id) {
			updateMutation.mutate({ id: editorResume._id, payload });
		}
	};

	const handleDelete = (resume) => {
		if (deleteMutation.isLoading) return;
		const confirmed = window.confirm(`Delete resume for ${resume.resumeData?.personalInfo?.fullName || 'this profile'}?`);
		if (confirmed) {
			deleteMutation.mutate(resume._id);
		}
	};

	const handleDuplicate = (resume) => {
		if (duplicateMutation.isLoading) return;
		const payload = {
			templateId: resume.templateId,
			resumeData: JSON.parse(JSON.stringify(resume.resumeData || {})),
		};
		duplicateMutation.mutate(payload);
	};

	const handleExport = async (resume) => {
		try {
			const blob = await resumeAPI.export(resume._id);
			const fullName = resume.resumeData?.personalInfo?.fullName || 'resume';
			const safeName = fullName.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'resume';
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `${safeName}-resume.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			toast.success('Resume exported as PDF');
		} catch (error) {
			console.error('Export failed:', error);
			toast.error('Failed to export resume');
		}
	};

	const renderAnalysis = (resume) => {
		const cached = analysisCache[resume._id] || resume.atsAnalysis;
		if (!cached) {
			return (
				<div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
					Run ATS analysis to see suggestions tailored to this resume.
				</div>
			);
		}
		return (
			<div className="space-y-3">
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
						<FiTrendingUp className="h-5 w-5" />
					</div>
					<div>
						<p className="text-sm text-white/60">ATS Score</p>
						<p className="text-2xl font-semibold text-white">{cached.score ?? cached.atsScore ?? 0}</p>
					</div>
				</div>
				{Array.isArray(cached.suggestions) && cached.suggestions.length > 0 && (
					<ul className="space-y-2">
						{cached.suggestions.slice(0, 4).map((tip, index) => (
							<li key={index} className="flex items-start gap-2 text-xs text-white/70">
								<FiCheckCircle className="mt-[2px] h-4 w-4 text-emerald-300" />
								{tip}
							</li>
						))}
					</ul>
				)}
			</div>
		);
	};

	return (
		<Layout user={user} title="Resume workspace">
			<motion.div
				initial={{ opacity: 0, y: -18 }}
				animate={{ opacity: 1, y: 0 }}
				className="student-panel relative mb-10 overflow-hidden p-8"
			>
						<div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-fuchsia-500/25 blur-3xl" />
						<div className="pointer-events-none absolute -bottom-28 left-2 h-60 w-60 rounded-full bg-sky-500/20 blur-3xl" />
						<div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
							<div className="max-w-2xl">
								<p className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-300/40 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100/80">
									Resume
								</p>
								<h1 className="text-3xl font-bold text-white md:text-4xl">Build a resume recruiters will notice</h1>
								<p className="mt-3 max-w-2xl text-sm text-indigo-100/80">
									Curate your experience, run quick ATS checks, and export job-ready resumes in minutes.
								</p>
							</div>
							<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
								<div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 text-white">
									<p className="text-xs uppercase tracking-[0.25em] text-emerald-100/80">Average ATS</p>
									<p className="mt-2 text-3xl font-semibold text-white">{stats.averageScore}</p>
									<p className="mt-1 text-xs text-emerald-100/70">Target 80+ score</p>
								</div>
								<div className="flex flex-wrap gap-3">
									<button
										type="button"
										onClick={() => handleCreate(templateList[0]?.templateId || templateList[0]?._id || '')}
										className="btn-primary inline-flex items-center gap-2"
									>
										<FiPlus className="h-4 w-4" /> Blank resume
									</button>
									<button
										type="button"
										onClick={() => setIsEditorOpen(true)}
										className="btn-secondary inline-flex items-center gap-2"
									>
										<FiClipboard className="h-4 w-4" /> Import latest data
									</button>
								</div>
							</div>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
					>
						<div className="student-panel--subtle flex flex-col gap-2 p-6">
							<span className="text-xs uppercase tracking-[0.3em] text-white/50">Resumes created</span>
							<p className="text-3xl font-semibold text-white">{stats.total}</p>
							<span className="text-xs text-white/40">Everything saved securely in the cloud</span>
						</div>
						<div className="student-panel--subtle flex flex-col gap-2 p-6">
							<span className="text-xs uppercase tracking-[0.3em] text-white/50">Average ATS score</span>
							<p className="text-3xl font-semibold text-emerald-200">{stats.averageScore}</p>
							<span className="text-xs text-white/40">Aim for 80+ to stand out</span>
						</div>
						<div className="student-panel--subtle flex flex-col gap-2 p-6">
							<span className="text-xs uppercase tracking-[0.3em] text-white/50">Best performing</span>
							<p className="text-3xl font-semibold text-indigo-200">{stats.topScore}</p>
							<span className="text-xs text-white/40">Top score across saved resumes</span>
						</div>
						<div className="student-panel--subtle flex flex-col gap-2 p-6">
							<span className="text-xs uppercase tracking-[0.3em] text-white/50">Last updated</span>
							<p className="text-3xl font-semibold text-white">
								{stats.updated ? new Date(stats.updated).toLocaleDateString() : '—'}
							</p>
							<span className="text-xs text-white/40">Keep things fresh for new roles</span>
						</div>
					</motion.div>

					<div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
						<div className="xl:col-span-2 space-y-6">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-white">My resumes</h2>
								<span className="text-xs text-white/40">{isFetching ? 'Syncing…' : `${resumes.length} saved`}</span>
							</div>

							{isLoading ? (
								<div className="student-panel flex h-64 items-center justify-center text-white/70">
									Fetching resumes...
								</div>
							) : resumes.length === 0 ? (
								<div className="student-panel p-12 text-center text-white/75">
									<FiLayers className="mx-auto mb-4 h-12 w-12 text-indigo-300" />
									<p className="text-lg font-semibold text-white">No resumes yet</p>
									<p className="mt-2 text-sm text-white/50">Start fresh with a template or import your latest experience.</p>
									<div className="mt-6 flex justify-center gap-3">
										<button onClick={() => handleCreate(templateList[0]?.templateId || templateList[0]?._id || '')} className="btn-primary inline-flex items-center gap-2">
											<FiPlus className="h-4 w-4" /> Build resume
										</button>
										<button onClick={() => setIsEditorOpen(true)} className="btn-secondary inline-flex items-center gap-2">
											<FiClipboard className="h-4 w-4" /> Quick import
										</button>
									</div>
								</div>
							) : (
								<div className="space-y-6">
									{resumes.map((resume) => {
										const info = resume.resumeData?.personalInfo || {};
										const summary = resume.resumeData?.summary || '';
										const skills = (resume.resumeData?.skills || []).flatMap((group) => group.items || []);
										return (
											<motion.div
												key={resume._id}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												className="student-panel p-6"
											>
												<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
													<div className="space-y-4">
														<div>
															<div className="flex items-center gap-3">
																<div className="rounded-lg border border-indigo-400/30 bg-indigo-500/15 p-3 text-indigo-200">
																	<FiTarget className="h-5 w-5" />
																</div>
																<div>
																	<h3 className="text-lg font-semibold text-white">{info.fullName || 'Untitled resume'}</h3>
																	<p className="text-xs text-white/40">Updated {new Date(resume.updatedAt || resume.createdAt).toLocaleDateString()}</p>
																</div>
															</div>
															<p className="mt-3 max-w-2xl text-sm text-white/70 line-clamp-3">{summary || 'Add a summary to highlight your strengths for hiring managers.'}</p>
														</div>

														<div className="flex flex-wrap gap-2">
															{skills.slice(0, 6).map((skill) => (
																<span key={skill} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
																	{skill}
																</span>
															))}
															{skills.length > 6 && (
																<span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/50">
																	+{skills.length - 6} more
																</span>
															)}
															{skills.length === 0 && <span className="text-xs text-white/40">Add skills to optimize ATS matching</span>}
														</div>

														<div className="flex flex-wrap gap-3">
															<button
																type="button"
																onClick={() => handleEdit(resume)}
																className="btn-secondary inline-flex items-center gap-2"
															>
																<FiEdit className="h-4 w-4" /> Edit
															</button>
															<button
																type="button"
																disabled={duplicateMutation.isLoading}
																onClick={() => handleDuplicate(resume)}
																className="btn-secondary inline-flex items-center gap-2 disabled:opacity-60"
															>
																{duplicateMutation.isLoading ? (
																	<span>Duplicating...</span>
																) : (
																	<>
																		<FiCopy className="h-4 w-4" /> Duplicate
																	</>
																)}
															</button>
															<button
																type="button"
																onClick={() => analyzeMutation.mutate(resume._id)}
																disabled={analyzingId === resume._id}
																className="btn-primary inline-flex items-center gap-2"
															>
																{analyzingId === resume._id ? 'Analyzing...' : 'Run ATS check'}
															</button>
															<button
																type="button"
																onClick={() => handleDelete(resume)}
																className="btn-danger inline-flex items-center gap-2"
															>
																<FiTrash2 className="h-4 w-4" /> Delete
															</button>
															<button
																type="button"
																onClick={() => handleExport(resume)}
																className="btn-secondary inline-flex items-center gap-2"
															>
																<FiDownload className="h-4 w-4" /> Export
															</button>
														</div>
													</div>

													<div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-5">
														{renderAnalysis(resume)}
													</div>
												</div>
											</motion.div>
										);
									})}
								</div>
							)}
						</div>

						<div className="space-y-6">
							<div className="student-panel p-6">
								<div className="mb-4 flex items-center gap-3">
									<div className="rounded-lg border border-white/10 bg-white/10 p-2 text-white/60">
										<FiLayers className="h-5 w-5" />
									</div>
									<div>
										<h2 className="text-lg font-semibold text-white">Template gallery</h2>
										<p className="text-xs text-white/40">Choose from curated designer templates.</p>
									</div>
								</div>
								<div className="space-y-4">
									{templatesLoading ? (
										<p className="text-sm text-white/60">Loading templates...</p>
									) : templateList.length === 0 ? (
										<p className="text-sm text-white/60">Templates are being prepared. Try again later.</p>
									) : (
										templateList.slice(0, 6).map((template) => (
											<div key={template.templateId || template._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
												<div>
													<p className="text-sm font-semibold text-white">{template.name}</p>
													<span className="text-xs text-white/50">{template.category}</span>
												</div>
												<button
													type="button"
													onClick={() => handleCreate(template.templateId || template._id)}
													className="btn-secondary inline-flex items-center gap-2"
												>
													Use template <FiChevronRight className="h-4 w-4" />
												</button>
											</div>
										))
									)}
								</div>
							</div>

							<div className="student-panel p-6">
								<div className="mb-4 flex items-center gap-3">
									<div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-2 text-emerald-200">
										<FiTrendingUp className="h-5 w-5" />
									</div>
									<div>
										<h2 className="text-lg font-semibold text-white">ATS playbook</h2>
										<p className="text-xs text-white/40">Quick wins before you submit.</p>
									</div>
								</div>
								<ul className="space-y-3 text-sm text-white/70">
									<li className="flex gap-2">
										<FiCheckCircle className="mt-[2px] h-4 w-4 text-emerald-300" /> Mirror keywords from the job description across summary, skills, and experience.
									</li>
									<li className="flex gap-2">
										<FiCheckCircle className="mt-[2px] h-4 w-4 text-emerald-300" /> Quantify achievements: ship dates, revenue impact, adoption metrics.
									</li>
									<li className="flex gap-2">
										<FiCheckCircle className="mt-[2px] h-4 w-4 text-emerald-300" /> Keep formatting simple. Paste from your resume to preview how ATS reads it.
									</li>
									<li className="flex gap-2">
										<FiCheckCircle className="mt-[2px] h-4 w-4 text-emerald-300" /> Add internal projects or hackathon wins under Projects to surface practical experience.
									</li>
								</ul>
							</div>

							<div className="student-panel p-6">
								<h2 className="text-lg font-semibold text-white">Need a fast refresh?</h2>
								<p className="mt-2 text-sm text-white/60">
									Duplicate your top resume, tweak the summary, and tailor skills for each role. Recruiters appreciate focus.
								</p>
								<button
									type="button"
									onClick={() => toast('Resume duplication ships next sprint!', { icon: '✨' })}
									className="mt-4 btn-secondary inline-flex items-center gap-2"
								>
									Notify me when ready
								</button>
							</div>
						</div>
					</div>

			<ResumeEditor
				open={isEditorOpen}
				mode={editorMode}
				templates={templateList}
				initialResume={editorResume}
				isSaving={createMutation.isLoading || updateMutation.isLoading}
				onSubmit={handleSubmit}
				onClose={closeEditor}
			/>
		</Layout>
	);
};

export default ResumePage;