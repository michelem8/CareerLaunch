import { Request, Response, NextFunction } from "express";

// Configure CORS allowed origins
export const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://careerpathfinder.io',
      'https://www.careerpathfinder.io',
      'https://api.careerpathfinder.io',
    ] 
  : ['http://localhost:5173']; // Vite's default development port

// Middleware to handle www vs non-www redirects
export function redirectMiddleware(req: Request, res: Response, next: NextFunction) {
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
    return res.redirect(301, `https://www.careerpathfinder.io${req.url}`);
  }
  next();
}

// CORS middleware with improved handling
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    // Set CORS headers for preflight requests
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept, X-CSRF-Token, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Respond with 204 No Content for OPTIONS requests
    return res.status(204).end();
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
  
  next();
}

// Middleware to ensure no unnecessary redirects for preflight requests
export function preflightRedirectMiddleware(req: Request, res: Response, next: NextFunction) {
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
    return res.status(204).end();
  }
  
  next();
}

// Middleware for static assets CORS
export function staticAssetsCorsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Apply CORS headers for all static assets
  if (req.path.startsWith('/assets/') || req.path === '/favicon.ico') {
    const origin = req.headers.origin;
    
    // Allow both www and non-www versions
    if (origin && (
      origin === 'https://www.careerpathfinder.io' || 
      origin === 'https://careerpathfinder.io'
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