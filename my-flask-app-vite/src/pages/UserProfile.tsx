import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Shield,
  ChevronRight,
  Mail,
  Key
} from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';
import { authAPI, securityAPI, userAPI } from '../services/api';

const userProfileTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'your-details', label: 'My details' },
  { id: 'account-security', label: 'Account & security' },
];

interface InfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white shadow rounded-lg p-6 flex flex-col justify-between text-left w-full transition duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
  >
    <div className="flex-shrink-0 mb-4">
      <Icon className="w-8 h-8 text-blue-600" />
    </div>
    <div className="flex-grow mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <span className="self-start flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-800">
      View
      <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
    </span>
  </button>
);

const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userDetails, setUserDetails] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    employmentStatus: '',
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    currentPassword: '',
    newPassword: '',
  });
  const [userEmail, setUserEmail] = useState<string>('');
  const currentRegistrationDate = moment().format('YYYY-MM-DD');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        const userData = response.data;
        setUserEmail(userData.email);
        setUserDetails({
          name: userData.name || '',
          phone: userData.phone || '',
          dateOfBirth: userData.date_of_birth ? moment(userData.date_of_birth).format('YYYY-MM-DD') : '',
          gender: userData.gender || '',
          employmentStatus: userData.employment_status || '',
        });
        setSecuritySettings(prev => ({
          ...prev,
          twoFactorEnabled: userData.two_factor_enabled
        }));
      } catch {
        toast.error('Could not load your profile data.');
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSecurityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecuritySettings(prevSettings => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleSaveDetails = async () => {
    try {
      const payload = {
        name: userDetails.name,
        phone: userDetails.phone,
        date_of_birth: userDetails.dateOfBirth,
        gender: userDetails.gender,
        employment_status: userDetails.employmentStatus,
      };
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      await userAPI.updateProfile(payload);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile.');
    }
  };

  const handleChangePassword = async () => {
    try {
      const { currentPassword, newPassword } = securitySettings;
      if (!currentPassword || !newPassword) {
        toast.error('Please enter both current and new password.');
        return;
      }
      await securityAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success('Password changed successfully!');
      setSecuritySettings(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch {
      toast.error('Failed to change password.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard
              icon={UserIcon}
              title="My details"
              description="Your profile information"
              onClick={() => setActiveTab('your-details')}
            />
            <InfoCard
              icon={Shield}
              title="Account & security"
              description="Password and active sessions"
              onClick={() => setActiveTab('account-security')}
            />
            <InfoCard
              icon={Mail}
              title="Communication"
              description="Email and SMS communication"
              onClick={() => alert('Not implemented')}
            />
          </div>
        );
      case 'your-details':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Details</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={userDetails.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100 cursor-not-allowed"
                  value={userEmail}
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={userDetails.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={userDetails.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={userDetails.gender}
                  onChange={handleInputChange}
                >
                  <option value="" disabled hidden>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700">Employment Status</label>
                <select
                  id="employmentStatus"
                  name="employmentStatus"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={userDetails.employmentStatus}
                  onChange={handleInputChange}
                >
                  <option value="" disabled hidden>Select Employment Status</option>
                  <option value="Full time">Full time</option>
                  <option value="Part time">Part time</option>
                  <option value="Work at home">Work at home</option>
                  <option value="Self-employed">Self-employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Retired">Retired</option>
                  <option value="Student">Student</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700">Registration Date</label>
                <input
                  type="text"
                  id="registrationDate"
                  name="registrationDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100 cursor-not-allowed"
                  value={currentRegistrationDate}
                  readOnly
                />
              </div>
              <div className="mt-6">
                <button
                  onClick={handleSaveDetails}
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      case 'account-security':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Account & Security</h2>
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Key className="w-6 h-6 text-gray-600" />
                  <span>Change Password</span>
                </h3>
                <p className="text-gray-600 mb-4">Update your password to keep your account secure.</p>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={securitySettings.currentPassword}
                    onChange={handleSecurityInputChange}
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={securitySettings.newPassword}
                    onChange={handleSecurityInputChange}
                    placeholder="Enter your new password"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:scale-105 active:scale-95"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="mt-1 text-lg text-gray-600">
            Manage your account details, security, and preferences.
          </p>
        </div>
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {userProfileTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 text-lg font-medium focus:outline-none transition-colors
                  ${activeTab === tab.id
                    ? 'text-blue-700 border-b-4 border-blue-600'
                    : 'text-gray-500 hover:text-blue-600 border-b-4 border-transparent'
                  }`}
                style={{
                  background: 'none',
                  boxShadow: 'none',
                  borderRadius: 0,
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;