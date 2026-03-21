export function getRuntimeDataEnv() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('base44_data_env') || 'prod';
}

export function isPreviewTestMode() {
  return getRuntimeDataEnv() === 'dev';
}