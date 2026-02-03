import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../utils/useAuth';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password);
        if (!res.success) {
            setError(res.message);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="backdrop-blur-xl bg-slate-800/70 p-8 rounded-2xl shadow-2xl border border-white/10">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-slate-400">Sign in to manage your inventory</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-12 w-full bg-slate-900/50 border border-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-600 rounded-xl py-3 transition-all"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-12 w-full bg-slate-900/50 border border-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-600 rounded-xl py-3 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full cursor-pointer bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
                        >
                            Sign In
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
