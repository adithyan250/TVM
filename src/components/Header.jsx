import { Bell, Search, User as UserIcon } from 'lucide-react';
import useAuth from '../utils/useAuth';

const Header = ({ title }) => {
    const { user } = useAuth();

    return (
        <header className="flex items-center justify-between p-8 pb-4">
            <div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <p className="text-slate-400 text-sm mt-1">Welcome back, {user?.name || 'User'}</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-full w-64 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm placeholder-slate-500 text-white"
                    />
                </div>

                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
