import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { testCorsConnectivity } from '@/lib/cors-test';
import { getApiUrl } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export function CorsTestComponent() {
  const [manualTestUrl, setManualTestUrl] = useState('');
  const [manualTestResult, setManualTestResult] = useState<any>(null);
  
  // Use React Query for automatic testing
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['corsTest'],
    queryFn: testCorsConnectivity,
    enabled: false, // Don't run automatically
  });
  
  // Manual test function
  const runManualTest = async () => {
    try {
      const url = manualTestUrl || getApiUrl('/api/test');
      setManualTestUrl(url);
      
      console.log(`Running manual CORS test to: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setManualTestResult({
          success: true,
          status: response.status,
          data
        });
      } else {
        setManualTestResult({
          success: false,
          status: response.status,
          statusText: response.statusText
        });
      }
    } catch (error) {
      setManualTestResult({
        success: false,
        error: error.message,
        isCorsError: error.message?.includes('CORS')
      });
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto my-8">
      <CardHeader>
        <CardTitle>CORS Connectivity Test</CardTitle>
        <CardDescription>
          Test the CORS configuration between frontend and API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Automatic Test</h3>
          <Button 
            onClick={() => refetch()} 
            disabled={isLoading}
            variant="default"
          >
            {isLoading ? 'Testing...' : 'Run Automatic Test'}
          </Button>
          
          {data && (
            <div className="mt-4">
              <Alert variant={data.success ? "default" : "destructive"}>
                <AlertTitle>
                  {data.success ? 'CORS Test Passed' : 'CORS Test Failed'}
                </AlertTitle>
                <AlertDescription>
                  <div className="mt-2">
                    <p><strong>Origin:</strong> {data.details.origin}</p>
                    <p><strong>Timestamp:</strong> {data.details.timestamp}</p>
                    
                    {data.relativeTest && (
                      <div className="mt-2 p-2 bg-muted rounded-md">
                        <p><strong>Relative URL Test:</strong> {data.relativeTest.success ? 'Success' : 'Failed'}</p>
                        <p><strong>URL:</strong> {data.relativeTest.url}</p>
                        {data.relativeTest.error && <p><strong>Error:</strong> {data.relativeTest.error}</p>}
                      </div>
                    )}
                    
                    {data.absoluteTest && (
                      <div className="mt-2 p-2 bg-muted rounded-md">
                        <p><strong>Absolute URL Test:</strong> {data.absoluteTest.success ? 'Success' : 'Failed'}</p>
                        <p><strong>URL:</strong> {data.absoluteTest.url}</p>
                        {data.absoluteTest.error && <p><strong>Error:</strong> {data.absoluteTest.error}</p>}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {isError && (
            <Alert variant="destructive">
              <AlertTitle>Test Failed</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="border-t pt-4 space-y-2">
          <h3 className="text-lg font-medium">Manual Test</h3>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border rounded-md"
              placeholder="API URL to test"
              value={manualTestUrl}
              onChange={(e) => setManualTestUrl(e.target.value)}
            />
            <Button onClick={runManualTest}>
              Test
            </Button>
          </div>
          
          {manualTestResult && (
            <div className="mt-4">
              <Alert variant={manualTestResult.success ? "default" : "destructive"}>
                <AlertTitle>
                  {manualTestResult.success ? 'Test Passed' : 'Test Failed'}
                </AlertTitle>
                <AlertDescription>
                  <div className="mt-2">
                    {manualTestResult.status && <p><strong>Status:</strong> {manualTestResult.status}</p>}
                    {manualTestResult.error && <p><strong>Error:</strong> {manualTestResult.error}</p>}
                    {manualTestResult.isCorsError && <p><strong>CORS Error Detected</strong></p>}
                    
                    {manualTestResult.data && (
                      <div className="mt-2 p-2 bg-muted rounded-md overflow-auto max-h-40">
                        <pre className="text-xs">{JSON.stringify(manualTestResult.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 