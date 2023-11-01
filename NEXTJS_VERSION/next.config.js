/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,

    async rewrites() {
        return [
            {
                source: '/:path((?:[A-Za-z0-9]{3}-){2}[A-Za-z0-9]{3})',
                destination: '/:path*',
            },
            {
                source: '/login/:path*',
                destination: '/login/:path*',
            },
            {
                source: '/:path*',
                destination: '/404',
            },
        ];
    },
};

module.exports = nextConfig
