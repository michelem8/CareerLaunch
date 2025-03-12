/**
 * CORS Testing Utility
 * 
 * This file contains utilities to test and diagnose CORS issues
 * between the frontend and API server.
 */

import { getApiUrl } from './api';

interface TestResult {
  url: string;
  success: boolean;
  error?: string;
  response?: any;
  isCorsError?: boolean;
}

interface CorsTestResult {
  success: boolean;
  relativeTest?: TestResult;
  absoluteTest?: TestResult;
  details: {
    origin: string;
    userAgent: string;
    timestamp: string;
  };
  error?: string;
}

/**
 * Test CORS connectivity for both relative and absolute URLs
 * 
 * @returns A detailed report of CORS test results
 */
export const testCorsConnectivity = async (): Promise<CorsTestResult> => {
  const results: CorsTestResult = {
    success: false,
    details: {
      origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString()
    }
  };
  
  try {
    // Test with relative URL first (should work in all environments)
    const relativeUrl = '/api/test';
    const relativeResult = await testEndpoint(relativeUrl);
    results.relativeTest = relativeResult;
    
    // Test with absolute URL (may fail due to CORS)
    const absoluteUrl = `${window.location.protocol}//${
      window.location.hostname.includes('www') ? 
        window.location.hostname : 
        'www.' + window.location.hostname
    }/api/test`;
    
    const absoluteResult = await testEndpoint(absoluteUrl);
    results.absoluteTest = absoluteResult;
    
    // If either test succeeded, mark the overall test as successful
    results.success = relativeResult.success || absoluteResult.success;
    
    return results;
  } catch (error) {
    console.error('CORS test failed:', error);
    return {
      ...results,
      success: false,
      error: error.message
    };
  }
};

/**
 * Test a specific endpoint for CORS compatibility
 * 
 * @param url - The URL to test
 * @returns Test results
 */
async function testEndpoint(url: string): Promise<TestResult> {
  try {
    console.log(`Testing CORS with URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        url,
        success: true,
        response: data
      };
    } else {
      return {
        url,
        success: false,
        error: `Status: ${response.status} ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      url,
      success: false,
      error: error.message,
      isCorsError: error.message?.includes('CORS')
    };
  }
} 