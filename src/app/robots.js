export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://brosur-mta.vercel.app/sitemap.xml',
  };
}
