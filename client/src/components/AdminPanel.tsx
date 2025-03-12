import React, { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

const AdminPanel: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<{
    status?: 'success' | 'error';
    message?: string;
    configured?: boolean;
    test_response?: string;
  }>({});
  
  const [isLoading, setIsLoading] = useState(false);
  
  const checkOpenAIStatus = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', '/api/openai-status');
      const data = await response.json();
      setApiStatus(data);
    } catch (error) {
      setApiStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to check OpenAI status',
        configured: false
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">OpenAI API Status</h3>
        <button
          onClick={checkOpenAIStatus}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Checking...' : 'Check OpenAI API Status'}
        </button>
        
        {apiStatus.status && (
          <div className={`mt-4 p-4 rounded ${apiStatus.status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="font-semibold">
              Status: <span className={apiStatus.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                {apiStatus.status === 'success' ? 'Connected' : 'Error'}
              </span>
            </p>
            <p className="mt-2">{apiStatus.message}</p>
            {apiStatus.configured !== undefined && (
              <p className="mt-1">
                API Key: {apiStatus.configured ? 'Configured ✓' : 'Not Configured ✗'}
              </p>
            )}
            {apiStatus.test_response && (
              <p className="mt-2">
                Test Response: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{apiStatus.test_response}</span>
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Environment Information</h3>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
          <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'Not set'}</p>
          <p><strong>Using Mock Data:</strong> {import.meta.env.MODE === 'development' ? 'Possible (in dev mode)' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 