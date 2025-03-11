import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Always set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // In a real app, get the user ID from the session
      const userId = 1;
      
      // Get the actual user data from storage
      const user = await storage.getUser(userId);
      
      if (!user) {
        // Create a new user if none exists
        const newUser = await storage.createUser({
          username: "demo_user",
          password: "demo_password"
        });
        res.json(newUser);
        return;
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch user data',
        details: error instanceof Error ? error.stack : undefined
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 