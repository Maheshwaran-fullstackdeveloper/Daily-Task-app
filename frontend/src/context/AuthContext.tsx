import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSetup, setIsSetup] = useState(true); // Default to true to avoid blocking if check fails

    const checkStatus = useCallback(async () => {
        try {
            const res = await api.get('/auth/status');
            setIsSetup(res.data.isSetup);
            
            if (res.data.isSetup) {
                try {
                    const meRes = await api.get('/auth/me');
                    setUser(meRes.data);
                } catch (err) {
                    console.log('No active session');
                    setUser(null);
                }
            }
        } catch (err) {
            console.error('Failed to check auth status', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
    };

    const setup = async (credentialId: string) => {
        const res = await api.post('/auth/setup', { credentialId });
        // The backend might not return user in res.data.user if it just returns message
        // But let's assume it returns the user or we fetch it later
        setIsSetup(true);
        return res.data;
    };

    const loginWithFingerprint = async (credentialId: string) => {
        const res = await api.post('/auth/fingerprint-login', { credentialId });
        setUser(res.data);
        return res.data;
    };

    const registerFingerprint = async (credentialId: string) => {
        const res = await api.post('/auth/register-fingerprint', { credentialId });
        return res.data;
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isSetup,
            logout,
            setup,
            loginWithFingerprint,
            registerFingerprint
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
