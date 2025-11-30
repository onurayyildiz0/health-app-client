import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';


const ProtectedRoute = ({ children, allowedRoles }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        const userDashboard = `/dashboard/${user.role}`;
        return <Navigate to={userDashboard} replace />
    }

    return children;
}

export default ProtectedRoute;