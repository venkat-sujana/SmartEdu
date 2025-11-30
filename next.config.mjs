//next.config.js (ESM style)
const nextConfig = {
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;

