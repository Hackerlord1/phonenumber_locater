import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  /**
   * Enable static exports for GitHub Pages
   */
  output: 'export',
  /**
   * Set base path to your repository name
   */
  basePath: process.env.NODE_ENV === 'production' ? '/phonenumber_locater' : '',
  /**
   * Disable server-based image optimization for static export
   */
  images: {
    unoptimized: true,
  },
};

export default nextConfig;