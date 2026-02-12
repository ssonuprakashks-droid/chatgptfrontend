import { Link, useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('access_token');

    const handleSignout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('email');
        window.location.href = '/login';
    };

    return (
        <header className="fixed top-0 inset-x-0 z-50 glass-card !border-none !shadow-none bg-slate-950/20 backdrop-blur-3xl">
            <nav className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center space-x-12">
                        <Link to="/" className="text-2xl font-black gradient-text tracking-tighter hover:scale-105 transition-transform">
                            NEURAL<span className="text-white">AI</span>
                        </Link>
                        <div className="hidden md:flex space-x-8 text-sm font-bold uppercase tracking-widest text-slate-400">
                            <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
                            <Link to="/about" className="hover:text-brand-primary transition-colors">Vision</Link>
                            <Link to="/contact" className="hover:text-brand-primary transition-colors">Connect</Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        {isLoggedIn ? (
                            <>
                                <Link to="/dashboard" className="text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors">
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleSignout}
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 shadow-lg"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors">
                                    Sign in
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-linear-to-r from-brand-primary to-brand-secondary hover:scale-105 transition-all shadow-xl shadow-brand-primary/20 active:scale-95"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;