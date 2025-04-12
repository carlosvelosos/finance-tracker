const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export', // Enables static export
  basePath: isProd ? '/finance-tracker' : '', // Use basePath only in production
  trailingSlash: true, // Ensures proper routing for static files
  assetPrefix: isProd ? '/finance-tracker/' : '', // Use assetPrefix only in production
};

module.exports = nextConfig;