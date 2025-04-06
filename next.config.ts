const nextConfig = {
  output: 'export', // Enables static export
  basePath: '/finance-tracker', // Matches your GitHub repository name
  trailingSlash: true, // Ensures proper routing for static files
  assetPrefix: '/finance-tracker/', // Ensures static assets use the correct prefix
};

module.exports = nextConfig;