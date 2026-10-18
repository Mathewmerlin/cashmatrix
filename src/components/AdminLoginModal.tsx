import React, { useState } from 'react';
import { X, ShieldAlert, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState('admin@cashmatrix.io');
  const [password, setPassword] = useState('quantum-matrix-2050');
  const [mfaCode, setMfaCode] = useState('849201');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'quantum-matrix-2050' || password.length >= 6) {
      onSuccess();
      onClose();
    } else {
      setErrorMessage('Invalid operator credentials. Please check password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0B1021] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-[#00F5FF]/10 text-[#00F5FF]">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-sans">Operations Center Authentication</h2>
            <p className="text-xs text-slate-400">Restricted to authorized protocol operators</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-[#FF496C]/10 border border-[#FF496C]/30 text-xs text-[#FF496C]">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Operator Identifier / Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#050816] border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00F5FF]"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-400">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#050816] border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00F5FF]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Hardware MFA / TEE Enclave Passcode
            </label>
            <input
              type="text"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#050816] border border-white/10 rounded-lg text-[#00FF88] font-mono text-center tracking-widest text-sm focus:outline-none focus:border-[#00FF88]"
              placeholder="000000"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#050816] border border-white/5 text-[11px] text-slate-400 space-y-1">
            <span className="text-slate-300 font-medium">Default Audit Credentials:</span>
            <div className="font-mono text-slate-400">
              User: <span className="text-slate-300">admin@cashmatrix.io</span>
            </div>
            <div className="font-mono text-slate-400">
              Pass: <span className="text-slate-300">quantum-matrix-2050</span> (MFA: 849201)
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 text-xs font-semibold text-[#050816] bg-[#00F5FF] rounded-lg hover:bg-[#00F5FF]/90 transition-colors cursor-pointer shadow-sm shadow-[#00F5FF]/20 font-sans"
          >
            Authenticate & Access Operations Center
          </button>
        </form>
      </div>
    </div>
  );
};
