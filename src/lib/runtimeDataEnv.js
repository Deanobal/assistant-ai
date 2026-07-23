export function getRuntimeDataEnv() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('data_env') || 'prod';
}

export function isPreviewTestMode() {
  return getRuntimeDataEnv() === 'dev';
}
