

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  basePath: isProd ? "/HanjaClaude" : "",
  assetPrefix: isProd ? "/HanjaClaude" : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? "/HanjaClaude" : "",
  },
};

export default nextConfig;
