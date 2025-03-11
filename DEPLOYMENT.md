# CareerLaunch Deployment Guide

This document provides instructions for deploying the CareerLaunch application to Vercel.

## Client Deployment

To deploy the client application to Vercel, we've created a simple deployment script that:

1. Builds the client application locally
2. Navigates to the dist directory
3. Deploys the built files directly to Vercel

### Prerequisites

- Node.js >= 18.0.0
- Vercel CLI installed (`npm install -g vercel`)
- Vercel account and authentication (run `vercel login` if not already logged in)

### Deployment Steps

Run the deployment script from the project root:

```bash
./deploy-client.sh
```

This will:
- Build the client application
- Deploy it directly to Vercel
- Output the deployment URL when complete

### Troubleshooting

If you encounter any issues with the deployment:

1. Make sure you're logged in to Vercel with `vercel login`
2. Check if there are any build errors in the client application
3. Try running the deployment steps manually:

```bash
cd client
npm run build
cd dist
vercel --prod --yes
```

## Full Application Deployment (Client + Server)

For deploying the full application (both client and server), additional configuration is needed. This is currently a work in progress.

## Previous Issues and Solutions

The main issue we encountered was with TypeScript type definitions during the build process on Vercel. Our solution was to bypass the Vercel build process entirely by:

1. Building the application locally
2. Deploying only the static built files
3. Using a minimal Vercel configuration

This approach works reliably and avoids issues with Node.js type definitions and other build-time dependencies. 