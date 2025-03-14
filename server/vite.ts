import express, { type Express, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

let viteInstance: any = null;

export async function setupVite(app: Express, server: Server) {
  if (viteInstance) {
    app.use(viteInstance.middlewares);
    return;
  }

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: ['localhost', '127.0.0.1'],
  };

  viteInstance = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(viteInstance.middlewares);
  app.use("*", async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;

    // Skip API routes
    if (url.startsWith('/api/')) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(process.cwd(), "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await viteInstance.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      viteInstance.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

let staticInstance: any = null;

export function serveStatic(app: Express) {
  if (staticInstance) {
    return;
  }

  // In production, serve from the dist/public directory
  const publicPath = path.resolve(process.cwd(), "dist", "public");
  console.log('Serving static files from:', publicPath);

  if (!fs.existsSync(publicPath)) {
    console.error(`Could not find the public directory: ${publicPath}`);
    console.log('Current directory contents:', fs.readdirSync(process.cwd()));
    throw new Error(
      `Could not find the public directory: ${publicPath}, make sure to build the client first`,
    );
  }

  // Serve static files with proper cache control
  app.use(express.static(publicPath, {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Set cache control headers based on file type
      if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
        // Cache JS and CSS for 1 week
        res.setHeader('Cache-Control', 'public, max-age=604800');
      } else if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.gif') || filePath.endsWith('.ico')) {
        // Cache images for 1 day
        res.setHeader('Cache-Control', 'public, max-age=86400');
      } else {
        // Default cache for 1 hour
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
    }
  }));

  // Special handling for favicon.ico to prevent redirect loops
  app.get('/favicon.ico', (req: Request, res: Response) => {
    const faviconPath = path.join(publicPath, 'favicon.ico');
    
    // Set CORS headers for favicon
    const origin = req.headers.origin;
    if (origin && origin.includes('careerpathfinder.io')) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Vary', 'Origin');
    }
    
    // Send the favicon with proper cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(faviconPath);
  });

  // Serve index.html for all non-API routes - using a named function to avoid linter errors
  function serveIndexHtml(req: Request, res: Response, next: NextFunction) {
    // Skip API routes - ensure this check is thorough
    if (req.originalUrl.startsWith('/api/') || req.path.startsWith('/api/')) {
      console.log(`[Static Server] Skipping static serve for API route: ${req.originalUrl}`);
      return next();
    }
    
    // Special handling for asset files to prevent redirect loops
    if (req.originalUrl.startsWith('/assets/')) {
      const assetPath = path.join(publicPath, req.originalUrl);
      
      // Set CORS headers for assets
      const origin = req.headers.origin;
      if (origin && origin.includes('careerpathfinder.io')) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Vary', 'Origin');
      }
      
      // Send the asset with proper cache headers
      if (req.originalUrl.endsWith('.js') || req.originalUrl.endsWith('.css')) {
        res.setHeader('Cache-Control', 'public, max-age=604800');
      } else if (req.originalUrl.endsWith('.png') || req.originalUrl.endsWith('.jpg') || 
                req.originalUrl.endsWith('.gif') || req.originalUrl.endsWith('.ico')) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
      
      return res.sendFile(assetPath);
    }
    
    const indexPath = path.join(publicPath, "index.html");
    console.log('Serving index.html from:', indexPath);
    
    if (!fs.existsSync(indexPath)) {
      console.error('index.html not found at:', indexPath);
      return next(new Error('index.html not found'));
    }
    
    // Set CORS headers for index.html as well
    const origin = req.headers.origin;
    if (origin && origin.includes('careerpathfinder.io')) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Vary', 'Origin');
    }
    
    res.sendFile(indexPath);
  }

  app.use("*", serveIndexHtml);

  staticInstance = true;
}
