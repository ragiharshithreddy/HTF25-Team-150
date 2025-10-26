import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiArrowRight, FiCheckCircle, FiLock, FiUsers, FiTrendingUp, 
  FiMessageCircle, FiX, FiSend, FiHeart, FiChevronDown
} from 'react-icons/fi';

const LandingPage = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [userName, setUserName] = useState('');
  const [chatStep, setChatStep] = useState(0);
  const [showCredits, setShowCredits] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage("Hey there! 👋 I'm your friendly ProjectHub assistant. What should I call you?");
      }, 500);
    }
  }, [chatOpen]);

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { type: 'bot', text }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { type: 'user', text }]);
  };

  const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs! 🐛😄",
    "Why did the developer go broke? Because they used up all their cache! 💰😂",
    "What's a programmer's favorite hangout place? Foo Bar! 🍻",
    "Why do Java developers wear glasses? Because they can't C#! 😎",
    "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡"
  ];

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const input = userInput.trim();
    addUserMessage(input);
    setUserInput('');

    setTimeout(() => {
      if (chatStep === 0) {
        setUserName(input);
        setChatStep(1);
        addBotMessage(`Nice to meet you, ${input}! 😊 Before we dive into work, let me lighten the mood...`);
        setTimeout(() => {
          addBotMessage(jokes[Math.floor(Math.random() * jokes.length)]);
          setTimeout(() => {
            addBotMessage("Feeling better? 😄 Now, how can I help you today? Type 'help' to see what I can do!");
            setChatStep(2);
          }, 2000);
        }, 1500);
      } else if (chatStep === 2) {
        handleUserQuery(input.toLowerCase());
      }
    }, 600);
  };

  const handleUserQuery = (query) => {
    if (query.includes('help') || query.includes('start') || query.includes('guide')) {
      addBotMessage(`Great! Here's how to get started with ProjectHub:\n\n1️⃣ Click "Get Started" to register\n2️⃣ Fill in your details (student or company)\n3️⃣ Verify your email\n4️⃣ Login and explore projects\n5️⃣ Apply to projects that match your skills\n6️⃣ Take skill tests and build your resume\n\nWhat would you like to know more about?`);
    } else if (query.includes('project') || query.includes('apply')) {
      addBotMessage("To apply for projects:\n\n✅ Browse available projects in the Projects section\n✅ Click on a project to view details\n✅ Click 'Apply' and fill in your motivation\n✅ You may need to take a skill test\n✅ Wait for admin approval\n\nNeed help with anything else?");
    } else if (query.includes('test') || query.includes('skill')) {
      addBotMessage("About Skill Tests:\n\n📝 Tests are role-specific assessments\n⏱️ Each test has a time limit\n🎯 You need to provide reasoning for answers\n👨‍💼 Admins review your reasoning\n✅ Pass to proceed with your application\n\nReady to showcase your skills?");
    } else if (query.includes('resume') || query.includes('cv')) {
      addBotMessage("Resume Builder Tips:\n\n📄 Use our ATS-optimized templates\n🎯 Mirror keywords from job descriptions\n💪 Quantify achievements\n🔧 Keep it updated regularly\n\nWant to build your resume now?");
    } else if (query.includes('certificate') || query.includes('blockchain')) {
      addBotMessage("Blockchain Certificates:\n\n🔐 All certificates are blockchain-verified\n🌐 Immutable and tamper-proof\n📲 Share via unique link\n✅ Verifiable by employers\n\nComplete projects to earn yours!");
    } else if (query.includes('thanks') || query.includes('thank')) {
      addBotMessage(`You're welcome, ${userName}! 😊 Feel free to ask me anything anytime. Good luck with your projects! 🚀`);
    } else if (query.includes('bye') || query.includes('exit')) {
      addBotMessage(`See you later, ${userName}! 👋 Come back if you need anything. Have a productive day! 💪`);
    } else if (query.includes('team') || query.includes('who')) {
      addBotMessage("This awesome platform was created by Team 150! 🎉\n\n👨‍💻 R Harshith Reddy\n👨‍💻 Abhishek\n👨‍💻 Vishwanath\n👨‍💻 Revanth\n\nWith ❤️ from the COSC team!");
    } else {
      addBotMessage(`Hmm, I'm not sure about that, ${userName}. Try asking about:\n\n• Getting started\n• Applying to projects\n• Skill tests\n• Resume building\n• Certificates\n• Our team\n\nWhat interests you?`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-0 -left-4"></div>
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 -right-4"></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-6 py-20 relative z-10"
      >
        <div className="text-center">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 text-transparent bg-clip-text mb-6 drop-shadow-2xl"
          >
            ProjectHub
          </motion.h1>
          
          <motion.p
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-white/90 mb-6 max-w-3xl mx-auto font-semibold"
          >
            Blockchain-Verified Project Enrollment & Allocation System
          </motion.p>

          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/70 mb-12 max-w-2xl mx-auto"
          >
            Streamline project applications, track progress, and earn blockchain-verified certificates
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Link 
              to="/register" 
              className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              Get Started
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold border border-white/30 transition-all duration-300"
            >
              Sign In
            </Link>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => setShowCredits(!showCredits)}
            className="text-white/60 hover:text-white/90 text-sm transition-colors duration-300 inline-flex items-center gap-2"
          >
            <FiHeart className="text-pink-400" />
            Made with love by Team 150
            <FiChevronDown className={`transition-transform ${showCredits ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {showCredits && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 student-panel p-6 max-w-md mx-auto"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Created by Team 150</h3>
                <div className="space-y-2 text-white/80">
                  <p className="flex items-center gap-2">👨‍💻 R Harshith Reddy</p>
                  <p className="flex items-center gap-2">👨‍💻 Abhishek</p>
                  <p className="flex items-center gap-2">👨‍💻 Vishwanath</p>
                  <p className="flex items-center gap-2">👨‍💻 Revanth</p>
                </div>
                <p className="mt-4 text-purple-300 text-sm flex items-center justify-center gap-2">
                  <FiHeart className="text-pink-400" />
                  With love from COSC team
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {[
            { icon: FiCheckCircle, title: 'Real-time Applications', description: 'Submit and track applications instantly', color: 'text-green-400' },
            { icon: FiLock, title: 'Blockchain Verified', description: 'Immutable certificate storage', color: 'text-blue-400' },
            { icon: FiUsers, title: 'Smart Matching', description: 'AI-powered project recommendations', color: 'text-purple-400' },
            { icon: FiTrendingUp, title: 'ATS Resume Builder', description: 'Optimize your resume for success', color: 'text-pink-400' },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="student-panel p-6 text-center hover:shadow-[0_20px_50px_rgba(139,92,246,0.4)] transition-all duration-300"
            >
              <feature.icon className={`w-12 h-12 mx-auto mb-4 ${feature.color}`} />
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ Chatbot */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] student-panel shadow-2xl rounded-2xl overflow-hidden z-50"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FiMessageCircle className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">ProjectHub Assistant</h3>
                  <p className="text-white/70 text-xs">Always here to help! 😊</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white/80 hover:text-white transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="h-[360px] overflow-y-auto p-4 space-y-3">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'bg-white/10 text-white/90 backdrop-blur-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={chatStep === 0 ? "Type your name..." : "Type your question..."}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-xl hover:from-purple-600 hover:to-blue-600 transition"
                >
                  <FiSend className="text-white" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all hover:scale-110"
      >
        {chatOpen ? <FiX className="w-6 h-6" /> : <FiMessageCircle className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

export default LandingPage;
