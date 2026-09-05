// GitHub Pages is static-only (no reverse proxy like nginx.conf uses), so
// this build talks to the deployed API gateway cross-origin. The gateway's
// CORS_ALLOWED_ORIGIN must include this page's origin (see render.yaml).
export const environment = {
  production: true,
  apiBaseUrl: 'https://campus-access-gateway.onrender.com',
};
