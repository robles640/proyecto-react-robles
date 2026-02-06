import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks';
import { Layout } from '../components';

export const PrivateRoute = () => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};
