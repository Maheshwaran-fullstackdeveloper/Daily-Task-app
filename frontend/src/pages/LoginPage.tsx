import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Fingerprint, AlertCircle, CheckSquare } from 'lucide-react';

const LoginPage = () => {
    const { loginWithFingerprint } = useAuth();
    const [error, setError] = useState('');
    const [fpLoading, setFpLoading] = useState(false);

    const handleFingerprint = async () => {
        setError('');
        setFpLoading(true);
        try {
            if (!window.PublicKeyCredential) {
                setError('WebAuthn not supported on this browser/device.');
                return;
            }

            const publicKey: any = {
                challenge: crypto.getRandomValues(new Uint8Array(32)),
                userVerification: 'preferred',
                timeout: 60000,
            };

            const credential: any = await navigator.credentials.get({ publicKey });
            const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
            await loginWithFingerprint(credentialId);
        } catch (err: any) {
            if (err.name === 'NotAllowedError') {
                setError('Login was cancelled.');
            } else {
                setError(err.response?.data?.message || err.message || 'Fingerprint login failed');
            }
        } finally {
            setFpLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0FDFA] flex items-center justify-center p-4">
            {/* Background decorative blobs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

            <motion.div
                className="bg-white/70 backdrop-blur-md rounded-3xl p-8 pb-12 max-w-md w-full border border-teal-100 shadow-xl shadow-teal-600/5 relative z-10"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-[#0D9488] rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-teal-600/20">
                        <CheckSquare size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-bold text-[#134E4A] mb-1">DailyFlow</h1>
                    <p className="text-[#134E4A]/60 text-sm text-center">Welcome back! Please use your device fingerprint to unlock your day.</p>
                </div>

                <div className="flex flex-col gap-5">
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-100"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                            >
                                <AlertCircle size={16} className="flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        type="button"
                        className="w-full p-4 bg-[#0D9488] text-white rounded-xl font-bold hover:bg-[#14B8A6] transition-colors shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleFingerprint}
                        disabled={fpLoading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {fpLoading ? (
                            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <><Fingerprint size={18} /> Login with Fingerprint</>
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;

