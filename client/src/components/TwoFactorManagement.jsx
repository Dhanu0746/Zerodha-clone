import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, ShieldCheck, ShieldX, Key, RefreshCw, Download, AlertTriangle } from 'lucide-react';
import TwoFactorSetup from './TwoFactorSetup';

const TwoFactorManagement = () => {
  const [twoFactorStatus, setTwoFactorStatus] = useState({
    twoFactorEnabled: false,
    setupComplete: false,
    remainingBackupCodes: 0,
    hasUnusedBackupCodes: false
  });
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [regenerateCode, setRegenerateCode] = useState('');
  const [newBackupCodes, setNewBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch 2FA status
  const fetch2FAStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/2fa/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTwoFactorStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error);
    }
  };

  // Disable 2FA
  const disable2FA = async () => {
    if (!disableCode || disableCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/2fa/disable', {
        token: disableCode,
        password: 'dummy' // You might want to add password verification
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTwoFactorStatus(prev => ({
        ...prev,
        twoFactorEnabled: false,
        setupComplete: false,
        remainingBackupCodes: 0,
        hasUnusedBackupCodes: false
      }));
      
      setShowDisableModal(false);
      setDisableCode('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  // Regenerate backup codes
  const regenerateBackupCodes = async () => {
    if (!regenerateCode || regenerateCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/2fa/regenerate-backup-codes', {
        token: regenerateCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewBackupCodes(response.data.backupCodes);
      setTwoFactorStatus(prev => ({
        ...prev,
        remainingBackupCodes: response.data.remainingCodes,
        hasUnusedBackupCodes: true
      }));
      
      setRegenerateCode('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to regenerate backup codes');
    } finally {
      setLoading(false);
    }
  };

  // Download new backup codes
  const downloadNewBackupCodes = () => {
    const content = `Zerodha Clone - New 2FA Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\nBackup Codes (use each code only once):\n${newBackupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}\n\nKeep these codes safe and secure!\nOld backup codes are now invalid.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zerodha-clone-new-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setNewBackupCodes([]);
    setShowRegenerateModal(false);
  };

  useEffect(() => {
    fetch2FAStatus();
  }, []);

  if (showSetup) {
    return (
      <TwoFactorSetup
        onSetupComplete={() => {
          setShowSetup(false);
          fetch2FAStatus();
        }}
        onCancel={() => setShowSetup(false)}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Shield className="w-8 h-8 text-blue-500 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Two-Factor Authentication</h2>
          <p className="text-gray-600">Manage your account security settings</p>
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-8">
        <div className={`p-4 rounded-lg border-2 ${
          twoFactorStatus.twoFactorEnabled 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {twoFactorStatus.twoFactorEnabled ? (
                <ShieldCheck className="w-6 h-6 text-green-600 mr-3" />
              ) : (
                <ShieldX className="w-6 h-6 text-red-600 mr-3" />
              )}
              <div>
                <h3 className={`font-semibold ${
                  twoFactorStatus.twoFactorEnabled ? 'text-green-800' : 'text-red-800'
                }`}>
                  2FA is {twoFactorStatus.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </h3>
                <p className={`text-sm ${
                  twoFactorStatus.twoFactorEnabled ? 'text-green-600' : 'text-red-600'
                }`}>
                  {twoFactorStatus.twoFactorEnabled 
                    ? 'Your account is protected with two-factor authentication'
                    : 'Your account is not protected with two-factor authentication'
                  }
                </p>
              </div>
            </div>
            
            {!twoFactorStatus.twoFactorEnabled && (
              <button
                onClick={() => setShowSetup(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Enable 2FA
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2FA Management Options */}
      {twoFactorStatus.twoFactorEnabled && (
        <div className="space-y-6">
          {/* Backup Codes Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Key className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="font-semibold text-gray-800">Backup Codes</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                twoFactorStatus.remainingBackupCodes > 5 
                  ? 'bg-green-100 text-green-800'
                  : twoFactorStatus.remainingBackupCodes > 2
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {twoFactorStatus.remainingBackupCodes} remaining
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              Backup codes allow you to access your account if you lose your authenticator device.
            </p>
            
            {twoFactorStatus.remainingBackupCodes <= 2 && (
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  You're running low on backup codes. Consider regenerating them.
                </span>
              </div>
            )}
            
            <button
              onClick={() => setShowRegenerateModal(true)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Backup Codes
            </button>
          </div>

          {/* Disable 2FA */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <ShieldX className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="font-semibold text-red-800">Disable Two-Factor Authentication</h3>
            </div>
            <p className="text-sm text-red-600 mb-3">
              Disabling 2FA will make your account less secure. Only disable if absolutely necessary.
            </p>
            <button
              onClick={() => setShowDisableModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Disable 2FA
            </button>
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-800 mb-4">Disable Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your current 2FA code to disable two-factor authentication.
            </p>
            
            <input
              type="text"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-center font-mono mb-4"
              maxLength={6}
            />
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDisableModal(false);
                  setDisableCode('');
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={disable2FA}
                disabled={loading || disableCode.length !== 6}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Backup Codes Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            {newBackupCodes.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Regenerate Backup Codes</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your current 2FA code to generate new backup codes. This will invalidate all existing backup codes.
                </p>
                
                <input
                  type="text"
                  value={regenerateCode}
                  onChange={(e) => setRegenerateCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono mb-4"
                  maxLength={6}
                />
                
                {error && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {error}
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowRegenerateModal(false);
                      setRegenerateCode('');
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={regenerateBackupCodes}
                    disabled={loading || regenerateCode.length !== 6}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-green-800 mb-4">New Backup Codes Generated</h3>
                <div className="bg-gray-50 border rounded p-3 mb-4">
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    {newBackupCodes.map((code, index) => (
                      <div key={index} className="text-center py-1">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Save these new backup codes in a safe place. Your old backup codes are no longer valid.
                </p>
                <button
                  onClick={downloadNewBackupCodes}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download and Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorManagement;
