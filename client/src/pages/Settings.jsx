// client/src/pages/Settings.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TwoFactorManagement from '../components/TwoFactorManagement';

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Account Settings
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* 2FA Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Two-Factor Authentication (2FA)
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <TwoFactorManagement />
            </div>
          </div>

          {/* Other settings sections can be added here */}
        </div>
      </div>
    </div>
  );
};

export default Settings;