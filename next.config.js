/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
    reactStrictMode: false,
    exportPathMap: async function(
        defaultPathMap,
        {dev,server,outDir,distDir,buildId}
        ) {
            return {}
        }
}

module.exports = nextConfig
