/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      }
      // Add other image hostnames as needed
    ],
  },
  // experimental: {
  //   appDir: true, // Already true by default in Next 13.4+
  // },
};

export default nextConfig;
