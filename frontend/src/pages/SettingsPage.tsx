import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Fingerprint, CheckSquare } from 'lucide-react';

const SettingsPage = () => {
    const { user, registerFingerprint } = useAuth();
    const [fpStatus, setFpStatus] = useState('');
    const [fpLoading, setFpLoading] = useState(false);

    const handleRegisterFingerprint = async () => {
        setFpStatus('');
        setFpLoading(true);
        try {
            if (!window.PublicKeyCredential) {
                setFpStatus('error:WebAuthn not supported on this browser/device.');
                return;
            }

            const publicKey: any = {
                challenge: crypto.getRandomValues(new Uint8Array(32)),
                rp: { name: 'DailyFlow', id: window.location.hostname },
                user: {
                    id: new TextEncoder().encode(user._id),
                    name: 'admin',
                    displayName: 'Admin'
                },
                pubKeyCredParams: [
                    { alg: -7, type: 'public-key' },
                    { alg: -257, type: 'public-key' }
                ],
                authenticatorSelection: {
                    authenticatorAttachment: 'platform',
                    userVerification: 'preferred',
                    residentKey: 'preferred'
                },
                timeout: 60000,
            };

            const credential: any = await navigator.credentials.create({ publicKey });
            const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
            await registerFingerprint(credentialId);
            setFpStatus('success:Fingerprint registered! You can now use it to login.');
        } catch (err: any) {
            if (err.name === 'NotAllowedError') {
                setFpStatus('error:Registration was cancelled.');
            } else {
                setFpStatus(`error:Failed: ${err.message}`);
            }
        } finally {
            setFpLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[#134E4A]">Settings</h1>
                <p className="text-sm text-[#134E4A]/60">Manage your account and app preferences</p>
            </div>

            {/* Fingerprint setup */}
            <motion.div
                className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-teal-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-lg text-[#0D9488]">
                        <Fingerprint size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#134E4A]">Device Authentication</h4>
                        <p className="text-sm text-[#134E4A]/60">Register your device biometrics for quick login</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <motion.button
                        className="px-4 py-2 bg-[#0D9488] text-white rounded-xl hover:bg-[#14B8A6] transition-colors shadow-lg shadow-teal-600/20 font-medium text-sm w-full md:w-auto flex justify-center items-center gap-2"
                        onClick={handleRegisterFingerprint}
                        disabled={fpLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {fpLoading ? (
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <><Fingerprint size={16} /> Register Fingerprint</>
                        )}
                    </motion.button>
                    {fpStatus && (
                        <motion.p
                            className={`text-xs font-medium ${fpStatus.startsWith('success') ? 'text-[#0D9488]' : 'text-red-500'}`}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {fpStatus.split(':')[1]}
                        </motion.p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default SettingsPage;
