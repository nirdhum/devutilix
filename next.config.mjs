/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['hash-wasm', 'diff2html'],
};

export default nextConfig;
