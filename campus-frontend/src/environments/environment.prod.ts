// In production the app is served behind the same nginx/reverse-proxy that
// fronts the API gateway, so requests can go out as same-origin relative
// paths — no CORS, no baked-in hostname. See campus-frontend/nginx.conf.
export const environment = {
  production: true,
  apiBaseUrl: '',
};
