import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Users, ShoppingCart, Settings, LogOut, FileText } from 'lucide-react';
import useAuth from '../utils/useAuth';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth(); // We'll create this hook helper

    const isActive = (path) => {
        return location.pathname === path ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5';
    };

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/inventory', icon: Package, label: 'Inventory' },
        { path: '/sales', icon: ShoppingCart, label: 'Sales' },
        { path: '/sales-history', icon: FileText, label: 'History' },
    ];

    return (
        <div className="h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-10 transition-all duration-300">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    T V M Auto Spare
                </h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.path)}`}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
