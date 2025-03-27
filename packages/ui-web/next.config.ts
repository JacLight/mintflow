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
  experimental: {
    turbo: {
      resolve: {
        alias: {
          "appmint-form": path.resolve(__dirname, "../../../appmint-form/src"),
          "appmint-form/*": path.resolve(__dirname, "../../../appmint-form/src/*"),
        },
      },
    },
    watchOptions: {
      ignored: ['**/node_modules/**', '!**/node_modules/appmint-form/**'],
      followSymlinks: true,
    },
  },
};
export default nextConfig;
