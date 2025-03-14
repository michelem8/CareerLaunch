/**
 * Deployment Verification Tests
 * 
 * These tests are designed to run against a deployed environment to verify
 * that critical functionality is working correctly.
 * 
 * Usage:
 * NODE_ENV=production API_URL=https://careerpathfinder.io node tests/deployment.test.js
 */

const fetch = require('node-fetch');

// Get the API URL from environment variable or use a default
const API_URL = process.env.API_URL || 'https://careerpathfinder.io';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

console.log(`Running deployment tests against ${API_URL} in ${ENVIRONMENT} environment`);

// Test utility endpoints with strict CORS checking
async function testUtilityEndpoints() {
  const endpoints = [
    '/api/utils/cors-test',
    '/api/cors-test'
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing endpoint: ${endpoint}`);
      
      // Test with OPTIONS request first
      const optionsResponse = await fetch(`${API_URL}${endpoint}`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://careerpathfinder.io',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      // Check CORS headers
      const corsHeaders = {
        'access-control-allow-origin': optionsResponse.headers.get('access-control-allow-origin'),
        'access-control-allow-credentials': optionsResponse.headers.get('access-control-allow-credentials'),
        'access-control-allow-methods': optionsResponse.headers.get('access-control-allow-methods')
      };
      
      // Now test with GET request
      const getResponse = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Origin': 'https://careerpathfinder.io',
          'Content-Type': 'application/json'
        }
      });
      
      // Check content type
      const contentType = getResponse.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      let responseBody = null;
      let isHtml = false;
      
      try {
        // Try to parse as JSON
        responseBody = await getResponse.json();
      } catch (error) {
        // If not JSON, get as text
        const text = await getResponse.text();
        isHtml = text.includes('<!DOCTYPE html>') || text.includes('<html');
        responseBody = text.substring(0, 100) + '...';
      }
      
      results[endpoint] = {
        options: {
          status: optionsResponse.status,
          corsHeaders
        },
        get: {
          status: getResponse.status,
          contentType,
          isJson,
          isHtml,
          body: responseBody
        }
      };
      
      if (isJson && getResponse.status === 200) {
        console.log(`✅ Endpoint ${endpoint} is working correctly`);
      } else {
        console.error(`❌ Endpoint ${endpoint} failed:`, JSON.stringify(results[endpoint], null, 2));
      }
    } catch (error) {
      console.error(`❌ Error testing ${endpoint}:`, error.message);
      results[endpoint] = {
        error: error.message
      };
    }
  }
  
  return results;
}

// Run all tests
async function runTests() {
  try {
    // Test 1: Utility Endpoints
    console.log('\n🔍 Testing utility endpoints...');
    const utilityResults = await testUtilityEndpoints();
    
    // Check for any failures
    const failures = Object.entries(utilityResults).filter(([_, result]) => 
      result.error || 
      (result.get && (!result.get.isJson || result.get.status !== 200))
    );
    
    if (failures.length > 0) {
      console.error('\n❌ DEPLOYMENT TEST FAILED');
      console.error(`${failures.length} endpoints are not working correctly`);
      process.exit(1);
    } else {
      console.log('\n✅ DEPLOYMENT TEST PASSED');
      console.log('All endpoints are working correctly');
    }
  } catch (error) {
    console.error('\n❌ DEPLOYMENT TEST ERROR:', error.message);
    process.exit(1);
  }
}

// Execute the tests
runTests(); 