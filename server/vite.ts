import express, { type Express } from "express";
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
  app.use("*", async (req, res, next) => {
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

  // Serve static files
  app.use(express.static(publicPath));

  // Serve index.html for all non-API routes
  app.use("*", (req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
      return next();
    }
    
    const indexPath = path.join(publicPath, "index.html");
    console.log('Serving index.html from:', indexPath);
    
    if (!fs.existsSync(indexPath)) {
      console.error('index.html not found at:', indexPath);
      return next(new Error('index.html not found'));
    }
    
    res.sendFile(indexPath);
  });

  staticInstance = true;
}
