import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import NewInspection from './pages/NewInspection';
import SubmissionView from './pages/SubmissionView';
import AdminDashboard from './pages/AdminDashboard';
import AdminSubmissions from './pages/AdminSubmissions';
import AdminFormEditor from './pages/AdminFormEditor';
import AdminUsers from './pages/AdminUsers';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-sm text-surface-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={
            user?.role === 'admin'
              ? <Navigate to="/admin" replace />
              : <Navigate to="/dashboard" replace />
          } />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="form/new" element={<NewInspection />} />
          <Route path="form/view/:id" element={<SubmissionView />} />

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/submissions" element={<AdminSubmissions />} />
            <Route path="admin/form-editor" element={<AdminFormEditor />} />
            <Route path="admin/users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
