/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enables static export
  basePath: '/finance-tracker', // Replace with your GitHub repository name
  trailingSlash: true, // Ensures proper routing for static files
};

module.exports = nextConfig;