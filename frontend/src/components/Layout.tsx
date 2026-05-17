import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CheckSquare, ListTodo, LogOut, Flame, Settings } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/today',     label: 'Today',     icon: CheckSquare },
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/manage',    label: 'Manage',    icon: ListTodo },
        { path: '/settings',  label: 'Settings',  icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#F0FDFA] flex">
            {/* Sidebar (Desktop) */}
            <div className="hidden md:flex w-64 bg-white/70 backdrop-blur-md border-r border-teal-100 flex-col justify-between p-6 fixed h-screen z-20">
                <div className="space-y-8">
                    {/* Logo */}
                    <div className="flex items-center gap-2 text-[#0D9488] font-bold text-xl">
                        <div className="p-1.5 bg-[#0D9488] text-white rounded-lg shadow-lg shadow-teal-600/20">
                            <CheckSquare size={20} strokeWidth={2.5} />
                        </div>
                        <span>DailyFlow</span>
                    </div>

                    {/* Nav Links */}
                    <nav className="space-y-2">
                        {navItems.map(item => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-all
                                    ${isActive 
                                        ? 'bg-[#0D9488] text-white shadow-lg shadow-teal-600/20' 
                                        : 'text-[#134E4A]/60 hover:text-[#0D9488] hover:bg-teal-50/50'
                                    }
                                `}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* User & Logout */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-teal-50/50 rounded-xl border border-teal-50">
                        <div className="w-8 h-8 bg-[#0D9488] text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#134E4A]">{user?.username || 'User'}</span>
                            <span className="text-xs text-[#134E4A]/60 font-medium">Daily Builder</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-xl font-medium text-sm text-[#134E4A]/60 hover:text-red-500 hover:bg-red-50/50 transition-all"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Bottom Nav (Mobile) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-teal-100 z-20 px-4 py-2 flex justify-around items-center">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex flex-col items-center gap-1 p-2 rounded-xl font-medium text-xs transition-all
                            ${isActive 
                                ? 'text-[#0D9488]' 
                                : 'text-[#134E4A]/60 hover:text-[#0D9488]'
                            }
                        `}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl font-medium text-xs text-[#134E4A]/60 hover:text-red-500"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-0 md:ml-64 p-4 md:p-8 min-h-screen pb-20 md:pb-8">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
