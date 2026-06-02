import React, { useState } from 'react';
import { ArrowRight, Clock, Fingerprint, ShieldCheck, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../config/api';
import type { Session } from '../types/auth';

export const LoginView = ({ onLogin }: { onLogin: (session: Session) => void }) => {
  const [correo, setCorreo] = useState('admin@workforcepro.com');
  const [password, setPassword] = useState('admin1234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo iniciar sesion');
      }

      onLogin({ token: data.token, user: data.user });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
    <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-fixed-dim/20 blur-3xl" />
    <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-tertiary-fixed-dim/20 blur-3xl" />
    
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="z-10 w-full max-w-[420px]"
    >
      <div className="mb-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-sm">
          <ShieldCheck className="text-on-primary" size={32} />
        </div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">Workforce Pro</h1>
        <p className="mt-2 font-medium text-on-surface-variant">Enterprise Attendance Management</p>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-[0px_12px_32px_rgba(26,28,28,0.04)] ring-1 ring-outline-variant/10">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="ml-1 block font-sans text-sm font-semibold text-on-surface">Email</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
              <input 
                type="email" 
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                placeholder="admin@workforcepro.com"
                className="h-14 w-full rounded-xl border-none bg-surface-container-low pl-12 pr-4 text-on-surface transition-all focus:bg-surface-bright focus:ring-2 focus:ring-primary-fixed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="block font-sans text-sm font-semibold text-on-surface">Password</label>
              <button className="text-xs font-bold text-primary hover:underline">Forgot Password?</button>
            </div>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="h-14 w-full rounded-xl border-none bg-surface-container-low pl-12 pr-4 text-on-surface transition-all focus:bg-surface-bright focus:ring-2 focus:ring-primary-fixed"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="signature-gradient flex h-[56px] w-full items-center justify-center gap-2 rounded-xl font-headline text-lg font-bold text-on-primary shadow-lg transition-transform active:scale-[0.98]"
          >
            {isLoading ? 'Signing in...' : 'Login'} <ArrowRight size={20} />
          </button>

          <button 
            type="submit"
            disabled={isLoading}
            className="flex h-[56px] w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/30 font-headline text-lg font-bold text-primary transition-transform active:scale-[0.98]"
          >
            Login as Manager
          </button>

          <div className="mt-8 border-t border-outline-variant/10 pt-8">
            <button className="flex w-full items-center justify-center gap-3 rounded-full bg-surface-container-high py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest">
              <Fingerprint size={20} /> Biometric Sign-in
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  </div>
  );
};
