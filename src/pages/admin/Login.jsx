import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { loginAdmin, clearError } from '../../store/slices/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const onSubmit = (data) => {
    dispatch(loginAdmin(data));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg tracking-tight">TF</span>
          </div>
          <h1 className="text-2xl font-bold text-text-main mt-4">Admin Login</h1>
          <p className="text-text-muted text-sm mt-1">Teeth For Life Management</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Email</label>
            <input
              {...register('email', { required: 'Email is required' })}
              type="email"
              className="input-field"
              placeholder="admin@teethforlife.pk"
              autoComplete="email"
            />
            {errors.email && <p className="text-accent text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Password</label>
            <input
              {...register('password', { required: 'Password is required' })}
              type="password"
              className="input-field"
              placeholder="Enter password"
              autoComplete="current-password"
            />
            {errors.password && <p className="text-accent text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
