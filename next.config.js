/** @type {import('next').NextConfig} */
const nextConfig = {
  // LOCAL DEV: Using server-side rendering for PHP backend integration
  // PRODUCTION: May need to revert to 'export' if deploying as static site
  images: {
    domains: ['images.pexels.com'],
    unoptimized: true,
  },
  reactStrictMode: true,
}

module.exports = nextConfig
