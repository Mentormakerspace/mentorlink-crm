# Use Node.js 20 as the base image
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy the rest of the application
COPY . .

# Set environment variables for Next.js build
ENV NEXT_PUBLIC_API_URL=http://backend:5000/api
ENV NEXT_PUBLIC_SUPABASE_URL=https://placeholder-project.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_anon_key_needs_real_credentials
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Build the application
RUN pnpm run build

# Start the application
EXPOSE 3000
CMD ["pnpm", "start"]

