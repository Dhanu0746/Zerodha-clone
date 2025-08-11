import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Key, Copy, CheckCircle, AlertCircle, Smartphone, Download } from 'lucide-react';

const TwoFactorSetup = ({ onSetupComplete, onCancel }) => {
  const [step, setStep] = useState(1); // 1: Setup, 2: Verify, 3: Backup Codes
  const [qrCode, setQrCode] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Start 2FA setup
  const initiate2FASetup = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/2fa/setup', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setQrCode(response.data.qrCode);
      setManualKey(response.data.manualEntryKey);
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  // Verify 2FA setup
  const verify2FASetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/2fa/verify-setup', {
        token: verificationCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBackupCodes(response.data.backupCodes);
      setStep(3);
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  // Copy manual key to clipboard
  const copyManualKey = async () => {
    try {
      await navigator.clipboard.writeText(manualKey.replace(/\s/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Download backup codes
  const downloadBackupCodes = () => {
    const content = `Zerodha Clone - 2FA Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\nBackup Codes (use each code only once):\n${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}\n\nKeep these codes safe and secure!`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zerodha-clone-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Complete setup
  const completeSetup = () => {
    onSetupComplete();
  };

  useEffect(() => {
    if (step === 1) {
      initiate2FASetup();
    }
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 text-blue-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-800">Enable Two-Factor Authentication</h2>
        <p className="text-gray-600 mt-2">Add an extra layer of security to your account</p>
      </div>

      {/* Step 1: Initial Setup */}
      {step === 1 && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Setting up 2FA...</p>
        </div>
      )}

      {/* Step 2: QR Code and Verification */}
      {step === 2 && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              Scan QR Code
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center mb-4">
              {qrCode && (
                <img src={qrCode} alt="2FA QR Code" className="mx-auto mb-4" />
              )}
              <p className="text-sm text-gray-600 mb-2">
                Scan this QR code with your authenticator app
              </p>
              <p className="text-xs text-gray-500">
                Google Authenticator, Authy, or similar apps
              </p>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Key className="w-4 h-4 mr-2" />
                Manual Entry Key
              </h4>
              <div className="flex items-center bg-gray-50 p-3 rounded border">
                <code className="flex-1 text-sm font-mono break-all">{manualKey}</code>
                <button
                  onClick={copyManualKey}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter this key manually if you can't scan the QR code
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit verification code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
              maxLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the code from your authenticator app
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={verify2FASetup}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Backup Codes */}
      {step === 3 && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              2FA Enabled Successfully!
            </h3>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-yellow-800 mb-2">Save Your Backup Codes</h4>
              <p className="text-sm text-yellow-700 mb-3">
                These codes can be used to access your account if you lose your authenticator device. 
                Each code can only be used once.
              </p>
              
              <div className="bg-white border rounded p-3 mb-3">
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="text-center py-1">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={downloadBackupCodes}
                className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Backup Codes
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Important Security Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Store backup codes in a safe place</li>
                <li>• Don't share your codes with anyone</li>
                <li>• You can regenerate codes anytime in settings</li>
                <li>• Use a secure authenticator app</li>
              </ul>
            </div>
          </div>

          <button
            onClick={completeSetup}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Complete Setup
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;
