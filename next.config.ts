import type { NextConfig } from 'next'

const baseHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      // Public forms are meant to be embedded on customers' sites via <iframe>.
      { source: '/f/:path*', headers: [...baseHeaders, { key: 'Content-Security-Policy', value: 'frame-ancestors *' }] },
      { source: '/((?!f/).*)', headers: [...baseHeaders, { key: 'X-Frame-Options', value: 'SAMEORIGIN' }] },
    ]
  },
}

export default nextConfig
