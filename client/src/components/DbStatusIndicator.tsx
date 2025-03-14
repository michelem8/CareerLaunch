import React, { useEffect, useState } from 'react';
import { getSupabaseStatus } from '../lib/supabase-client';

interface DbStatusIndicatorProps {
  showInProduction?: boolean;
}

const DbStatusIndicator: React.FC<DbStatusIndicatorProps> = ({ showInProduction = false }) => {
  const [status, setStatus] = useState<{ connected: boolean; error?: string }>({ 
    connected: false 
  });
  const [isLoading, setIsLoading] = useState(true);
  const isProduction = import.meta.env.MODE === 'production';
  
  // Don't show in production unless explicitly requested
  if (isProduction && !showInProduction) {
    return null;
  }

  useEffect(() => {
    async function checkDbStatus() {
      try {
        setIsLoading(true);
        const dbStatus = await getSupabaseStatus();
        setStatus(dbStatus);
      } catch (error) {
        setStatus({ 
          connected: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      } finally {
        setIsLoading(false);
      }
    }

    checkDbStatus();
    
    // Check status periodically (every 2 minutes)
    const intervalId = setInterval(checkDbStatus, 120000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed bottom-2 right-2 bg-gray-800 text-white px-3 py-1 rounded text-xs z-50 opacity-70">
        Checking database...
      </div>
    );
  }

  if (status.connected) {
    return (
      <div className="fixed bottom-2 right-2 bg-green-700 text-white px-3 py-1 rounded text-xs z-50 opacity-70 hover:opacity-100 transition-opacity">
        Supabase connected
      </div>
    );
  }

  return (
    <div className="fixed bottom-2 right-2 bg-red-700 text-white px-3 py-1 rounded text-xs z-50 opacity-80 hover:opacity-100 transition-opacity">
      Supabase disconnected{status.error ? `: ${status.error}` : ''}
    </div>
  );
};

export default DbStatusIndicator; 