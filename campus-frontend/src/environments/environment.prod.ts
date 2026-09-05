// Production points at the deployed API gateway on Render. This must stay
// an absolute URL — the frontend is served from GitHub Pages, which has no
// server-side reverse proxy to make a relative/same-origin path work.
export const environment = {
  production: true,
  apiBaseUrl: 'https://campus-access-gateway.onrender.com',
};
