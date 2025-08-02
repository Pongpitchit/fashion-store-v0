/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ["profile.line-scdn.net",'d2cva83hdk3bwc.cloudfront.net']
  },
}

export default nextConfig
