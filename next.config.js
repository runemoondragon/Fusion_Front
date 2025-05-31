/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Disable image optimization for static export
    domains: [], // Add any external image domains if needed
  },
  // Add rewrites to proxy API requests to the backend during development
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*', // Proxy to Backend in development
        },
        {
          source: '/uploads/:path*',
          destination: 'http://localhost:5000/uploads/:path*', // Proxy uploaded files in development
        },
      ];
    }
    
    // In production, return an empty array as we're using the api.mcp4.ai domain
    return [];
  },
}

module.exports = nextConfig 