import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CorsTestComponent } from '@/components/cors-test';
import { testCorsConnectivity } from '@/lib/cors-test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the CORS test function
vi.mock('@/lib/cors-test', () => ({
  testCorsConnectivity: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('CORS Test Component', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    vi.resetAllMocks();
    
    // Default mock implementation for the auto test
    (testCorsConnectivity as any).mockResolvedValue({
      success: true,
      relativeTest: {
        url: '/api/test',
        success: true,
      },
      absoluteTest: {
        url: 'https://www.careerpathfinder.io/api/test',
        success: false,
        error: 'CORS policy violation',
        isCorsError: true,
      },
      details: {
        origin: 'https://careerpathfinder.io',
        userAgent: 'test-user-agent',
        timestamp: '2023-01-01T00:00:00.000Z',
      },
    });
    
    // Default mock implementation for fetch (manual test)
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'API is working' }),
    });
  });
  
  it('renders the component correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CorsTestComponent />
      </QueryClientProvider>
    );
    
    expect(screen.getByText('CORS Connectivity Test')).toBeInTheDocument();
    expect(screen.getByText('Run Automatic Test')).toBeInTheDocument();
    expect(screen.getByText('Manual Test')).toBeInTheDocument();
  });
  
  it('shows results when automatic test is run', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CorsTestComponent />
      </QueryClientProvider>
    );
    
    // Click the test button
    fireEvent.click(screen.getByText('Run Automatic Test'));
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('CORS Test Passed')).toBeInTheDocument();
    });
    
    // Verify that detailed information is displayed
    expect(screen.getByText('Relative URL Test: Success')).toBeInTheDocument();
    expect(screen.getByText('Absolute URL Test: Failed')).toBeInTheDocument();
    expect(screen.getByText('Error: CORS policy violation')).toBeInTheDocument();
  });
  
  it('shows error state when automatic test fails', async () => {
    // Override the mock to simulate a failure
    (testCorsConnectivity as any).mockRejectedValue(new Error('Network error'));
    
    render(
      <QueryClientProvider client={queryClient}>
        <CorsTestComponent />
      </QueryClientProvider>
    );
    
    // Click the test button
    fireEvent.click(screen.getByText('Run Automatic Test'));
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Test Failed')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
  
  it('performs a manual test successfully', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CorsTestComponent />
      </QueryClientProvider>
    );
    
    // Enter a URL in the manual test input
    const input = screen.getByPlaceholderText('API URL to test');
    fireEvent.change(input, { target: { value: 'https://example.com/api/test' } });
    
    // Click the test button
    fireEvent.click(screen.getByText('Test'));
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Test Passed')).toBeInTheDocument();
    });
    
    // Verify that fetch was called with the right URL
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/api/test',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      })
    );
  });
  
  it('shows error when manual test fails with CORS error', async () => {
    // Override the fetch mock to simulate a CORS error
    (global.fetch as any).mockRejectedValue(new Error('Failed to fetch: CORS policy violation'));
    
    render(
      <QueryClientProvider client={queryClient}>
        <CorsTestComponent />
      </QueryClientProvider>
    );
    
    // Click the test button (using default URL)
    fireEvent.click(screen.getByText('Test'));
    
    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Test Failed')).toBeInTheDocument();
      expect(screen.getByText('Error: Failed to fetch: CORS policy violation')).toBeInTheDocument();
      expect(screen.getByText('CORS Error Detected')).toBeInTheDocument();
    });
  });
}); 