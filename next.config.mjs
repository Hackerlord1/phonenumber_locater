/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/phone-locator-pro",
  assetPrefix: "/phone-locator-pro/",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
