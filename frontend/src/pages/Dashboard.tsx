import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import api from '../api/axios';
import { Flame, Trophy, CheckCircle2, Target, TrendingUp, Calendar, ListChecks } from 'lucide-react';

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' }
    })
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-3 border border-teal-100 rounded-lg shadow-lg text-sm">
                <p className="font-bold text-[#134E4A] mb-1">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} style={{ color: p.color }} className="font-medium">
                        {p.name}: <strong>{p.value}{p.name === 'rate' ? '%' : ''}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const HeatmapCell = ({ day }: { day: any }) => {
    const ratio = day.totalCount > 0 ? day.completedCount / day.totalCount : 0;
    const getColor = () => {
        if (day.totalCount === 0) return '#F0FDFA'; // Empty/Zero tasks
        if (ratio === 1)    return '#0D9488'; // Perfect day
        if (ratio >= 0.7)  return '#14B8A6'; // High
        if (ratio >= 0.4)  return '#5EEAD4'; // Medium
        if (ratio > 0)     return '#CCFBF1'; // Low
        return '#F0FDFA';
    };
    return (
        <div
            className="w-4 h-4 rounded-sm cursor-pointer transition-all hover:scale-125"
            title={`${day.date}: ${day.completedCount}/${day.totalCount}`}
            style={{
                background: getColor(),
                outline: day.isPerfectDay ? '2px solid #0D9488' : 'none',
                outlineOffset: '1px'
            }}
        />
    );
};

const Dashboard = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard')
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statsCards = data ? [
        { label: 'Current Streak',       value: data.streak.current,      unit: 'days', icon: Flame,       color: '#F97316' },
        { label: 'Longest Streak',        value: data.streak.longest,      unit: 'days', icon: TrendingUp,  color: '#0D9488' },
        { label: 'Perfect Days',          value: data.totalPerfectDays,    unit: 'days', icon: Trophy,      color: '#F97316' },
        { label: "Today's Rate",          value: data.completionRate,      unit: '%',    icon: Target,      color: '#0D9488' },
        { label: 'Completed (30d)',        value: data.totalTasksCompleted, unit: '',     icon: CheckCircle2,color: '#14B8A6' },
        { label: 'Active Tasks',          value: data.totalTasksCount,     unit: '',     icon: ListChecks,  color: '#0D9488' },
    ] : [];

    const axisStyle = { fill: '#134E4A', opacity: 0.6, fontSize: 12 };
    const gridStyle = '#E2E8F0';

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-[#134E4A]">Dashboard</h1>
                <p className="text-sm text-[#134E4A]/60">Your 30-day productivity overview</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-28 bg-white/50 backdrop-blur-md rounded-xl border border-teal-50 animate-pulse" />
                    ))}
                </div>
            ) : !data ? (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-100">Failed to load dashboard data.</div>
            ) : (
                <>
                    {/* Stat cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {statsCards.map((card, i) => (
                            <motion.div
                                key={card.label}
                                className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-teal-100 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow"
                                custom={i}
                                initial="hidden"
                                animate="visible"
                                variants={cardVariants}
                            >
                                <div className="p-2 bg-teal-50 rounded-lg w-fit">
                                    <card.icon size={18} style={{ color: card.color }} />
                                </div>
                                <div className="text-2xl font-bold text-[#134E4A] flex items-baseline gap-1">
                                    <span>{card.value}</span>
                                    <span className="text-sm font-medium text-[#134E4A]/60">{card.unit}</span>
                                </div>
                                <p className="text-xs text-[#134E4A]/60 font-medium">{card.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div
                            className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-teal-100 shadow-sm"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h3 className="text-lg font-bold text-[#134E4A] mb-4 flex items-center gap-2">
                                <TrendingUp size={16} className="text-[#0D9488]" /> Weekly Completion %
                            </h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={data.weeklyData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridStyle} vertical={false} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axisStyle} />
                                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={axisStyle} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F0FDFA' }} />
                                    <Bar dataKey="rate" name="rate" fill="#0D9488" radius={[4, 4, 0, 0]} maxBarSize={36} />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>

                        <motion.div
                            className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-teal-100 shadow-sm"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3 className="text-lg font-bold text-[#134E4A] mb-4 flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-[#0D9488]" /> Tasks Completed (7d)
                            </h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={data.weeklyData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%"   stopColor="#0D9488" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="#0D9488" stopOpacity={0}    />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridStyle} vertical={false} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axisStyle} />
                                    <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="completed"
                                        name="completed"
                                        stroke="#0D9488"
                                        strokeWidth={2}
                                        fill="url(#areaFill)"
                                        dot={{ r: 4, fill: '#0D9488', strokeWidth: 0 }}
                                        activeDot={{ r: 6, fill: '#0D9488' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* Heatmap */}
                    <motion.div
                        className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-teal-100 shadow-sm"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h3 className="text-lg font-bold text-[#134E4A] mb-4 flex items-center gap-2">
                            <Calendar size={16} className="text-[#0D9488]" /> 30-Day Activity
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {data.heatmap.map((day: any) => <HeatmapCell key={day.date} day={day} />)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#134E4A]/60 font-medium">
                            <span>Less</span>
                            <div className="flex gap-1">
                                {['#F0FDFA', '#CCFBF1', '#5EEAD4', '#14B8A6', '#0D9488'].map((c, i) => (
                                    <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
                                ))}
                            </div>
                            <span>More</span>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
