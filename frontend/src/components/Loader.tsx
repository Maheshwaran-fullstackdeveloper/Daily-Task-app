import { motion } from 'framer-motion';

const Loader = () => {
    return (
        <div className="fixed inset-0 bg-[#F0FDFA]/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-50">
            <motion.div
                className="w-12 h-12 border-4 border-teal-100 border-t-[#0D9488] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
            <p className="text-[#134E4A] font-medium text-sm">Loading your day...</p>
        </div>
    );
};

export default Loader;
