import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Signup successful:', data);
                navigate('/login');
            } else {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.detail || 'Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
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
                    <div className="mx-auto h-20 w-20 bg-linear-to-br from-brand-primary to-brand-accent rounded-[2rem] flex items-center justify-center shadow-2xl shadow-brand-primary/20 rotate-12 mb-8">
                        <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight mb-2">Initialize Core</h2>
                    <p className="text-slate-400 font-medium">Create your neural identity to begin.</p>
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
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="bg-transparent outline-none w-full text-white text-sm font-bold placeholder-slate-600"
                                    placeholder="user@neural-code.io"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Access Protocol (Password)</label>
                            <div className="glass-input group rounded-2xl px-4 py-3.5 transition-all">
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
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
                            {isLoading ? 'Processing...' : 'Deploy Identity'}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                            Active Identity?{' '}
                            <Link to="/login" className="text-brand-accent hover:brightness-125 transition-colors">
                                Authenticate
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
