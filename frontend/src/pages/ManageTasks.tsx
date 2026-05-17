import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { format } from 'date-fns';
import {
    Plus, Pencil, Trash2, Repeat, CalendarDays,
    X, Check, AlertCircle, Fingerprint
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TaskModal = ({ task, onClose, onSave }: any) => {
    const [title, setTitle] = useState(task?.title || '');
    const [category, setCategory] = useState(task?.category || 'common');
    const [scheduledDate, setScheduledDate] = useState(task?.scheduledDate || format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!title.trim()) { setError('Title is required'); return; }
        setLoading(true);
        try {
            const payload = { title: title.trim(), category, scheduledDate: category === 'scheduled' ? scheduledDate : undefined };
            let res;
            if (task) {
                res = await api.put(`/tasks/${task._id}`, payload);
            } else {
                res = await api.post('/tasks', payload);
            }
            onSave(res.data, !!task);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Save failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                className="bg-white rounded-3xl p-8 max-w-md w-full border border-teal-100 shadow-xl shadow-teal-600/5"
                initial={{ scale: 0.88, opacity: 0, y: 24 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.88, opacity: 0, y: 24 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#134E4A]">{task ? 'Edit Task' : 'Add New Task'}</h2>
                    <button className="text-[#134E4A]/40 hover:text-[#134E4A] transition-colors" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[#134E4A]/60 uppercase tracking-wide">Task Title</label>
                        <input
                            type="text"
                            placeholder="e.g., Morning workout, Read 30 mins..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-3 bg-white border border-teal-100 rounded-xl focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 transition-all text-[#134E4A] placeholder-[#134E4A]/30"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[#134E4A]/60 uppercase tracking-wide">Category</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border font-medium text-sm transition-all ${
                                    category === 'common'
                                        ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-lg shadow-teal-600/20'
                                        : 'bg-teal-50 text-[#0D9488] border-teal-100 hover:bg-teal-100'
                                }`}
                                onClick={() => setCategory('common')}
                            >
                                <Repeat size={14} />
                                Daily Routine
                            </button>
                            <button
                                type="button"
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border font-medium text-sm transition-all ${
                                    category === 'scheduled'
                                        ? 'bg-[#F97316] text-white border-[#F97316] shadow-lg shadow-orange-600/20'
                                        : 'bg-teal-50 text-[#0D9488] border-teal-100 hover:bg-teal-100'
                                }`}
                                onClick={() => setCategory('scheduled')}
                            >
                                <CalendarDays size={14} />
                                Specific Day
                            </button>
                        </div>
                    </div>

                    {category === 'scheduled' && (
                        <motion.div
                            className="space-y-1"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <label className="text-xs font-bold text-[#134E4A]/60 uppercase tracking-wide">Scheduled Date</label>
                            <input
                                type="date"
                                value={scheduledDate}
                                onChange={e => setScheduledDate(e.target.value)}
                                className="w-full p-3 bg-white border border-teal-100 rounded-xl focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 transition-all text-[#134E4A]"
                            />
                        </motion.div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <motion.button
                        type="submit"
                        className="w-full p-3 bg-[#0D9488] text-white rounded-xl font-bold hover:bg-[#14B8A6] transition-colors shadow-lg shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={loading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? (
                            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <><Check size={18} /> {task ? 'Save Changes' : 'Add Task'}</>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </motion.div>
    );
};

const ManageTasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTask, setEditTask] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [filter, setFilter] = useState('all');


    const fetchTasks = useCallback(async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const handleSave = (task: any, isEdit: boolean) => {
        if (isEdit) {
            setTasks(prev => prev.map(t => t._id === task._id ? task : t));
        } else {
            setTasks(prev => [task, ...prev]);
        }
        setShowModal(false);
        setEditTask(null);
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(prev => prev.filter(t => t._id !== id));
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteId(null);
        }
    };



    const filtered = tasks.filter(t => {
        if (filter === 'common') return t.category === 'common';
        if (filter === 'scheduled') return t.category === 'scheduled';
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#134E4A]">Manage Tasks</h1>
                    <p className="text-sm text-[#134E4A]/60">{tasks.length} active task{tasks.length !== 1 ? 's' : ''}</p>
                </div>
                <motion.button
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-xl hover:bg-[#14B8A6] transition-colors shadow-lg shadow-teal-600/20 font-medium w-full md:w-auto justify-center"
                    onClick={() => { setEditTask(null); setShowModal(true); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus size={18} />
                    Add Task
                </motion.button>
            </div>
            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'common', 'scheduled'].map(f => (
                    <button
                        key={f}
                        className={`px-4 py-2 backdrop-blur-md rounded-xl transition-all font-medium text-sm border ${
                            filter === f
                                ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-sm shadow-teal-600/20'
                                : 'bg-white/70 text-[#134E4A]/70 hover:text-[#0D9488] hover:bg-teal-50 border-transparent'
                        }`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All' : f === 'common' ? '🔁 Daily' : '📅 Scheduled'}
                    </button>
                ))}
            </div>

            {/* Task list */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-white/50 backdrop-blur-md rounded-xl border border-teal-50 animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-12 text-center border border-teal-100">
                    <div className="text-5xl mb-4">{filter === 'scheduled' ? '📅' : '📋'}</div>
                    <h3 className="text-xl font-bold text-[#134E4A] mb-1">No {filter === 'all' ? '' : filter} tasks yet</h3>
                    <p className="text-[#134E4A]/60">Click "+ Add Task" to create one</p>
                </div>
            ) : (
                <AnimatePresence mode="popLayout">
                    <div className="space-y-3">
                        {filtered.map((task, i) => (
                            <motion.div
                                key={task._id}
                                layout
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -30, scale: 0.95 }}
                                transition={{ delay: i * 0.04, duration: 0.3 }}
                                className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-md rounded-xl border border-teal-50 hover:border-teal-100 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${task.category === 'common' ? 'bg-[#0D9488]' : 'bg-[#F97316]'}`} />
                                    <div className="flex flex-col">
                                        <p className="font-medium text-[#134E4A]">{task.title}</p>
                                        <div className="flex gap-2 mt-1">
                                            {task.category === 'common' ? (
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-teal-50 text-[#0D9488] rounded-full font-medium">
                                                    <Repeat size={10} /> Daily
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-orange-50 text-[#F97316] rounded-full font-medium">
                                                    <CalendarDays size={10} /> {format(new Date(task.scheduledDate + 'T00:00:00'), 'EEE, MMM d, yyyy')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        className="p-2 text-[#134E4A]/40 hover:text-[#0D9488] hover:bg-teal-50 rounded-lg transition-colors"
                                        onClick={() => { setEditTask(task); setShowModal(true); }}
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        className="p-2 text-[#134E4A]/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        onClick={() => setDeleteId(task._id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>
            )}

            {/* Task add/edit modal */}
            <AnimatePresence>
                {showModal && (
                    <TaskModal
                        task={editTask}
                        onClose={() => { setShowModal(false); setEditTask(null); }}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>

            {/* Delete confirm modal */}
            <AnimatePresence>
                {deleteId && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setDeleteId(null)}
                    >
                        <motion.div
                            className="bg-white rounded-3xl p-8 max-sm w-full border border-teal-100 shadow-xl"
                            initial={{ scale: 0.88, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.88, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-[#134E4A] mb-1">Delete Task?</h3>
                            <p className="text-sm text-[#134E4A]/60 mb-6">This task will be removed from all future days.</p>
                            <div className="flex gap-3">
                                <button 
                                    className="flex-1 p-3 bg-teal-50 text-[#134E4A] rounded-xl font-medium hover:bg-teal-100 transition-colors" 
                                    onClick={() => setDeleteId(null)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="flex-1 p-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-600/20" 
                                    onClick={() => handleDelete(deleteId!)}
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageTasks;
