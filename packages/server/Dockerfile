# Base stage with system dependencies
FROM oven/bun:1 AS base
WORKDIR /app

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install curl gnupg bzip2 -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies and Puppeteer
FROM base AS builder
COPY package.json ./
RUN bun install
RUN bun add puppeteer

# Copy source
COPY src ./src
COPY assets/ ./assets/ 

# Final image
FROM base AS final
WORKDIR /app
COPY --from=builder /app /app

# Set proper permissions for the bun user
RUN chown -R bun:bun /app

# Set Puppeteer cache directory
ENV PUPPETEER_CACHE_DIR=/home/bun/.cache/puppeteer

USER bun
ENTRYPOINT ["bun", "run", "start"]