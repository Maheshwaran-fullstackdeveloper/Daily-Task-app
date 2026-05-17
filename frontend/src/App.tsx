import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import Dashboard from './pages/Dashboard';
import TodayPage from './pages/TodayPage';
import ManageTasks from './pages/ManageTasks';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';
import Loader from './components/Loader';

const AppRoutes = () => {
    const { user, loading, isSetup } = useAuth();

    if (loading) return <Loader />;
    if (!isSetup) return <SetupPage />;
    if (!user) return <LoginPage />;

    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Navigate to="/today" replace />} />
                <Route path="/today" element={<TodayPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/manage" element={<ManageTasks />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/today" replace />} />
            </Routes>
        </Layout>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;
