import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAdminShortcut = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
};

export default useAdminShortcut;
