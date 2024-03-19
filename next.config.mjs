/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  swcLoaderOptions: {
    jsc: {
      externalHelpers: true,
      target: "es2020",
    },
  },
  styledComponents: {
    swcOptions: {
      jsc: {
        externalHelpers: true,
        target: "es2020",
      },
    },
  },
};
export default nextConfig;
