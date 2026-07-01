import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const { token, mode, loading, error } = useSelector((state) => state.auth);

  const isAuthenticated = !!token;

  const logout = () => {
    dispatch(logoutAction());
  };

  return { isAuthenticated, token, mode, loading, error, logout };
}
