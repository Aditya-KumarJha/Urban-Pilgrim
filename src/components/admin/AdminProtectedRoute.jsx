import { useSelector } from 'react-redux';
import AdminSignIn from './AdminSignIn';

export default function AdminProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useSelector((state) => state.adminAuth);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminSignIn />;
    }

    return children;
}
