/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',

  // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
  // trailingSlash: true,

  // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
  // skipTrailingSlashRedirect: true,

  // Optional: Change the output directory `out` -> `dist`
  distDir: 'dist',
  compress: false,
  images: {
    unoptimized: true,
  },
  // Note: Next.js n'utilise pas directement "devServer" comme option
  // Pour changer le port, utilisez la commande: next dev -p 3333
  // ou modifiez le script dans package.json
};

module.exports = nextConfig;
