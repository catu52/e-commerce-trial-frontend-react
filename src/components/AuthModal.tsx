import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { splitName } from '../services/auth';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess?: () => void;
}

const inputCls =
  'w-full bg-paper-2 border-2 border-ink px-3 py-2 font-mono text-sm focus:outline-none focus:bg-[#ffcc00]/20';

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode = 'login', onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      if (mode === 'login') await login(email, password);
      else await register({ ...splitName(name), email, password, password_confirmation: confirm });
      onSuccess?.();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.errors);
        setError(Object.keys(err.errors).length ? null : err.message);
      } else {
        setError('Unexpected error.');
      }
    } finally {
      setBusy(false);
    }
  };

  const fieldError = (...keys: string[]) => {
    const key = keys.find((k) => fieldErrors[k]?.length);
    return key ? (
      <p className="font-mono text-[10px] text-[#e63b2e] mt-1">{fieldErrors[key][0]}</p>
    ) : null;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 p-4 bg-black/70">
      <form
        onSubmit={submit}
        className="bg-paper border-4 border-ink shadow-[10px_10px_0px_var(--color-ink)] max-w-md w-full p-6 space-y-4"
      >
        <div className="flex justify-between items-center border-b-2 border-ink pb-3">
          <span className="font-mono text-xs font-bold text-[#888888] uppercase">
            {mode === 'login' ? 'ARCHIVIST ACCESS' : 'REGISTER NEW ARCHIVIST'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 border-2 border-ink bg-paper-2 hover:bg-[#e63b2e] hover:text-[#f5f0eb] font-mono font-bold"
          >
            ✕
          </button>
        </div>

        {mode === 'register' && (
          <div>
            <input
              className={inputCls}
              placeholder="FULL NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {fieldError('first_name', 'last_name')}
          </div>
        )}
        <div>
          <input
            type="email"
            className={inputCls}
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {fieldError('email')}
        </div>
        <div>
          <input
            type="password"
            className={inputCls}
            placeholder="PASSWORD (MIN 8)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {fieldError('password')}
        </div>
        {mode === 'register' && (
          <input
            type="password"
            className={inputCls}
            placeholder="CONFIRM PASSWORD"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        )}

        {error && <p className="font-mono text-xs text-[#e63b2e] font-bold">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-[#e63b2e] hover:bg-panel text-[#f5f0eb] py-3 font-headline font-black text-sm uppercase tracking-wider border-2 border-ink shadow-[4px_4px_0px_var(--color-ink)] disabled:opacity-50"
        >
          {busy ? 'TRANSMITTING...' : mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError(null);
            setFieldErrors({});
          }}
          className="w-full text-[#0055ff] hover:underline font-mono text-[11px] uppercase font-bold"
        >
          {mode === 'login' ? 'NO ACCOUNT? REGISTER' : 'ALREADY REGISTERED? LOG IN'}
        </button>
      </form>
    </div>
  );
};
