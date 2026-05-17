import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { CheckCircle2, Circle, Flame, Trophy, Target, ListChecks, Sparkles } from 'lucide-react';

const TodayPage = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [tasksRes, statsRes] = await Promise.all([
                api.get('/tasks/today'),
                api.get('/dashboard') // Reusing dashboard endpoint for stats
            ]);
            // Handle wrapped object response
            const tasksData = Array.isArray(tasksRes.data) ? tasksRes.data : tasksRes.data?.tasks || [];
            setTasks(tasksData);
            setStats(statsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleToggle = async (taskId: string, currentStatus: boolean) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, completed: !currentStatus } : t));
        
        try {
            await api.post(`/tasks/${taskId}/toggle`);
            
            // Trigger confetti if all tasks are completed
            const updatedTasks = tasks.map(t => t._id === taskId ? { ...t, completed: !currentStatus } : t);
            const allCompleted = updatedTasks.length > 0 && updatedTasks.every(t => t.completed);
            
            if (allCompleted) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#0D9488', '#F97316', '#5EEAD4']
                });
            }
            
            // Refresh stats in background
            const statsRes = await api.get('/dashboard');
            setStats(statsRes.data);
        } catch (err) {
            console.error(err);
            // Revert on error
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, completed: currentStatus } : t));
        }
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;
    const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-[#134E4A]">Today's Focus</h1>
                <p className="text-sm text-[#134E4A]/60">Stay consistent, build the habit.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-teal-100 shadow-sm flex flex-col gap-1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="p-1.5 bg-teal-50 rounded-lg w-fit text-[#0D9488]">
                        <Flame size={16} />
                    </div>
                    <div className="text-2xl font-bold text-[#134E4A] flex items-baseline gap-1">
                        <span>{stats?.streak?.current || 0}</span>
                        <span className="text-sm font-medium text-[#134E4A]/60">days</span>
                    </div>
                    <p className="text-xs text-[#134E4A]/60 font-medium">Current Streak</p>
                </motion.div>

                <motion.div
                    className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-teal-100 shadow-sm flex flex-col gap-1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="p-1.5 bg-orange-50 rounded-lg w-fit text-[#F97316]">
                        <Trophy size={16} />
                    </div>
                    <div className="text-2xl font-bold text-[#134E4A] flex items-baseline gap-1">
                        <span>{stats?.streak?.longest || 0}</span>
                        <span className="text-sm font-medium text-[#134E4A]/60">days</span>
                    </div>
                    <p className="text-xs text-[#134E4A]/60 font-medium">Best Streak</p>
                </motion.div>

                <motion.div
                    className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-teal-100 shadow-sm flex flex-col gap-1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="p-1.5 bg-teal-50 rounded-lg w-fit text-[#0D9488]">
                        <Target size={16} />
                    </div>
                    <div className="text-2xl font-bold text-[#134E4A] flex items-baseline gap-1">
                        <span>{rate}</span>
                        <span className="text-sm font-medium text-[#134E4A]/60">%</span>
                    </div>
                    <p className="text-xs text-[#134E4A]/60 font-medium">Completion Rate</p>
                </motion.div>

                <motion.div
                    className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-teal-100 shadow-sm flex flex-col gap-1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="p-1.5 bg-teal-50 rounded-lg w-fit text-[#0D9488]">
                        <ListChecks size={16} />
                    </div>
                    <div className="text-2xl font-bold text-[#134E4A] flex items-baseline gap-1">
                        <span>{completedCount}/{totalCount}</span>
                    </div>
                    <p className="text-xs text-[#134E4A]/60 font-medium">Tasks Done</p>
                </motion.div>
            </div>

            {/* Task List */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-teal-100 shadow-sm">
                <h3 className="text-lg font-bold text-[#134E4A] mb-4 flex items-center gap-2">
                    <Sparkles size={16} className="text-[#0D9488]" /> Daily Ritual
                </h3>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-14 bg-white/50 backdrop-blur-md rounded-xl border border-teal-50 animate-pulse" />
                        ))}
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📋</div>
                        <h4 className="text-xl font-bold text-[#134E4A] mb-1">No tasks for today</h4>
                        <p className="text-[#134E4A]/60 text-sm">Add some tasks in the Manage section to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task, i) => (
                            <motion.div
                                key={task._id}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                                    task.completed
                                        ? 'bg-teal-50/50 border-teal-100'
                                        : 'bg-white border-teal-50 hover:border-teal-100 hover:shadow-sm'
                                }`}
                                onClick={() => handleToggle(task._id, task.completed)}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        {task.completed ? (
                                            <div className="text-[#0D9488]">
                                                <CheckCircle2 size={24} fill="#0D9488" stroke="white" strokeWidth={1.5} />
                                            </div>
                                        ) : (
                                            <div className="text-teal-200">
                                                <Circle size={24} strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`font-medium ${task.completed ? 'text-[#134E4A]/50 line-through' : 'text-[#134E4A]'}`}>
                                        {task.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                                        task.category === 'common'
                                            ? 'bg-teal-50 text-[#0D9488]'
                                            : 'bg-orange-50 text-[#F97316]'
                                    }`}>
                                        {task.category === 'common' ? 'Daily' : 'Scheduled'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodayPage;
