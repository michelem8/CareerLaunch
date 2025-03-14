import { Request, Response, NextFunction } from "express";

// Configure CORS allowed origins
export const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://www.careerpathfinder.io',
      'https://api.careerpathfinder.io',
    ] 
  : ['http://localhost:5173']; // Vite's default development port

// Middleware to handle www vs non-www redirects
export function redirectMiddleware(req: Request, res: Response, next: NextFunction): void {
  const host = req.headers.host || '';
  
  // Standardize on www version
  if (host === 'careerpathfinder.io') {
    // Set CORS headers before redirect
    const origin = req.headers.origin;
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Vary', 'Origin');
    }
    
    // 301 redirect to www version
    res.redirect(301, `https://www.careerpathfinder.io${req.url}`);
    return;
  }
  next();
}

// CORS middleware with improved handling
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  
  // Special handling for specific API endpoints that need to work in all environments
  const isUtilEndpoint = req.path.includes('/api/utils/cors-test') || 
                         req.originalUrl.includes('/api/utils/cors-test') ||
                         req.path === '/api/cors-test' ||
                         req.originalUrl === '/api/cors-test';
                         
  if (isUtilEndpoint) {
    console.log(`[CORS] Special handling for utility endpoint: ${req.originalUrl}`);
    // Force setting isApiRequest flag
    (req as any).isApiRequest = true;
    // Set JSON content type
    res.header('Content-Type', 'application/json');
    
    // Always allow CORS for utility endpoints
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
      res.header('Access-Control-Max-Age', '86400');
      res.status(204).end();
      return;
    }
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    // Set CORS headers for preflight requests
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept, X-CSRF-Token, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Respond with 204 No Content for OPTIONS requests
    res.status(204).end();
    return;
  }
  
  // For non-OPTIONS requests, set standard CORS headers
  if (origin) {
    // Check if the origin is allowed
    const isAllowed = allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production';
    
    if (isAllowed) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      console.log(`Origin allowed by CORS policy: ${origin}`);
    } else {
      console.warn(`Origin rejected by CORS policy: ${origin}`);
    }
  }
  
  // For API requests, always ensure appropriate content type header
  if (req.path.startsWith('/api/') || 
      req.originalUrl.startsWith('/api/') || 
      req.url.startsWith('/api/') || 
      req.path === '/test' || 
      req.path === '/cors-test') {
    // Ensure JSON content type for API responses
    res.header('Content-Type', 'application/json');
  }
  
  next();
}

// Middleware to ensure no unnecessary redirects for preflight requests
export function preflightRedirectMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip redirects for OPTIONS requests to prevent CORS preflight issues
  if (req.method === 'OPTIONS') {
    // Set proper CORS headers directly
    const origin = req.headers.origin;
    
    // Check if origin is allowed
    if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production')) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Respond immediately with 204 No Content
    res.status(204).end();
    return;
  }
  
  next();
}

// Middleware for static assets CORS
export function staticAssetsCorsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Apply CORS headers for all static assets
  if (req.path.startsWith('/assets/') || req.path === '/favicon.ico') {
    const origin = req.headers.origin;
    
    // Allow both www and non-www versions during transition period
    if (origin && (
      origin === 'https://www.careerpathfinder.io'
    )) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Vary', 'Origin');
    }
  }
  next();
} 