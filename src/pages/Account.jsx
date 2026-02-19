import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useAuth from '../utils/useAuth';
import { User, Lock, Save, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Account = () => {
    const { user, updateProfile } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const result = await updateProfile({
            _id: user._id,
            name,
            email,
            password,
            token: user.token
        });

        if (result.success) {
            setMessage('Profile Updated Successfully');
            setPassword('');
            setConfirmPassword('');
        } else {
            setError(result.message);
        }
    };

    return (
        <Layout title="Account Settings">
            <div className="max-w-2xl mx-auto">
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-xl">
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-700">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{user?.name}</h3>
                            <p className="text-slate-400">{user?.role === 'admin' ? 'Administrator' : 'Staff Member'}</p>
                        </div>
                    </div>

                    {message && (
                        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2">
                            <CheckCircle size={20} />
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Enter full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="email"
                                        placeholder="Enter email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-700">
                            <h4 className="text-lg font-semibold text-white mb-4">Change Password</h4>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20"
                            >
                                <Save size={20} />
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Account;
