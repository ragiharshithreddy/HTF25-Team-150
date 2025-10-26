import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
	FiTarget,
	FiClock,
	FiZap,
	FiActivity,
	FiSearch,
	FiFilter,
	FiPlayCircle,
	FiCheckCircle,
	FiXCircle,
	FiBookOpen,
	FiX,
	FiList
} from 'react-icons/fi';
import Layout from '../components/Layout';
import { testsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const difficultyLabels = {
	beginner: 'Beginner',
	intermediate: 'Intermediate',
	advanced: 'Advanced',
};

const TestPreviewModal = ({ test, open, onClose }) => (
	<AnimatePresence>
		{open && test && (
			<motion.div
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
			>
				<motion.div
					className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/15 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8"
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 40 }}
					transition={{ duration: 0.2 }}
				>
					<div className="mb-6 flex items-start justify-between gap-6">
						<div>
							<h2 className="text-2xl font-semibold text-white">{test.title}</h2>
							<p className="text-sm text-white/60">{test.role} · {difficultyLabels[test.difficulty] || test.difficulty}</p>
						</div>
						<button type="button" onClick={onClose} className="btn-secondary inline-flex items-center gap-2">
							<FiX className="h-4 w-4" /> Close
						</button>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
							<p className="text-xs text-white/50">Duration</p>
							<p className="text-lg font-semibold text-white">{test.duration} min</p>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
							<p className="text-xs text-white/50">Passing score</p>
							<p className="text-lg font-semibold text-emerald-200">{test.passingScore || 70}%</p>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
							<p className="text-xs text-white/50">Total questions</p>
							<p className="text-lg font-semibold text-indigo-200">{test.questions?.length || '—'}</p>
						</div>
					</div>

					<div className="mt-8">
						<h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">Skills covered</h3>
						<div className="mt-3 flex flex-wrap gap-2">
							{(test.skills || []).length > 0 ? (
								test.skills.map((skill) => (
									<span key={skill} className="rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3 py-1 text-xs text-indigo-100">
										{skill}
									</span>
								))
							) : (
								<span className="text-xs text-white/40">Skill tags coming soon</span>
							)}
						</div>
					</div>

					<div className="mt-8">
						<h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">What to expect</h3>
						<div className="mt-3 space-y-3 text-sm text-white/70">
							<p>Questions span core fundamentals, situational problem solving, and role-specific scenarios. Anti-cheat is enabled—stay focused in the browser.</p>
							{test.questions?.slice(0, 3).map((question, index) => (
								<div key={question.questionId || index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
									<p className="text-xs text-white/40">Sample {index + 1}</p>
									<p className="mt-2 text-white/80">{question.question}</p>
									<p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-white/30">{question.type}</p>
								</div>
							))}
							{(test.questions?.length || 0) > 3 && (
								<p className="text-xs text-white/50">+{test.questions.length - 3} more questions in the actual test</p>
							)}
						</div>
					</div>
				</motion.div>
			</motion.div>
		)}
	</AnimatePresence>
);

const TestPage = () => {
	const { user } = useAuth();
	const [difficultyFilter, setDifficultyFilter] = useState('all');
	const [skillFilter, setSkillFilter] = useState('all');
	const [search, setSearch] = useState('');
	const [activeAttempt, setActiveAttempt] = useState(null);
	const [previewTest, setPreviewTest] = useState(null);

	const { data: testsData, isLoading: testsLoading } = useQuery('availableTests', testsAPI.getAll);
	const tests = useMemo(() => testsData?.data || [], [testsData]);

	const { data: attemptsData } = useQuery('myTestAttempts', testsAPI.getMyAttempts);
	const attempts = useMemo(() => attemptsData?.data || [], [attemptsData]);

	const availableSkills = useMemo(() => {
		const skillSet = new Set();
		tests.forEach((test) => {
			(test.skills || []).forEach((skill) => skillSet.add(skill));
		});
		return ['all', ...Array.from(skillSet)];
	}, [tests]);

	const filteredTests = useMemo(() => {
		const term = search.trim().toLowerCase();
		return tests.filter((test) => {
			if (difficultyFilter !== 'all' && test.difficulty !== difficultyFilter) return false;
			if (skillFilter !== 'all' && !(test.skills || []).includes(skillFilter)) return false;
			if (!term) return true;
			const haystack = [test.title, test.role, ...(test.skills || [])]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(term);
		});
	}, [tests, difficultyFilter, skillFilter, search]);

	const stats = useMemo(() => {
		const totalTests = tests.length;
		const totalAttempts = attempts.length;
		const passes = attempts.filter((attempt) => {
			const score = attempt.score?.percentage ?? attempt.score?.obtained ?? attempt.percentage;
			const threshold = (typeof attempt.testId === 'object' && attempt.testId?.passingScore) || 70;
			return Number(score) >= threshold;
		}).length;
		const averageScore = attempts.length
			? Math.round(
					attempts.reduce((sum, attempt) => sum + (attempt.score?.percentage ?? attempt.score?.obtained ?? 0), 0) /
						attempts.length
				)
			: 0;
		const passRate = totalAttempts ? Math.round((passes / totalAttempts) * 100) : 0;
		return { totalTests, totalAttempts, passRate, averageScore };
	}, [tests, attempts]);

	const startMutation = useMutation((testId) => testsAPI.start(testId), {
		onSuccess: (response) => {
			if (response?.data) {
				setActiveAttempt(response.data);
				toast.success('Attempt created. Good luck!');
			} else {
				toast('Attempt created');
			}
		},
		onError: (error) => {
			toast.error(error?.message || 'Unable to start test');
		},
	});

	const resolveAttemptMeta = (attempt) => {
		if (attempt.testId && typeof attempt.testId === 'object') return attempt.testId;
		return tests.find((test) => test._id === attempt.testId || test.testId === attempt.testId) || null;
	};

	const renderStatusBadge = (attempt) => {
		const score = attempt.score?.percentage ?? attempt.score?.obtained ?? 0;
		const meta = resolveAttemptMeta(attempt);
		const threshold = meta?.passingScore || 70;
		const passed = score >= threshold;
		const inProgress = attempt.status === 'in-progress';
		if (inProgress) {
			return (
				<span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs text-amber-100">
					<FiClock className="h-4 w-4" /> In progress
				</span>
			);
		}
		return passed ? (
			<span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-100">
				<FiCheckCircle className="h-4 w-4" /> Passed
			</span>
		) : (
			<span className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/15 px-3 py-1 text-xs text-rose-100">
				<FiXCircle className="h-4 w-4" /> {attempt.status === 'completed' ? 'Review needed' : 'Attempted'}
			</span>
		);
	};

	return (
		<Layout user={user} title="Skill Tests">
			<div className="p-6 lg:p-10">
				<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<h1 className="text-4xl font-bold text-white drop-shadow-lg">Prove your skills with role-based assessments</h1>
							<p className="mt-3 max-w-2xl text-base text-white/90">
								Each test simulates real interview scenarios with automated anti-cheat and instant scoring.
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<button
								type="button"
								onClick={() => toast('Practice sandbox arrives soon!', { icon: '🧠' })}
								className="btn-secondary inline-flex items-center gap-2"
							>
								<FiBookOpen className="h-4 w-4" /> Practice mode
							</button>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
					>
						<div className="student-panel p-6">
							<p className="text-sm font-medium uppercase tracking-wider text-white/70">Active tests</p>
							<p className="mt-2 text-4xl font-bold text-white">{stats.totalTests}</p>
							<p className="mt-1 text-xs text-white/60">Available to take</p>
						</div>
						<div className="student-panel p-6">
							<p className="text-sm font-medium uppercase tracking-wider text-white/70">Attempts</p>
							<p className="mt-2 text-4xl font-bold text-indigo-300">{stats.totalAttempts}</p>
							<p className="mt-1 text-xs text-white/60">Tests completed</p>
						</div>
						<div className="student-panel p-6">
							<p className="text-sm font-medium uppercase tracking-wider text-white/70">Average score</p>
							<p className="mt-2 text-4xl font-bold text-emerald-300">{stats.averageScore}%</p>
							<p className="mt-1 text-xs text-white/60">Across all attempts</p>
						</div>
						<div className="student-panel p-6">
							<p className="text-sm font-medium uppercase tracking-wider text-white/70">Pass rate</p>
							<p className="mt-2 text-4xl font-bold text-white">{stats.passRate}%</p>
							<p className="mt-1 text-xs text-white/60">Success ratio</p>
						</div>
					</motion.div>

					<div className="student-panel mb-8 p-6">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
							<div className="relative md:col-span-2">
								<FiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
								<input
									type="text"
									value={search}
									onChange={(event) => setSearch(event.target.value)}
									placeholder="Search roles, skills, or difficulty"
									className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-white placeholder-white/60 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition"
								/>
							</div>
							<div className="relative">
								<FiFilter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
								<select
									value={difficultyFilter}
									onChange={(event) => setDifficultyFilter(event.target.value)}
									className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition"
								>
									<option value="all" className="bg-slate-900 text-white">All difficulty</option>
									<option value="beginner" className="bg-slate-900 text-white">Beginner</option>
									<option value="intermediate" className="bg-slate-900 text-white">Intermediate</option>
									<option value="advanced" className="bg-slate-900 text-white">Advanced</option>
								</select>
							</div>
							<div className="relative">
								<FiFilter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
								<select
									value={skillFilter}
									onChange={(event) => setSkillFilter(event.target.value)}
									className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition"
								>
									{availableSkills.map((skill) => (
										<option key={skill} value={skill} className="bg-slate-900 text-white">
											{skill === 'all' ? 'All skills' : skill}
										</option>
									))}
								</select>
							</div>
						</div>
						<p className="mt-4 text-sm text-white/70">{testsLoading ? 'Loading tests…' : `${filteredTests.length} tests ready to start`}</p>
					</div>

					{testsLoading ? (
						<div className="student-panel flex h-64 items-center justify-center">
							<div className="text-center">
								<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
								<p className="text-white/80">Fetching available tests…</p>
							</div>
						</div>
					) : filteredTests.length === 0 ? (
						<div className="student-panel p-12 text-center">
							<FiTarget className="mx-auto mb-4 h-16 w-16 text-purple-400" />
							<p className="text-xl font-semibold text-white">No tests match your filters</p>
							<p className="mt-3 text-base text-white/70">Broaden your filters or check back as new assessments go live.</p>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
							{filteredTests.map((test) => (
								<motion.div
									key={test._id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									className="glass-card flex flex-col gap-5 p-6"
								>
									<div className="flex items-start justify-between gap-4">
										<div>
											<div className="flex items-center gap-3">
												<div className="rounded-lg border border-indigo-400/30 bg-indigo-500/15 p-3 text-indigo-200">
													<FiZap className="h-5 w-5" />
												</div>
												<div>
													<h3 className="text-lg font-semibold text-white">{test.title}</h3>
													<p className="text-xs text-white/40">{test.role}</p>
												</div>
											</div>
											<p className="mt-4 text-sm text-white/70">{test.description || 'Proctored assessment covering real-world scenarios aligned with the role.'}</p>
										</div>
										<button onClick={() => setPreviewTest(test)} className="btn-secondary inline-flex items-center gap-2">
											<FiList className="h-4 w-4" /> View outline
										</button>
									</div>

									<div className="flex flex-wrap gap-3 text-xs text-white/60">
										<span className="inline-flex items-center gap-2"><FiClock className="h-4 w-4" /> {test.duration} min</span>
										<span className="inline-flex items-center gap-2"><FiActivity className="h-4 w-4" /> {difficultyLabels[test.difficulty] || test.difficulty}</span>
										<span className="inline-flex items-center gap-2"><FiTarget className="h-4 w-4" /> Score {test.passingScore || 70}%</span>
									</div>

									<div className="flex flex-wrap gap-2">
										{(test.skills || []).slice(0, 5).map((skill) => (
											<span key={skill} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
												{skill}
											</span>
										))}
										{(test.skills || []).length > 5 && (
											<span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/50">
												+{test.skills.length - 5} more
											</span>
										)}
									</div>

									<div className="flex flex-wrap gap-3">
										<button
											type="button"
											onClick={() => startMutation.mutate(test._id || test.testId)}
											className="btn-primary inline-flex items-center gap-2"
											disabled={startMutation.isLoading && startMutation.variables === (test._id || test.testId)}
										>
											{startMutation.isLoading && startMutation.variables === (test._id || test.testId) ? 'Preparing…' : (
												<>
													<FiPlayCircle className="h-4 w-4" /> Start test
												</>
											)}
										</button>
										<button
											type="button"
											onClick={() => toast('Mentor review queue opening soon!', { icon: '🧑‍🏫' })}
											className="btn-secondary inline-flex items-center gap-2"
										>
											Mentor review
										</button>
									</div>
								</motion.div>
							))}
						</div>
					)}

					<div className="mt-12 grid grid-cols-1 gap-6 xl:grid-cols-3">
						<div className="xl:col-span-2">
							<div className="mb-4 flex items-center justify-between">
								<h2 className="text-2xl font-bold text-white">Attempt history</h2>
								<span className="rounded-full bg-purple-500/20 px-3 py-1 text-sm font-medium text-purple-200">{attempts.length} records</span>
							</div>
							<div className="student-panel rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden">
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-white/10">
										<thead className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
											<tr>
												<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/80">Test</th>
												<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/80">Attempted</th>
												<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/80">Score</th>
												<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/80">Status</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-white/5">
											{attempts.length === 0 ? (
												<tr>
													<td colSpan={4} className="px-6 py-12 text-center">
														<FiTarget className="mx-auto mb-3 h-12 w-12 text-white/30" />
														<p className="text-sm font-medium text-white/60">No attempts yet</p>
														<p className="mt-1 text-xs text-white/40">Start a test to see your progress here.</p>
													</td>
												</tr>
											) : (
												attempts.map((attempt, index) => {
													const meta = resolveAttemptMeta(attempt);
													const score = attempt.score?.percentage ?? attempt.score?.obtained ?? 0;
													return (
														<motion.tr 
															key={attempt._id}
															initial={{ opacity: 0, y: 10 }}
															animate={{ opacity: 1, y: 0 }}
															transition={{ delay: index * 0.05 }}
															className="hover:bg-white/5 transition-colors"
														>
															<td className="px-6 py-4">
																<div className="flex flex-col">
																	<span className="font-semibold text-white text-sm">{meta?.title || attempt.testId || 'Skill test'}</span>
																	<span className="text-xs text-white/50 mt-1">{meta?.role || 'Role pending'}</span>
																</div>
															</td>
															<td className="px-6 py-4">
																<span className="text-xs text-white/60">{new Date(attempt.createdAt).toLocaleString()}</span>
															</td>
															<td className="px-6 py-4">
																<span className={`text-sm font-bold ${
																	score >= 70 ? 'text-emerald-300' : 'text-rose-300'
																}`}>{score}%</span>
															</td>
															<td className="px-6 py-4">{renderStatusBadge(attempt)}</td>
														</motion.tr>
													);
												})
											)}
										</tbody>
									</table>
								</div>
							</div>
						</div>

						<div className="space-y-6">
							<AnimatePresence>
								{activeAttempt && (
									<motion.div
										key={activeAttempt.attempt}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 20 }}
										className="student-panel rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm p-6"
									>
										<div className="mb-4 flex items-start justify-between">
											<div>
												<p className="text-xs uppercase tracking-wider text-purple-300 font-semibold">Attempt ready</p>
												<h3 className="text-lg font-bold text-white mt-1">{activeAttempt.test?.title || 'Skill assessment'}</h3>
											</div>
											<button type="button" onClick={() => setActiveAttempt(null)} className="text-white/50 hover:text-white transition">
												<FiX className="h-5 w-5" />
											</button>
										</div>
										<p className="text-sm text-white/80 leading-relaxed">Open the dedicated test runner to begin. Keep this browser window focused to avoid warnings.</p>
										<div className="mt-4 grid grid-cols-2 gap-3">
											<div className="rounded-lg bg-white/10 p-3 text-center">
												<FiClock className="h-5 w-5 mx-auto text-blue-300 mb-1" />
												<p className="text-xs text-white/60">Duration</p>
												<p className="text-sm font-bold text-white">{activeAttempt.duration} min</p>
											</div>
											<div className="rounded-lg bg-white/10 p-3 text-center">
												<FiTarget className="h-5 w-5 mx-auto text-purple-300 mb-1" />
												<p className="text-xs text-white/60">Pass Score</p>
												<p className="text-sm font-bold text-white">{activeAttempt.test?.passingScore || 70}%</p>
											</div>
										</div>
										<button
											type="button"
											onClick={() => toast('Launching secure runner soon. For now, notes saved to clipboard.', { icon: '✅' })}
											className="mt-5 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition inline-flex items-center justify-center gap-2"
										>
											<FiPlayCircle className="h-5 w-5" /> Launch runner
										</button>
									</motion.div>
								)}
							</AnimatePresence>

							<motion.div 
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="student-panel rounded-2xl border border-white/10 backdrop-blur-sm p-6"
							>
								<div className="flex items-center gap-3 mb-5">
									<div className="rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-3">
										<FiCheckCircle className="h-6 w-6 text-amber-300" />
									</div>
									<h3 className="text-xl font-bold text-white">Anti-cheat checklist</h3>
								</div>
								<ul className="space-y-3">
									<li className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition">
										<div className="rounded-full bg-amber-500/20 p-1 mt-0.5">
											<FiClock className="h-4 w-4 text-amber-300" />
										</div>
										<div className="flex-1">
											<p className="text-sm font-medium text-white">Stay in the same tab</p>
											<p className="text-xs text-white/60 mt-1">Switching tabs triggers warnings</p>
										</div>
									</li>
									<li className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition">
										<div className="rounded-full bg-amber-500/20 p-1 mt-0.5">
											<FiXCircle className="h-4 w-4 text-amber-300" />
										</div>
										<div className="flex-1">
											<p className="text-sm font-medium text-white">Disable sharing tools</p>
											<p className="text-xs text-white/60 mt-1">Turn off screen sharing and clipboard tools</p>
										</div>
									</li>
									<li className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition">
										<div className="rounded-full bg-amber-500/20 p-1 mt-0.5">
											<FiActivity className="h-4 w-4 text-amber-300" />
										</div>
										<div className="flex-1">
											<p className="text-sm font-medium text-white">Enable camera if required</p>
											<p className="text-xs text-white/60 mt-1">Keep camera on for proctoring</p>
										</div>
									</li>
									<li className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition">
										<div className="rounded-full bg-amber-500/20 p-1 mt-0.5">
											<FiCheckCircle className="h-4 w-4 text-amber-300" />
										</div>
										<div className="flex-1">
											<p className="text-sm font-medium text-white">Submit within timer</p>
											<p className="text-xs text-white/60 mt-1">Autosave happens every minute</p>
										</div>
									</li>
								</ul>
								<div className="mt-5 pt-5 border-t border-white/10">
									<p className="text-xs text-center text-white/50">
										<span className="inline-flex items-center gap-2">
											<FiCheckCircle className="h-4 w-4 text-emerald-400" />
											Fair play ensures authentic skill validation
										</span>
									</p>
								</div>
							</motion.div>
						</div>
					</div>
				</div>

			<TestPreviewModal open={Boolean(previewTest)} test={previewTest} onClose={() => setPreviewTest(null)} />
		</Layout>
	);
};

export default TestPage;