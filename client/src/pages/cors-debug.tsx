import { CorsTest } from '@/components/cors-test';
import { Container } from '@/components/ui/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CorsDebugPage() {
  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold mb-6">CORS Debugging Tools</h1>
      
      <Tabs defaultValue="test">
        <TabsList className="mb-4">
          <TabsTrigger value="test">CORS Test</TabsTrigger>
          <TabsTrigger value="info">Browser Info</TabsTrigger>
          <TabsTrigger value="help">Troubleshooting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="test">
          <CorsTest />
        </TabsContent>
        
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Browser Information</CardTitle>
              <CardDescription>Details about your current browser environment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Origin</h3>
                  <p className="text-sm text-gray-500">{window.location.origin}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">User Agent</h3>
                  <p className="text-sm text-gray-500">{navigator.userAgent}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Environment</h3>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify({
                      mode: import.meta.env.MODE,
                      apiUrl: import.meta.env.VITE_API_URL || 'not set',
                      production: import.meta.env.PROD,
                      development: import.meta.env.DEV,
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>CORS Troubleshooting Guide</CardTitle>
              <CardDescription>Common solutions for CORS issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Common CORS Issues</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                    <li>Missing <code>Access-Control-Allow-Origin</code> header on server response</li>
                    <li>Server not handling OPTIONS preflight requests correctly</li>
                    <li>Credentials mode issues (cookies, auth headers)</li>
                    <li>Redirects causing CORS failures</li>
                    <li>Different domains/subdomains (www vs non-www)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">Production Solutions</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                    <li>Use relative URLs in production (<code>/api/endpoint</code> instead of <code>https://domain.com/api/endpoint</code>)</li>
                    <li>Ensure server CORS configuration includes all relevant domains</li>
                    <li>Configure proper CORS headers on the server</li>
                    <li>Use a reverse proxy to serve API and frontend from same origin</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">Development Solutions</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                    <li>Use a CORS proxy during development</li>
                    <li>Configure Vite's proxy settings in <code>vite.config.ts</code></li>
                    <li>Use browser extensions to disable CORS for testing (not for production!)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
} 