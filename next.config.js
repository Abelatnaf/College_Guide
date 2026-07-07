/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Tree-shake these heavy, barrel-exported packages so only the icons/
    // helpers actually used are bundled.
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
};

// Opt-in bundle analysis: `ANALYZE=true npm run build` writes an interactive
// treemap to confirm route bundles stay lean.
module.exports =
  process.env.ANALYZE === "true"
    ? require("@next/bundle-analyzer")({ enabled: true })(nextConfig)
    : nextConfig;
