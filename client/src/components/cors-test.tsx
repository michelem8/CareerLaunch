import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getApiUrl } from '@/lib/api';

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
}

export function CorsTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [manualTestUrl, setManualTestUrl] = useState('');

  const runTest = async (endpoint = '/api/test') => {
    setIsLoading(true);
    try {
      // Test with relative URL
      const url = manualTestUrl || getApiUrl(endpoint);
      console.log(`Testing CORS with URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResults(prev => [
          { 
            success: true, 
            message: `Success: ${url}`, 
            details: data 
          },
          ...prev
        ]);
      } else {
        setTestResults(prev => [
          { 
            success: false, 
            message: `Failed with status: ${response.status}`, 
            error: `${response.status} ${response.statusText}`,
            details: { url }
          },
          ...prev
        ]);
      }
    } catch (error) {
      setTestResults(prev => [
        { 
          success: false, 
          message: 'CORS Error', 
          error: error.message,
          details: { 
            isCorsError: error.message?.includes('CORS'),
            url: manualTestUrl || getApiUrl(endpoint)
          }
        },
        ...prev
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Run test on component mount
  useEffect(() => {
    runTest();
    // Also test the dedicated CORS test endpoint
    runTest('/api/cors-test');
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>CORS Test Utility</CardTitle>
        <CardDescription>
          Test cross-origin resource sharing between frontend and backend
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => runTest()} 
              disabled={isLoading}
              variant="outline"
            >
              Test API Endpoint
            </Button>
            <Button 
              onClick={() => runTest('/api/cors-test')} 
              disabled={isLoading}
              variant="outline"
            >
              Test CORS Endpoint
            </Button>
          </div>

          <div className="space-y-4 mt-4">
            {testResults.map((result, index) => (
              <Alert key={index} variant={result.success ? "default" : "destructive"}>
                <div className="flex items-center gap-2">
                  <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
                  <Badge variant={result.success ? "outline" : "destructive"}>
                    {result.success ? 'CORS OK' : 'CORS Failed'}
                  </Badge>
                </div>
                <AlertDescription>
                  <div className="mt-2">
                    <p>{result.message}</p>
                    {result.error && <p className="text-red-500">{result.error}</p>}
                    {result.details && (
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">
          {testResults.length > 0 
            ? `${testResults.filter(r => r.success).length} of ${testResults.length} tests passed`
            : 'No tests run yet'}
        </p>
      </CardFooter>
    </Card>
  );
} 