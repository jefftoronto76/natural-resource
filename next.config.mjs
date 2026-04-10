/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse and mammoth use Node.js APIs that must not be bundled
  serverExternalPackages: ['pdf-parse', 'mammoth'],

  experimental: {
    // Increase body size limit for file uploads (applies to server actions;
    // Route Handler formData() is not capped by Next.js itself — platform
    // limits such as Vercel's 4.5 MB serverless body limit apply separately).
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
