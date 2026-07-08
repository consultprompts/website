import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SettingsPanel from '../components/modals/SettingsPanel';

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/?auth=login&next=/settings', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  return <SettingsPanel isOpen={true} fullScreen onClose={() => navigate(-1)} />;
}
