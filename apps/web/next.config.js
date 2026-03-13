/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true }
    ];
  }
};

module.exports = nextConfig;
