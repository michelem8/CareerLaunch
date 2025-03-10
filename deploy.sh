#!/bin/bash

# First build the client
cd client
npm run build
cd ..

# Deploy the entire application
vercel --prod -y 