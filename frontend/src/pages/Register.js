import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus, FiHash, FiBook, FiBriefcase } from 'react-icons/fi';
import { companiesAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: '',
    department: '',
    year: '',
    companyId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch approved companies
  const { data: companiesData } = useQuery('approvedCompanies', companiesAPI.getApproved);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (formData.role === 'student' && !formData.companyId) {
      toast.error('Please select a company');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        companyId: formData.companyId,
      };

      if (formData.role === 'student') {
        userData.studentId = formData.studentId;
        userData.department = formData.department;
        userData.year = parseInt(formData.year);
      }

      await register(userData);
      navigate(formData.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const companies = companiesData?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-0 -left-4"></div>
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 -right-4"></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4"
            >
              <FiUserPlus className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/70">Join ProjectHub today</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    className="block w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-white/50 hover:text-white" />
                    ) : (
                      <FiEye className="h-5 w-5 text-white/50 hover:text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                    className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                  className={`p-4 rounded-xl border-2 transition ${
                    formData.role === 'student'
                      ? 'bg-purple-500/30 border-purple-400'
                      : 'bg-white/5 border-white/20 hover:border-white/40'
                  }`}
                >
                  <p className="text-white font-semibold">Student</p>
                  <p className="text-white/70 text-sm">Looking for projects</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`p-4 rounded-xl border-2 transition ${
                    formData.role === 'admin'
                      ? 'bg-blue-500/30 border-blue-400'
                      : 'bg-white/5 border-white/20 hover:border-white/40'
                  }`}
                >
                  <p className="text-white font-semibold">Admin</p>
                  <p className="text-white/70 text-sm">Manage projects</p>
                </button>
              </div>
            </div>

            {/* Student-specific fields */}
            {formData.role === 'student' && (
              <>
                {/* Company Selection */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Select Company *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiBriefcase className="h-5 w-5 text-white/50" />
                    </div>
                    <select
                      name="companyId"
                      value={formData.companyId}
                      onChange={handleChange}
                      required={formData.role === 'student'}
                      className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    >
                      <option value="" className="bg-gray-800">Choose a company...</option>
                      {companies.map((company) => (
                        <option key={company._id} value={company._id} className="bg-gray-800">
                          {company.name} {company.isOpenSource ? '(Open Source)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    Don't see your company? <Link to="/company/register" className="text-purple-300 hover:underline">Register it here</Link>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Student ID */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Student ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiHash className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      required={formData.role === 'student'}
                      className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      placeholder="STU001"
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiBook className="h-5 w-5 text-white/50" />
                    </div>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required={formData.role === 'student'}
                      className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    >
                      <option value="" className="bg-gray-800">Select...</option>
                      <option value="Computer Science" className="bg-gray-800">Computer Science</option>
                      <option value="Information Technology" className="bg-gray-800">Information Technology</option>
                      <option value="Electronics" className="bg-gray-800">Electronics</option>
                      <option value="Mechanical" className="bg-gray-800">Mechanical</option>
                      <option value="Civil" className="bg-gray-800">Civil</option>
                    </select>
                  </div>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Year
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required={formData.role === 'student'}
                    className="block w-full px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  >
                    <option value="" className="bg-gray-800">Select...</option>
                    <option value="1" className="bg-gray-800">1st Year</option>
                    <option value="2" className="bg-gray-800">2nd Year</option>
                    <option value="3" className="bg-gray-800">3rd Year</option>
                    <option value="4" className="bg-gray-800">4th Year</option>
                  </select>
                </div>
              </div>
              </>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-white/70">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-white font-semibold hover:text-purple-300 transition"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-white/70 hover:text-white transition text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;