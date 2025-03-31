/** @type {import('next').NextConfig} */
import path from "path";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        search: ''
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        search: ''
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        search: ''
      }
    ]
  },
};
export default nextConfig;
