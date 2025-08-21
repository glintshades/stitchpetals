export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*/.test(error.message) || error.message.includes('Not authenticated') || error.message.includes('Unauthorized');
}

export function redirectToLogin() {
  // Redirect to login page with current path as return URL
  const currentPath = window.location.pathname;
  const returnTo = encodeURIComponent(currentPath);
  window.location.href = `/login?returnTo=${returnTo}`;
}