import React, { useState } from 'react';
import axios from 'axios';
import { Shield, Smartphone, Key, AlertCircle, ArrowLeft } from 'lucide-react';

const TwoFactorVerification = ({ userEmail, onVerificationSuccess, onBack }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerification = async () => {
    if (!verificationCode) {
      setError('Please enter a verification code');
      return;
    }

    if (!isBackupCode && verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (isBackupCode && verificationCode.length !== 8) {
      setError('Please enter a valid 8-character backup code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/verify-2fa', {
        email: userEmail,
        token: verificationCode,
        isBackupCode: isBackupCode
      });

      // Store the JWT token
      localStorage.setItem('token', response.data.token);
      
      // Call success callback with user data
      onVerificationSuccess(response.data);

    } catch (error) {
      setError(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVerification();
    }
  };

  const toggleCodeType = () => {
    setIsBackupCode(!isBackupCode);
    setVerificationCode('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the verification code to complete your login
          </p>
          <p className="text-sm text-gray-500">
            Logging in as: <span className="font-medium">{userEmail}</span>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Code Type Toggle */}
            <div className="flex justify-center mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => !isBackupCode || toggleCodeType()}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    !isBackupCode 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Authenticator App
                </button>
                <button
                  onClick={() => isBackupCode || toggleCodeType()}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isBackupCode 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Backup Code
                </button>
              </div>
            </div>

            {/* Verification Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isBackupCode ? 'Enter backup code' : 'Enter 6-digit code'}
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = isBackupCode 
                    ? e.target.value.replace(/[^A-Fa-f0-9]/g, '').slice(0, 8).toUpperCase()
                    : e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                }}
                onKeyPress={handleKeyPress}
                placeholder={isBackupCode ? 'XXXXXXXX' : '000000'}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                maxLength={isBackupCode ? 8 : 6}
                autoComplete="off"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                {isBackupCode 
                  ? 'Enter one of your 8-character backup codes'
                  : 'Enter the code from your authenticator app'
                }
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleVerification}
                disabled={loading || !verificationCode}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify and Login'
                )}
              </button>

              <button
                onClick={onBack}
                className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                {isBackupCode ? (
                  <>
                    Can't find your backup codes?{' '}
                    <button 
                      onClick={toggleCodeType}
                      className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Use authenticator app instead
                    </button>
                  </>
                ) : (
                  <>
                    Lost your phone?{' '}
                    <button 
                      onClick={toggleCodeType}
                      className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Use a backup code
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <Shield className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Security Notice</h3>
                <p className="text-xs text-blue-700 mt-1">
                  This extra step helps keep your trading account secure. Never share your verification codes with anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerification;
