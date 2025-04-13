const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Remove 'output: export' for Vercel deployment
  trailingSlash: true, // Optional: Ensures proper routing for static files
  // Remove basePath unless deploying under a subpath
};

module.exports = nextConfig;