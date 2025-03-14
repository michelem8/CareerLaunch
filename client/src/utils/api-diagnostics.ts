/**
 * API Diagnostics Utility
 * 
 * This utility provides functions for diagnosing API connectivity issues,
 * especially in production environments.
 */

import { getApiUrl } from '../lib/api';

/**
 * Enum of common API error types
 */
export enum ApiErrorType {
  HTML_RESPONSE = 'html_response',
  NETWORK_ERROR = 'network_error',
  CORS_ERROR = 'cors_error',
  SERVER_ERROR = 'server_error',
  AUTH_ERROR = 'auth_error',
  UNKNOWN = 'unknown'
}

/**
 * Interface for API diagnostic test results
 */
export interface ApiDiagnosticResult {
  success: boolean;
  errorType?: ApiErrorType;
  message: string;
  url: string;
  status?: number;
  contentType?: string;
  responsePreview?: string;
  details?: any;
}

/**
 * Runs a comprehensive API diagnostic test
 * 
 * @returns Detailed diagnostic result
 */
export async function runApiDiagnostics(): Promise<ApiDiagnosticResult> {
  // First test a simple endpoint
  const basicEndpoint = '/api/health';
  const result = await testEndpoint(basicEndpoint);
  
  if (!result.success) {
    // If the basic test fails, try a more specific API test endpoint
    const testEndpointResult = await testEndpoint('/api/utils/test');
    if (!testEndpointResult.success) {
      // We have a serious connectivity issue
      return {
        ...testEndpointResult,
        message: `API connectivity issue: ${testEndpointResult.message}. This may indicate a server configuration problem.`
      };
    }
  }
  
  // If we got here, basic connectivity works. 
  // Test CORS specifically
  const corsResult = await testEndpoint('/api/utils/cors-test');
  
  return corsResult;
}

/**
 * Tests a specific API endpoint and analyzes the response
 * 
 * @param endpoint - The API endpoint to test
 * @returns Detailed diagnostic result
 */
export async function testEndpoint(endpoint: string): Promise<ApiDiagnosticResult> {
  const url = getApiUrl(endpoint);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    });
    
    // Check response status
    if (!response.ok) {
      let errorType = ApiErrorType.SERVER_ERROR;
      let message = `Server returned error status: ${response.status}`;
      
      if (response.status === 401 || response.status === 403) {
        errorType = ApiErrorType.AUTH_ERROR;
        message = 'Authentication or authorization error';
      }
      
      return {
        success: false,
        errorType,
        message,
        url,
        status: response.status,
        contentType: response.headers.get('content-type') || undefined
      };
    }
    
    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      // Clone the response to read the body
      const clone = response.clone();
      const text = await clone.text();
      const isHtml = text.toLowerCase().includes('<!doctype html>') || text.toLowerCase().includes('<html');
      
      if (isHtml) {
        return {
          success: false,
          errorType: ApiErrorType.HTML_RESPONSE,
          message: 'Server returned HTML instead of JSON. This usually indicates a routing or middleware issue.',
          url,
          status: response.status,
          contentType: contentType || undefined,
          responsePreview: text.substring(0, 200),
          details: {
            responseLength: text.length,
            isRedirected: response.redirected,
            finalUrl: response.url
          }
        };
      }
      
      return {
        success: false,
        errorType: ApiErrorType.UNKNOWN,
        message: `Server returned non-JSON response: ${contentType || 'unknown content type'}`,
        url,
        status: response.status,
        contentType: contentType || undefined,
        responsePreview: text.substring(0, 200)
      };
    }
    
    // Success - parse the JSON response
    const data = await response.json();
    
    return {
      success: true,
      message: 'API endpoint is functioning correctly',
      url,
      status: response.status,
      contentType,
      details: data
    };
  } catch (error) {
    // Handle network and parsing errors
    let errorType = ApiErrorType.NETWORK_ERROR;
    let message = error.message || 'Unknown network error';
    
    if (error.message?.includes('CORS')) {
      errorType = ApiErrorType.CORS_ERROR;
      message = 'CORS policy error. The server is not allowing cross-origin requests.';
    } else if (error.message?.includes('JSON')) {
      errorType = ApiErrorType.HTML_RESPONSE;
      message = 'Failed to parse JSON response. The server may be returning HTML.';
    }
    
    return {
      success: false,
      errorType,
      message,
      url,
      details: {
        errorName: error.name,
        errorStack: error.stack
      }
    };
  }
}

/**
 * Generates a comprehensive API diagnostic report 
 * 
 * @returns Object with diagnostic information and recommendations
 */
export async function generateApiDiagnosticReport(): Promise<{
  report: string;
  technicalDetails: any;
  recommendations: string[];
}> {
  const diagnostics = await runApiDiagnostics();
  const recommendations: string[] = [];
  
  // Start building the report
  let report = `API Diagnostic Report\n`;
  report += `==================\n\n`;
  report += `Time: ${new Date().toISOString()}\n`;
  report += `Environment: ${import.meta.env.MODE}\n`;
  report += `API Base URL: ${import.meta.env.VITE_API_URL || 'Using relative URLs'}\n`;
  report += `Browser: ${navigator.userAgent}\n\n`;
  
  // Add test results
  report += `Test Results:\n`;
  report += `- Success: ${diagnostics.success ? 'Yes' : 'No'}\n`;
  
  if (!diagnostics.success) {
    report += `- Error Type: ${diagnostics.errorType}\n`;
    report += `- Message: ${diagnostics.message}\n`;
    report += `- Endpoint URL: ${diagnostics.url}\n`;
    report += `- Status Code: ${diagnostics.status || 'N/A'}\n`;
    report += `- Content Type: ${diagnostics.contentType || 'N/A'}\n\n`;
    
    if (diagnostics.responsePreview) {
      report += `Response Preview:\n${diagnostics.responsePreview}\n\n`;
    }
    
    // Add recommendations based on error type
    switch (diagnostics.errorType) {
      case ApiErrorType.HTML_RESPONSE:
        recommendations.push('Check server routing configuration, particularly how API routes are handled');
        recommendations.push('Examine middleware ordering in Express app - API routes should be processed before any HTML/static serving');
        recommendations.push('Ensure redirects aren\'t affecting API routes');
        break;
        
      case ApiErrorType.CORS_ERROR:
        recommendations.push('Check CORS configuration on the server');
        recommendations.push('Verify allowed origins in CORS settings match the frontend domain');
        recommendations.push('Ensure credentials mode is properly configured');
        break;
        
      case ApiErrorType.NETWORK_ERROR:
        recommendations.push('Check network connectivity');
        recommendations.push('Verify API server is running');
        recommendations.push('Check for firewall or proxy issues');
        break;
        
      case ApiErrorType.SERVER_ERROR:
        recommendations.push('Check server logs for errors');
        recommendations.push('Examine API endpoint implementation');
        recommendations.push('Verify any required environment variables are set');
        break;
        
      default:
        recommendations.push('Review server logs for unexpected errors');
        recommendations.push('Check API endpoint implementation');
    }
  } else {
    report += `- Message: ${diagnostics.message}\n`;
    report += `- Endpoint URL: ${diagnostics.url}\n`;
    report += `- Status Code: ${diagnostics.status}\n`;
    report += `- Content Type: ${diagnostics.contentType}\n\n`;
    
    if (diagnostics.details) {
      report += `Details: ${JSON.stringify(diagnostics.details, null, 2)}\n\n`;
    }
    
    recommendations.push('API is working correctly. No action required.');
  }
  
  // Add recommendations to report
  report += `Recommendations:\n`;
  recommendations.forEach((rec, index) => {
    report += `${index + 1}. ${rec}\n`;
  });
  
  return {
    report,
    technicalDetails: diagnostics,
    recommendations
  };
} 