import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiGlobe, FiBriefcase, FiUsers } from 'react-icons/fi';
import { authAPI, companiesAPI } from '../utils/api';

const CompanyRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Company Info
    companyName: '',
    domain: '',
    description: '',
    website: '',
    industry: 'technology',
    size: '1-10',
    location: '',
    contactEmail: '',
    contactPhone: '',
    // Admin Info
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: ''
  });

  const industries = [
    'technology',
    'finance',
    'healthcare',
    'education',
    'retail',
    'manufacturing',
    'consulting',
    'other'
  ];

  const companySizes = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.adminPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await companiesAPI.register({
        companyName: formData.companyName,
        domain: formData.domain,
        description: formData.description,
        website: formData.website,
        industry: formData.industry,
        size: formData.size,
        location: formData.location,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword
      });

      toast.success('Company registration submitted! Please wait for admin approval.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.companyName || !formData.domain || !formData.contactEmail) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Register Your Company</h1>
          <p className="text-white/70">Join the platform and start recruiting talent</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-500' : 'bg-white/20'} text-white font-semibold`}>
              1
            </div>
            <div className={`w-20 h-1 ${step >= 2 ? 'bg-purple-500' : 'bg-white/20'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-500' : 'bg-white/20'} text-white font-semibold`}>
              2
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Company Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Company Information</h2>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-3 text-white/50" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Acme Corporation"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Company Domain * (unique identifier)
                </label>
                <div className="relative">
                  <FiGlobe className="absolute left-3 top-3 text-white/50" />
                  <input
                    type="text"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="acme.com"
                  />
                </div>
                <p className="text-xs text-white/50 mt-1">This will be used as your company identifier</p>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Brief description of your company..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Industry
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {industries.map(ind => (
                      <option key={ind} value={ind} className="bg-gray-800 text-white">
                        {ind.charAt(0).toUpperCase() + ind.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Company Size
                  </label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {companySizes.map(size => (
                      <option key={size} value={size} className="bg-gray-800 text-white">
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Website
                </label>
                <div className="relative">
                  <FiGlobe className="absolute left-3 top-3 text-white/50" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://acme.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Location
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3 text-white/50" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Contact Email *
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3 text-white/50" />
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="contact@acme.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-3 text-white/50" />
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
              >
                Continue to Admin Details
              </button>
            </div>
          )}

          {/* Step 2: Admin Information */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Admin Account</h2>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Admin Name *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-white/50" />
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Admin Email *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-white/50" />
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="admin@acme.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-white/50" />
                  <input
                    type="password"
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-white/50" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-white/80">
                  ℹ️ Your company registration will be reviewed by our team. You'll receive an email once approved.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-300 hover:text-purple-200 font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegister;
