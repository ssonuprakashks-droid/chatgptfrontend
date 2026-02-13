import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('token_type', data.token_type);
        localStorage.setItem('email', email);
        console.log('Login successful');
        navigate('/dashboard');
      } else {
        setError(data.detail || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Neural connection failed. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-md w-full space-y-8 relative z-10 animate-slide-up">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-linear-to-br from-indigo-600 to-indigo-800 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-8 rotate-12">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2">Welcome Back</h2>
          <p className="text-slate-400 font-medium">Authenticate your neural identity.</p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 md:p-10 border-white/5 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest rounded-2xl animate-fade-in text-center">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Neural ID (Email)</label>
              <div className="glass-input group rounded-2xl px-4 py-3.5 transition-all">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent outline-none w-full text-white text-sm font-bold placeholder-slate-600"
                  placeholder="user@neural-code.io"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Access Protocol</label>
                <a href="#" className="text-[10px] font-black text-brand-accent uppercase tracking-widest hover:brightness-125 transition-all">Recover?</a>
              </div>
              <div className="glass-input group rounded-2xl px-4 py-3.5 transition-all">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent outline-none w-full text-white text-sm font-bold placeholder-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-linear-to-r from-brand-primary to-brand-secondary text-white hover:scale-[1.02]'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : 'Log In'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              New Identity?{' '}
              <Link to="/signup" className="text-brand-accent hover:brightness-125 transition-colors">
                Initialize Core
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
