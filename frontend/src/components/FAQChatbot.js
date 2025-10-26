import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiHelpCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

// FAQ Database with keywords and responses
const FAQ_DATA = [
	{
		keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
		responses: [
			"Hello! 👋 How can I help you today?",
			"Hi there! What would you like to know?",
			"Hey! I'm here to help. What's your question?"
		],
		category: 'greeting'
	},
	{
		keywords: ['how are you', 'how do you do', 'whats up', "what's up"],
		responses: [
			"I'm doing great, thanks for asking! How can I assist you?",
			"I'm here and ready to help! What do you need?"
		],
		category: 'greeting'
	},
	{
		keywords: ['thanks', 'thank you', 'appreciate', 'grateful'],
		responses: [
			"You're welcome! Happy to help! 😊",
			"Glad I could help! Let me know if you need anything else.",
			"Anytime! Feel free to ask more questions."
		],
		category: 'gratitude'
	},
	{
		keywords: ['yes', 'yeah', 'yep', 'sure', 'okay', 'ok', 'correct', 'right'],
		responses: [
			"Great! How else can I assist you?",
			"Perfect! Is there anything else you'd like to know?",
			"Awesome! Let me know if you have more questions."
		],
		category: 'affirmative'
	},
	{
		keywords: ['no', 'nope', 'not really', 'negative', "don't", 'dont'],
		responses: [
			"No problem! Feel free to ask if you need anything else.",
			"Understood. I'm here if you have other questions!",
			"Alright! Let me know how I can help."
		],
		category: 'negative'
	},
	{
		keywords: ['bye', 'goodbye', 'see you', 'later', 'exit'],
		responses: [
			"Goodbye! Have a great day! 👋",
			"See you later! Feel free to come back anytime.",
			"Take care! I'll be here if you need me."
		],
		category: 'farewell'
	},
	{
		keywords: ['apply', 'application', 'how to apply', 'submit application'],
		responses: [
			"To apply for a project:\n1. Go to the Projects page\n2. Browse available projects\n3. Click 'Apply Now' on your chosen project\n4. Fill in your details and motivation\n5. Submit your application!\n\nYou'll receive notifications about your application status."
		],
		category: 'application'
	},
	{
		keywords: ['project', 'projects', 'available projects', 'find projects'],
		responses: [
			"You can find all available projects on the Projects page! Use filters to search by category, difficulty, or technologies. Each project shows:\n- Description and requirements\n- Team size\n- Required skills\n- Application deadline"
		],
		category: 'projects'
	},
	{
		keywords: ['resume', 'cv', 'build resume', 'create resume'],
		responses: [
			"To create your resume:\n1. Go to the Resume page\n2. Click 'Blank resume' or choose a template\n3. Fill in your details (personal info, experience, skills)\n4. Run ATS analysis to optimize your resume\n5. Download or share!\n\nTip: Aim for an ATS score of 80+ for better visibility."
		],
		category: 'resume'
	},
	{
		keywords: ['test', 'tests', 'skill test', 'assessment', 'exam'],
		responses: [
			"Skill tests help validate your expertise! Here's how:\n1. Go to the Tests page\n2. Browse available tests by role/difficulty\n3. Click 'Start test' when ready\n4. Complete within the time limit\n5. Get instant results!\n\n⚠️ Anti-cheat is enabled - stay focused in the browser tab."
		],
		category: 'tests'
	},
	{
		keywords: ['certificate', 'certificates', 'certification'],
		responses: [
			"Earn blockchain-verified certificates by:\n- Completing projects successfully\n- Passing skill tests\n- Contributing to team goals\n\nAll certificates are tamper-proof and can be verified on-chain! View yours on the Certificates page."
		],
		category: 'certificates'
	},
	{
		keywords: ['notification', 'notifications', 'alerts'],
		responses: [
			"Stay updated with notifications about:\n- Application status (approved/rejected/shortlisted)\n- Test assignments\n- Interview schedules\n- Certificate issuance\n\nCheck the Notifications page or click the bell icon in the navbar!"
		],
		category: 'notifications'
	},
	{
		keywords: ['profile', 'edit profile', 'update profile', 'photo', 'avatar'],
		responses: [
			"Update your profile anytime:\n1. Go to Profile page\n2. Upload a profile photo (max 5MB)\n3. Update personal details\n4. Add skills and links (LinkedIn, GitHub)\n5. Change password if needed\n\nComplete profile = better visibility to recruiters!"
		],
		category: 'profile'
	},
	{
		keywords: ['settings', 'preferences', 'account settings'],
		responses: [
			"Customize your experience in Settings:\n- Notification preferences (email, SMS, push)\n- Privacy controls\n- Language and timezone\n- Theme preferences\n- Export or delete your data"
		],
		category: 'settings'
	},
	{
		keywords: ['password', 'forgot password', 'reset password', 'change password'],
		responses: [
			"To change your password:\n1. Go to Profile page\n2. Scroll to 'Change Password' section\n3. Enter current password\n4. Enter new password\n5. Confirm and save\n\nForgot password? Use the 'Forgot Password' link on the login page."
		],
		category: 'password'
	},
	{
		keywords: ['help', 'support', 'contact', 'issue', 'problem'],
		responses: [
			"Need help? Here are your options:\n📧 Email: support@projecthub.com\n💬 Live chat: Available 9 AM - 6 PM\n📚 Documentation: Check the Help Center\n🐛 Bug report: Use the feedback button\n\nWe're here to assist you!"
		],
		category: 'support'
	},
	{
		keywords: ['ats', 'ats score', 'resume score'],
		responses: [
			"ATS (Applicant Tracking System) score measures how well your resume matches job requirements:\n\n✅ 80-100: Excellent\n⚠️ 60-79: Good, but needs improvement\n❌ Below 60: Optimize your resume\n\nTips to improve:\n- Use keywords from job description\n- Quantify achievements\n- Keep formatting simple\n- Add relevant skills"
		],
		category: 'ats'
	},
	{
		keywords: ['anti-cheat', 'proctoring', 'test rules'],
		responses: [
			"Our anti-cheat system ensures fair testing:\n\n📌 Stay in the same browser tab\n📌 Disable screen sharing tools\n📌 Keep camera enabled if required\n📌 Submit within time limit\n\n⚠️ Tab switching triggers warnings. Multiple violations may invalidate your test."
		],
		category: 'anti-cheat'
	},
	{
		keywords: ['deadline', 'due date', 'last date'],
		responses: [
			"Project deadlines are shown on each project card. You can also:\n- Filter projects 'Closing Soon' (within 7 days)\n- Check the Projects page for all deadlines\n- Enable notifications for deadline reminders\n\nPlan ahead and apply early!"
		],
		category: 'deadline'
	},
	{
		keywords: ['team', 'team size', 'collaborate', 'members'],
		responses: [
			"Each project shows:\n- Maximum team size\n- Available roles\n- Filled/open positions\n\nOnce approved, you'll be added to the team and can collaborate with other members through the project dashboard."
		],
		category: 'team'
	},
	{
		keywords: ['status', 'application status', 'check status'],
		responses: [
			"Track your application status:\n\n📋 Pending: Under review\n⭐ Shortlisted: You're on the radar!\n✅ Approved: Congratulations!\n❌ Rejected: Keep trying!\n\nCheck Applications page or Notifications for updates."
		],
		category: 'status'
	},
	{
		keywords: ['skill', 'skills', 'add skills', 'technology'],
		responses: [
			"Showcase your skills:\n\n1. Profile page: Add your core skills\n2. Resume: List technical and soft skills\n3. Applications: Highlight relevant skills\n4. Tests: Prove your expertise\n\nMore skills = better project matches!"
		],
		category: 'skills'
	},
	{
		keywords: ['what', 'how', 'when', 'where', 'why', 'who'],
		responses: [
			"I can help you with:\n- Applying to projects\n- Building resumes\n- Taking skill tests\n- Earning certificates\n- Managing profile & settings\n- Tracking applications\n\nJust ask me anything specific!"
		],
		category: 'general'
	}
];

// Default fallback responses
const FALLBACK_RESPONSES = [
	"I'm not sure I understand. Could you rephrase that?",
	"Hmm, I don't have information on that yet. Try asking about projects, applications, resumes, or tests!",
	"I didn't quite get that. Ask me about:\n- How to apply\n- Building resumes\n- Skill tests\n- Certificates\n- Profile settings",
	"That's a great question! For specific help, contact support@projecthub.com or check the Help Center."
];

const FAQChatbot = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState([
		{
			id: 1,
			type: 'bot',
			text: "👋 Hi! I'm your ProjectHub assistant. Ask me anything about applications, resumes, tests, or certificates!",
			timestamp: new Date()
		}
	]);
	const [inputValue, setInputValue] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	const findBestMatch = (userInput) => {
		const input = userInput.toLowerCase().trim();
		
		// Find exact matches
		for (const faq of FAQ_DATA) {
			for (const keyword of faq.keywords) {
				if (input === keyword || input.includes(keyword)) {
					const responses = faq.responses;
					return responses[Math.floor(Math.random() * responses.length)];
				}
			}
		}

		// Find partial matches
		for (const faq of FAQ_DATA) {
			for (const keyword of faq.keywords) {
				const words = input.split(' ');
				if (words.some(word => keyword.includes(word) || word.includes(keyword))) {
					const responses = faq.responses;
					return responses[Math.floor(Math.random() * responses.length)];
				}
			}
		}

		// No match found
		return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
	};

	const handleSend = () => {
		if (!inputValue.trim()) return;

		// Add user message
		const userMessage = {
			id: messages.length + 1,
			type: 'user',
			text: inputValue,
			timestamp: new Date()
		};

		setMessages(prev => [...prev, userMessage]);
		setInputValue('');
		setIsTyping(true);

		// Simulate bot typing delay
		setTimeout(() => {
			const botResponse = findBestMatch(inputValue);
			const botMessage = {
				id: messages.length + 2,
				type: 'bot',
				text: botResponse,
				timestamp: new Date()
			};

			setMessages(prev => [...prev, botMessage]);
			setIsTyping(false);
		}, 800 + Math.random() * 400);
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const quickActions = [
		{ label: 'How to apply?', query: 'how to apply' },
		{ label: 'Build resume', query: 'build resume' },
		{ label: 'Skill tests', query: 'skill tests' },
		{ label: 'Get help', query: 'help' }
	];

	const handleQuickAction = (query) => {
		setInputValue(query);
		setTimeout(() => handleSend(), 100);
	};

	return (
		<>
			{/* Chatbot Toggle Button */}
			<motion.button
				onClick={() => setIsOpen(!isOpen)}
				className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-[0_10px_40px_rgba(139,92,246,0.4)] hover:shadow-[0_15px_50px_rgba(139,92,246,0.6)] transition-all duration-300"
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.95 }}
				title="FAQ Chatbot"
			>
				<AnimatePresence mode="wait">
					{isOpen ? (
						<motion.div
							key="close"
							initial={{ rotate: -90, opacity: 0 }}
							animate={{ rotate: 0, opacity: 1 }}
							exit={{ rotate: 90, opacity: 0 }}
							transition={{ duration: 0.2 }}
						>
							<FiX className="h-6 w-6" />
						</motion.div>
					) : (
						<motion.div
							key="open"
							initial={{ rotate: 90, opacity: 0 }}
							animate={{ rotate: 0, opacity: 1 }}
							exit={{ rotate: -90, opacity: 0 }}
							transition={{ duration: 0.2 }}
						>
							<FiMessageCircle className="h-6 w-6" />
						</motion.div>
					)}
				</AnimatePresence>
			</motion.button>

			{/* Chatbot Window */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[400px] flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
					>
						{/* Header */}
						<div className="flex items-center justify-between rounded-t-2xl border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
									<FiHelpCircle className="h-5 w-5 text-white" />
								</div>
								<div>
									<h3 className="text-sm font-semibold text-white">FAQ Assistant</h3>
									<p className="text-xs text-white/60">Always here to help</p>
								</div>
							</div>
							<button
								onClick={() => setIsOpen(false)}
								className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
							>
								<FiX className="h-5 w-5" />
							</button>
						</div>

						{/* Messages */}
						<div className="flex-1 overflow-y-auto p-4 space-y-4">
							{messages.map((message) => (
								<motion.div
									key={message.id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
								>
									<div
										className={`max-w-[80%] rounded-2xl px-4 py-2 ${
											message.type === 'user'
												? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
												: 'border border-white/10 bg-white/5 text-white/90'
										}`}
									>
										<p className="whitespace-pre-line text-sm">{message.text}</p>
										<p className="mt-1 text-[10px] opacity-60">
											{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
										</p>
									</div>
								</motion.div>
							))}

							{isTyping && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="flex justify-start"
								>
									<div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
										<div className="flex gap-1">
											<motion.div
												className="h-2 w-2 rounded-full bg-white/60"
												animate={{ y: [0, -5, 0] }}
												transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
											/>
											<motion.div
												className="h-2 w-2 rounded-full bg-white/60"
												animate={{ y: [0, -5, 0] }}
												transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
											/>
											<motion.div
												className="h-2 w-2 rounded-full bg-white/60"
												animate={{ y: [0, -5, 0] }}
												transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
											/>
										</div>
									</div>
								</motion.div>
							)}

							<div ref={messagesEndRef} />
						</div>

						{/* Quick Actions */}
						{messages.length === 1 && (
							<div className="border-t border-white/10 p-3">
								<p className="mb-2 text-xs text-white/60">Quick actions:</p>
								<div className="grid grid-cols-2 gap-2">
									{quickActions.map((action, index) => (
										<button
											key={index}
											onClick={() => handleQuickAction(action.query)}
											className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
										>
											{action.label}
										</button>
									))}
								</div>
							</div>
						)}

						{/* Input */}
						<div className="rounded-b-2xl border-t border-white/10 bg-white/5 p-4">
							<div className="flex gap-2">
								<input
									ref={inputRef}
									type="text"
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									onKeyPress={handleKeyPress}
									placeholder="Type your question..."
									className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
								/>
								<button
									onClick={handleSend}
									disabled={!inputValue.trim()}
									className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 p-2 text-white transition hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<FiSend className="h-5 w-5" />
								</button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};

export default FAQChatbot;
