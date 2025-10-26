import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
	FiAward,
	FiShield,
	FiSearch,
	FiFilter,
	FiCopy,
	FiCheckCircle,
	FiAlertCircle,
	FiExternalLink,
	FiCalendar,
	FiDownload,
	FiShare2,
	FiActivity
} from 'react-icons/fi';
import Layout from '../components/Layout';
import { certificatesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const formatDate = (value) => {
	if (!value) return '—';
	return new Date(value).toLocaleDateString();
};

const CertificatesPage = () => {
	const { user } = useAuth();
	const [filters, setFilters] = useState({ status: 'all', type: 'all', search: '' });
	const [verificationCache, setVerificationCache] = useState({});

	const { data, isLoading, isFetching } = useQuery('studentCertificates', certificatesAPI.getMyCertificates);
	const certificates = useMemo(() => data?.data || [], [data]);

	const stats = useMemo(() => {
		const total = certificates.length;
		const active = certificates.filter((cert) => !(cert.isRevoked || cert.revoked)).length;
		const revoked = total - active;
		const blockchainMinted = certificates.filter((cert) => cert.blockchain?.transactionHash).length;
		return { total, active, revoked, blockchainMinted };
	}, [certificates]);

	const availableTypes = useMemo(() => {
		const unique = new Set(certificates.map((cert) => cert.type).filter(Boolean));
		return ['all', ...unique];
	}, [certificates]);

	const filteredCertificates = useMemo(() => {
		const searchTerm = filters.search.trim().toLowerCase();
		return certificates.filter((cert) => {
			const isRevoked = cert.isRevoked || cert.revoked;
			if (filters.status === 'active' && isRevoked) return false;
			if (filters.status === 'revoked' && !isRevoked) return false;
			if (filters.type !== 'all' && cert.type !== filters.type) return false;
			if (!searchTerm) return true;
					const haystack = [
						cert.title,
						cert.metadata?.studentName,
						cert.metadata?.projectTitle,
						cert.certificateId,
						cert.certificateHash,
					]
						.filter(Boolean)
						.join(' ')
						.toLowerCase();
			return haystack.includes(searchTerm);
		});
	}, [certificates, filters]);

	const verifyMutation = useMutation((certificateId) => certificatesAPI.verify(certificateId), {
		onSuccess: (response, id) => {
			if (response?.verified) {
				toast.success('Certificate verified successfully');
			} else if (response?.message) {
				toast(response.message, { icon: 'ℹ️' });
			}
			setVerificationCache((prev) => ({ ...prev, [id]: response }));
		},
		onError: (error) => {
			toast.error(error?.message || 'Verification failed');
		},
	});

	const copyToClipboard = async (value, label) => {
		try {
			await navigator.clipboard.writeText(value);
			toast.success(`${label} copied`);
		} catch (error) {
			toast.error('Copy not supported in this browser');
		}
	};

	return (
		<Layout user={user} title="Certificates">
			<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h1 className="text-4xl font-bold text-white">Blockchain-secured certificates</h1>
					<p className="mt-2 max-w-2xl text-sm text-indigo-200">
						Showcase achievements, track verification status, and share tamper-proof credentials.
					</p>
				</div>
				<div className="flex flex-wrap gap-3">
					<button
						type="button"
						onClick={() => toast('Public certificate page launches soon!', { icon: '🚀' })}
						className="btn-secondary inline-flex items-center gap-2"
					>
						<FiShare2 className="h-4 w-4" /> Share profile
					</button>
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
			>
				<div className="student-panel rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm p-6">
					<p className="text-xs text-white/60 uppercase tracking-wider">Total certificates</p>
					<p className="text-3xl font-semibold text-white mt-2">{stats.total}</p>
				</div>
				<div className="student-panel rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-sm p-6">
					<p className="text-xs text-white/60 uppercase tracking-wider">Active</p>
					<p className="text-3xl font-semibold text-emerald-200 mt-2">{stats.active}</p>
				</div>
				<div className="student-panel rounded-2xl border border-white/10 bg-gradient-to-br from-rose-500/20 to-red-500/20 backdrop-blur-sm p-6">
					<p className="text-xs text-white/60 uppercase tracking-wider">Revoked</p>
					<p className="text-3xl font-semibold text-rose-200 mt-2">{stats.revoked}</p>
				</div>
				<div className="student-panel rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 backdrop-blur-sm p-6">
					<p className="text-xs text-white/60 uppercase tracking-wider">On-chain</p>
					<p className="text-3xl font-semibold text-indigo-200 mt-2">{stats.blockchainMinted}</p>
				</div>
			</motion.div>

			<div className="student-panel rounded-2xl border border-white/10 backdrop-blur-sm mb-8 p-6">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
					<div className="relative md:col-span-2">
						<FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
						<input
							type="text"
							value={filters.search}
							onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
							placeholder="Search by project, issuer, or hash"
							className="w-full rounded-xl border border-white/15 bg-white/5 py-2 pl-10 pr-4 text-white placeholder-white/40 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
						/>
					</div>
					<div className="relative">
						<FiFilter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
						<select
							value={filters.status}
							onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
							className="w-full rounded-xl border border-white/15 bg-white/5 py-2 pl-10 pr-4 text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
						>
							<option value="all" className="bg-slate-900">All statuses</option>
							<option value="active" className="bg-slate-900">Active</option>
							<option value="revoked" className="bg-slate-900">Revoked</option>
						</select>
					</div>
					<div className="relative">
						<FiFilter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
						<select
							value={filters.type}
							onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
							className="w-full rounded-xl border border-white/15 bg-white/5 py-2 pl-10 pr-4 text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
						>
							{availableTypes.map((type) => (
								<option key={type} value={type} className="bg-slate-900">
									{type === 'all' ? 'All types' : type.replace('-', ' ')}
								</option>
							))}
						</select>
					</div>
				</div>
				<p className="mt-3 text-xs text-white/40">{isFetching ? 'Refreshing credentials…' : `${filteredCertificates.length} results`}</p>
			</div>

			{isLoading ? (
				<div className="student-panel rounded-2xl border border-white/10 backdrop-blur-sm flex h-64 items-center justify-center text-white/60">
					Loading certificates…
				</div>
			) : filteredCertificates.length === 0 ? (
				<div className="student-panel rounded-2xl border border-white/10 backdrop-blur-sm p-12 text-center text-white/70">
					<FiShield className="mx-auto mb-4 h-12 w-12 text-indigo-300" />
					<p className="text-lg font-semibold text-white">No credentials found</p>
					<p className="mt-2 text-sm text-white/50">Complete projects and skill tests to earn verifiable certificates.</p>
				</div>
			) : (
				<div className="space-y-6">
					{filteredCertificates.map((certificate) => {
						const isRevoked = certificate.isRevoked || certificate.revoked;
						const verifier = verificationCache[certificate._id] || verificationCache[certificate.id];
						const verifiedStatus = verifier?.verified;
						const blockchain = certificate.blockchain || {};
						const ipfsUrl = certificate.ipfs?.url || certificate.ipfsGatewayUrl;
						const explorerUrl = certificate.blockchainExplorerUrl || (blockchain.transactionHash
							? `https://${(blockchain.network || 'mumbai').includes('main') ? 'polygonscan.com' : 'mumbai.polygonscan.com'}/tx/${blockchain.transactionHash}`
							: null);

						return (
							<motion.div
								key={certificate._id || certificate.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="student-panel rounded-2xl border border-white/10 backdrop-blur-sm p-6"
							>
								<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
									<div className="space-y-4">
										<div className="flex flex-wrap items-start gap-4">
											<div className={`rounded-full border px-3 py-1 text-xs font-semibold ${isRevoked ? 'border-rose-400/40 bg-rose-500/15 text-rose-200' : 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'}`}>
												{isRevoked ? 'Revoked' : 'Valid'}
											</div>
											<div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/60">
												{certificate.type?.replace('-', ' ') || 'achievement'}
											</div>
											<div className="inline-flex items-center gap-2 text-xs text-white/50">
												<FiCalendar className="h-4 w-4" /> Issued {formatDate(certificate.createdAt || certificate.issuedAt)}
											</div>
										</div>
										<div>
											<h3 className="text-xl font-semibold text-white">{certificate.title || certificate.metadata?.projectTitle || 'Certificate'}</h3>
											<p className="mt-2 text-sm text-white/60">
												{certificate.description || certificate.metadata?.projectDescription || 'This certificate validates your skills and contributions across platform projects.'}
											</p>
										</div>
										<div className="flex flex-wrap gap-3 text-xs text-white/60">
											<span className="inline-flex items-center gap-2">
												<FiAward className="h-4 w-4" /> Issued by {certificate.metadata?.issuerName || certificate.issuedBy?.name || 'Platform Admin'}
											</span>
											{certificate.metadata?.studentName && (
												<span className="inline-flex items-center gap-2">
													<FiActivity className="h-4 w-4" /> Recipient {certificate.metadata.studentName}
												</span>
											)}
											{certificate.metadata?.skillsVerified && certificate.metadata.skillsVerified.length > 0 && (
												<span className="inline-flex items-center gap-2">
													<FiCheckCircle className="h-4 w-4" /> Skills: {certificate.metadata.skillsVerified.slice(0, 3).join(', ')}
													{certificate.metadata.skillsVerified.length > 3 && ` +${certificate.metadata.skillsVerified.length - 3}`}
												</span>
											)}
										</div>

										<div className="flex flex-wrap gap-3">
											<button
												type="button"
												onClick={() => verifyMutation.mutate(certificate._id || certificate.id)}
												className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:from-purple-600 hover:to-blue-600 transition inline-flex items-center gap-2"
												disabled={verifyMutation.isLoading && verifyMutation.variables === (certificate._id || certificate.id)}
											>
												{verifyMutation.isLoading && verifyMutation.variables === (certificate._id || certificate.id) ? 'Verifying…' : 'Verify integrity'}
											</button>
											{explorerUrl && (
												<a
													href={explorerUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition inline-flex items-center gap-2"
												>
													<FiExternalLink className="h-4 w-4" /> View on chain
												</a>
											)}
											{ipfsUrl && (
												<a
													href={ipfsUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition inline-flex items-center gap-2"
												>
													<FiDownload className="h-4 w-4" /> View PDF
												</a>
											)}
											<button
												type="button"
												onClick={() => copyToClipboard(certificate.certificateHash || certificate.certificateId, 'Hash')}
												className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition inline-flex items-center gap-2"
											>
												<FiCopy className="h-4 w-4" /> Copy hash
											</button>
										</div>
									</div>

									<div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
										<div className="flex items-center gap-3">
											<div className="rounded-lg border border-white/10 bg-white/10 p-2 text-white/60">
												<FiShield className="h-5 w-5" />
											</div>
											<div>
												<p className="text-xs text-white/50">Verification snapshot</p>
												<p className={`text-lg font-semibold ${verifiedStatus ? 'text-emerald-200' : 'text-white'}`}>
													{verifiedStatus ? 'Authentic' : 'Pending check'}
												</p>
											</div>
										</div>

										<div className="rounded-xl border border-white/10 bg-white/10 p-3 text-xs text-white/60">
											<p className="flex items-center gap-2">
												<FiCopy className="h-4 w-4" /> Certificate ID
											</p>
											<button
												type="button"
												onClick={() => copyToClipboard(certificate.certificateId || certificate._id, 'Certificate ID')}
												className="mt-1 w-full truncate text-left text-white/80"
											>
												{certificate.certificateId || certificate._id}
											</button>
										</div>

										{verifier && (
											<div className="rounded-xl border border-white/10 bg-white/10 p-3 text-xs text-white/70">
												{verifier.verified ? (
													<div className="flex items-start gap-2 text-emerald-200">
														<FiCheckCircle className="h-4 w-4" />
														<span>Integrity confirmed. Blockchain signature matches.</span>
													</div>
												) : (
													<div className="flex items-start gap-2 text-amber-200">
														<FiAlertCircle className="h-4 w-4" />
														<span>{verifier.message || 'Verification completed with warnings.'}</span>
													</div>
												)}
											</div>
										)}

										{isRevoked && (
											<div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-xs text-rose-100">
												<p className="font-semibold">Revocation reason</p>
												<p>{certificate.revokedReason || 'Administrative action recorded by the issuer.'}</p>
											</div>
										)}
									</div>
								</div>
							</motion.div>
						);
					})}
				</div>
			)}
		</Layout>
	);
};

export default CertificatesPage;