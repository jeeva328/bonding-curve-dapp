# -------- Stage 1: Builder --------
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm install
    
    # Copy project files
    COPY . .
    
    # ✅ Add build-time environment variables
    ARG BSC_CHAIN_ID
    ENV NEXT_PUBLIC_BSC_CHAIN_ID=$BSC_CHAIN_ID
    
    # Build Next.js app
    RUN npm run build
    
    
    # -------- Stage 2: Production --------
    FROM node:18-alpine
    
    WORKDIR /app
    
    # ✅ Set runtime environment variable
    ARG BSC_CHAIN_ID
    ENV NEXT_PUBLIC_BSC_CHAIN_ID=$BSC_CHAIN_ID
    
    # Copy package files
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/node_modules ./node_modules
    
    # Copy built files from builder
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    
    # ✅ Copy next.config if it exists (optional)
    COPY --from=builder /app/next.config* ./
    
    # Expose port
    EXPOSE 3000
    
    # Start the app
    CMD ["npm", "start"]