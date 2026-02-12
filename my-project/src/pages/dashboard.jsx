import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const email = localStorage.getItem('email') || 'User';
    const [stats, setStats] = React.useState([
        {
            name: 'Total Prompts', value: '0', icon: (
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            ),
            color: "from-indigo-600 to-indigo-800"
        },
        {
            name: 'Credits used', value: '0', icon: (
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            color: "from-cyan-500 to-cyan-700"
        },
        {
            name: 'Plan', value: 'Free', icon: (
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            ),
            color: "from-brand-primary to-brand-secondary"
        },
    ]);
    const [recentActivity, setRecentActivity] = React.useState([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [paymentSuccess, setPaymentSuccess] = React.useState(false);
    const [paymentMethod, setPaymentMethod] = React.useState('card'); // 'card', 'phonepe', 'gpay'
    const [billingView, setBillingView] = React.useState('summary'); // 'summary', 'methods', 'invoices'

    const [userPlan, setUserPlan] = React.useState('Free');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userEmail = localStorage.getItem('email');
        if (!token || !userEmail) {
            navigate('/login');
            return;
        }

        const emailKey = userEmail.toLowerCase().replace(/[@.]/g, '_');
        const activity = JSON.parse(localStorage.getItem(`recent_activity_${emailKey}`) || '[]');
        const activityCount = activity.length.toString();
        const messagesSent = localStorage.getItem(`total_messages_sent_${emailKey}`) || '0';
        const plan = localStorage.getItem(`user_plan_${emailKey}`) || 'Free';

        localStorage.setItem(`total_conversations_${emailKey}`, activityCount);

        setStats(prev => prev.map(item => {
            if (item.name === 'Total Prompts') return { ...item, value: activityCount };
            if (item.name === 'Credits used') return { ...item, value: messagesSent };
            if (item.name === 'Plan') return { ...item, value: plan };
            return item;
        }));
        setUserPlan(plan);
        setRecentActivity(activity);
    }, [navigate, paymentSuccess]);

    const handleSignout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('email');
        window.location.href = '/login';
    };

    const handlePayment = (e) => {
        e.preventDefault();
        setIsProcessing(true);

        const userEmail = localStorage.getItem('email');
        const emailKey = userEmail ? userEmail.toLowerCase().replace(/[@.]/g, '_') : 'default';

        // Simulate payment server delay
        setTimeout(() => {
            localStorage.setItem(`user_plan_${emailKey}`, 'Pro');
            setIsProcessing(false);
            setPaymentSuccess(true);

            // Clean up and close modal after success message
            setTimeout(() => {
                setIsCheckoutOpen(false);
                setPaymentSuccess(false);
                window.location.reload();
            }, 2000);
        }, 2500);
    };

    return (
        <div className="min-h-screen page-transition relative">
            {/* Checkout Modal Overlay */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card w-full max-w-md rounded-[2.5rem] p-8 relative animate-slide-up border border-white/10 shadow-[0_35px_60px_-15px_rgba(99,102,241,0.3)]">
                        <button
                            onClick={() => !isProcessing && setIsCheckoutOpen(false)}
                            className="absolute top-6 right-6 text-slate-500 hover:text-white transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {paymentSuccess ? (
                            <div className="text-center py-8 animate-fade-in">
                                <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-green-500/30">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Payment Secured!</h3>
                                <p className="text-slate-400">Welcome to Premium Core. Your neural limits are now removed.</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-8">
                                    <h3 className="text-2xl font-black text-white mb-1">PRO Checkout</h3>
                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Premium Core - Monthly</p>
                                </div>

                                <div className="mb-6 flex p-1 bg-white/5 rounded-2xl border border-white/5">
                                    {['card', 'phonepe', 'gpay'].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => !isProcessing && setPaymentMethod(method)}
                                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${paymentMethod === method
                                                ? 'bg-brand-primary text-white shadow-lg'
                                                : 'text-slate-500 hover:text-slate-300'
                                                }`}
                                        >
                                            {method === 'card' ? '💳 CARD' : method === 'phonepe' ? '🟣 PHONEPE' : '🔵 GPAY'}
                                        </button>
                                    ))}
                                </div>

                                <form onSubmit={handlePayment} className="space-y-6">
                                    {paymentMethod === 'card' ? (
                                        <div className="space-y-4 animate-fade-in">
                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Card Information</label>
                                                <div className="glass-input transition-all rounded-2xl px-4 py-3.5 text-white flex items-center gap-3">
                                                    <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" /></svg>
                                                    <input required type="text" placeholder="CARD NUMBER" className="bg-transparent outline-none w-full text-sm font-bold tracking-[0.2em]" defaultValue="**** **** **** 8829" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="glass-input rounded-2xl px-4 py-3.5">
                                                    <input required type="text" placeholder="MM/YY" className="bg-transparent outline-none w-full text-sm font-bold tracking-widest text-white" defaultValue="12/28" />
                                                </div>
                                                <div className="glass-input rounded-2xl px-4 py-3.5">
                                                    <input required type="password" placeholder="CVV" className="bg-transparent outline-none w-full text-sm font-bold tracking-widest text-white" defaultValue="123" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center py-4 space-y-4 animate-fade-in">
                                            <div className="w-40 h-40 bg-white p-4 rounded-3xl relative group cursor-pointer hover:scale-105 transition-transform">
                                                <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                                                    <span className="text-[10px] font-black text-slate-950 tracking-[0.2em]">REFRESH QR</span>
                                                </div>
                                                <svg className={`w-full h-full ${paymentMethod === 'phonepe' ? 'text-purple-600' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M3 3h8v8H3zm2 2h4v4H5zm11-2h5v5h-5zm0 11h5v5h-5zM3 13h8v8H3zm2 2h4v4H5zm11 1h2v2h-2zm3 3h2v2h-2zm-3 0h2v2h-2zm3-3h2v2h-2zm-8-1h2v2h-2zm3 3h2v2h-2z" />
                                                </svg>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] text-center">
                                                SCAN WITH {paymentMethod.toUpperCase()} APP TO PAY
                                            </p>
                                        </div>
                                    )}

                                    <div className="p-4 bg-brand-primary/10 rounded-2xl flex items-center justify-between border border-brand-primary/20">
                                        <span className="text-sm font-bold text-slate-300">Total Today</span>
                                        <span className="text-xl font-black text-white">$9.99</span>
                                    </div>

                                    <button
                                        disabled={isProcessing}
                                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl relative overflow-hidden group ${isProcessing ? 'bg-slate-800 text-slate-500' : 'bg-linear-to-r from-brand-primary to-brand-secondary text-white hover:scale-[1.02] active:scale-95'
                                            }`}
                                    >
                                        {isProcessing ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                                                {paymentMethod === 'card' ? 'SECURELY PROCESSING...' : 'AWAITING MOBILE CONFIRMATION...'}
                                            </div>
                                        ) : (
                                            paymentMethod === 'card' ? "COMPLETE PURCHASE" : `PAY WITH ${paymentMethod.toUpperCase()}`
                                        )}
                                    </button>
                                </form>

                                <p className="text-[10px] text-center text-slate-600 mt-6 font-bold uppercase tracking-widest leading-relaxed">
                                    By purchasing, you agree to our Neural Terms. <br /> Secure 256-bit SSL Encrypted.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between mb-12 animate-slide-up">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-4xl font-extrabold leading-7 sm:text-5xl sm:truncate">
                            Greetings, <span className="gradient-text">{email.includes('@') ? email.split('@')[0] : email}</span>!
                        </h2>
                        <p className="mt-3 text-lg text-slate-400">
                            Explore your AI journey and manage your account performance.
                        </p>
                    </div>
                    <div className="mt-6 flex md:mt-0 md:ml-4 space-x-4">
                        <button
                            type="button"
                            onClick={handleSignout}
                            className="inline-flex items-center px-6 py-3 border border-white/10 rounded-2xl shadow-sm text-sm font-semibold text-slate-300 glass-card hover:bg-white/10 focus:outline-none transition active:scale-95"
                        >
                            Log out
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="inline-flex items-center px-6 py-3 border border-transparent rounded-2xl shadow-xl text-sm font-bold text-white bg-linear-to-r from-brand-primary to-brand-secondary hover:scale-105 focus:outline-none transition shadow-brand-primary/25 active:scale-95"
                        >
                            Launch Chat
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
                    {stats.map((item, idx) => (
                        <div key={item.name}
                            className={`animate-slide-up bg-linear-to-br ${item.color} overflow-hidden shadow-2xl rounded-3xl p-8 hover:scale-[1.02] transition-transform duration-300 relative group`}
                            style={{ animationDelay: `${idx * 0.1}s` }}>
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                {React.cloneElement(item.icon, { className: "w-32 h-32" })}
                            </div>
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="p-3 bg-white/20 rounded-xl w-fit mb-6">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-1">{item.name}</p>
                                    <p className="text-4xl font-extrabold text-white">{item.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Subscription Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    {/* Plan Details Card */}
                    <div className="glass-card rounded-[2.5rem] p-8 flex flex-col justify-between border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                            <svg className="w-40 h-40 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>

                        <div className="relative z-10">
                            <span className="px-4 py-1.5 bg-brand-primary/20 text-brand-primary text-xs font-black uppercase tracking-widest rounded-full mb-6 inline-block">
                                {userPlan === 'Pro' ? 'Premium Core' : 'Base Access'}
                            </span>
                            <h3 className="text-3xl font-bold text-white mb-4">
                                {userPlan === 'Pro' ? 'Pro Monthly Pack' : 'Free Discovery'}
                            </h3>
                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-black text-white">{userPlan === 'Pro' ? '$9.99' : '$0'}</span>
                                <span className="text-slate-500 font-bold ml-2">/ month</span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {[
                                    { text: "Unlimited Neural Prompts", pro: true },
                                    { text: "Advanced AI Visuals", pro: true },
                                    { text: "24/7 Priority Support", pro: true },
                                    { text: "Basic Chat Functionality", pro: false }
                                ].map((feature, i) => (
                                    <li key={i} className={`flex items-center space-x-3 ${!feature.pro && userPlan !== 'Pro' ? 'text-slate-300' : feature.pro && userPlan !== 'Pro' ? 'text-slate-600' : 'text-slate-300'}`}>
                                        <svg className={`h-5 w-5 ${feature.pro && userPlan !== 'Pro' ? 'text-slate-700' : 'text-brand-accent'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="font-medium">{feature.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {userPlan !== 'Pro' ? (
                            <button
                                onClick={() => setIsCheckoutOpen(true)}
                                className="w-full bg-white text-slate-950 font-bold py-4 px-6 rounded-2xl hover:bg-brand-accent hover:text-white transition-all shadow-xl active:scale-95"
                            >
                                Upgrade to Pro $9.99/mo
                            </button>
                        ) : (
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Next Billing: March 12, 2026</span>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats / Billing Summary */}
                    <div className="glass-card rounded-[2.5rem] p-8 border-white/5 flex flex-col justify-center relative overflow-hidden group">
                        {billingView === 'summary' ? (
                            <div className="text-center animate-fade-in">
                                <div className="w-24 h-24 bg-linear-to-tr from-brand-primary to-brand-accent rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-brand-primary/20 mb-6 group-hover:scale-110 transition-transform">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h4 className="text-2xl font-bold text-white mb-2">Secure Billing</h4>
                                <p className="text-slate-400 mb-8">All transactions are encrypted and processed through our neural payment gateway.</p>
                                <div className="flex flex-col space-y-3">
                                    <button
                                        onClick={() => setBillingView('methods')}
                                        className="text-slate-500 font-bold hover:text-brand-accent transition-colors uppercase tracking-widest text-xs"
                                    >
                                        Payment Methods
                                    </button>
                                    <button
                                        onClick={() => setBillingView('invoices')}
                                        className="text-slate-500 font-bold hover:text-brand-accent transition-colors uppercase tracking-widest text-xs"
                                    >
                                        Invoices History
                                    </button>
                                </div>
                            </div>
                        ) : billingView === 'methods' ? (
                            <div className="animate-fade-in w-full">
                                <button onClick={() => setBillingView('summary')} className="mb-4 text-slate-500 hover:text-white transition flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                                    Back
                                </button>
                                <h4 className="text-xl font-bold text-white mb-6">Payment Methods</h4>
                                <div className="space-y-4">
                                    {/* Credit Card */}
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-brand-primary/20 rounded-lg flex items-center justify-center text-brand-primary">
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">Visa ending in 8829</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Expires 12/28</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'card' ? (
                                            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full">Linked</span>
                                        ) : (
                                            <button onClick={() => setPaymentMethod('card')} className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Link</button>
                                        )}
                                    </div>

                                    {/* PhonePe */}
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-500">
                                                <span className="font-black text-xs">Ph</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">PhonePe UPI</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">sonu@ybl</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'phonepe' ? (
                                            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full">Linked</span>
                                        ) : (
                                            <button onClick={() => setPaymentMethod('phonepe')} className="text-[10px] font-black text-purple-500 uppercase tracking-widest hover:underline">Link</button>
                                        )}
                                    </div>

                                    {/* Google Pay */}
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500">
                                                <span className="font-black text-xs">G</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">Google Pay</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Linked Account</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'gpay' ? (
                                            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full">Linked</span>
                                        ) : (
                                            <button onClick={() => setPaymentMethod('gpay')} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">Link</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fade-in w-full">
                                <button onClick={() => setBillingView('summary')} className="mb-4 text-slate-500 hover:text-white transition flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                                    Back
                                </button>
                                <h4 className="text-xl font-bold text-white mb-6">Invoice History</h4>
                                <div className="space-y-3">
                                    {[
                                        { date: 'Feb 12, 2026', id: '#INV-8821', status: 'Paid' },
                                        { date: 'Jan 12, 2026', id: '#INV-7712', status: 'Paid' }
                                    ].map((inv) => (
                                        <div key={inv.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition cursor-pointer">
                                            <div>
                                                <p className="text-xs font-bold text-white">{inv.date}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{inv.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-white">$9.99</p>
                                                <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest">{inv.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="glass-card rounded-[2.5rem] overflow-hidden animate-slide-up shadow-2xl border-white/5" style={{ animationDelay: '0.3s' }}>
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">Neural History</h3>
                        <button className="text-sm font-bold gradient-text hover:brightness-125 transition">Discover patterns</button>
                    </div>
                    <div className="p-8">
                        <div className="space-y-4">
                            {recentActivity.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-white/5 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500 font-medium">Your activity is ready to be written.</p>
                                </div>
                            ) : (
                                recentActivity.map((item, idx) => (
                                    <div key={item.id}
                                        className="flex items-center justify-between hover:bg-white/5 p-4 rounded-2xl transition cursor-pointer group border border-transparent hover:border-white/5"
                                        style={{ animationDelay: `${idx * 0.05}s` }}>
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 bg-linear-to-br from-brand-primary/20 to-brand-accent/20 rounded-xl flex items-center justify-center text-brand-primary font-bold group-hover:scale-110 transition-transform">
                                                {item.title.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="ml-5">
                                                <p className="text-[17px] font-semibold text-slate-100 group-hover:text-brand-accent transition-colors">{item.title}</p>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter mt-1 tracking-widest">{item.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-slate-600 group-hover:text-brand-primary transition-colors">
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
