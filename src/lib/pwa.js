const APP_ICON = '/icons/admin-inbox-icon.svg';

export function canUseNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

export async function registerPwaServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register('/sw.js');
}

export async function requestAlertsPermission() {
  if (!canUseNotifications()) return 'unsupported';
  if (window.Notification.permission === 'granted') return 'granted';
  return window.Notification.requestPermission();
}

export async function showLocalNotification({ title, body, url, tag }) {
  if (!canUseNotifications() || window.Notification.permission !== 'granted') return false;
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    body,
    tag,
    renotify: true,
    icon: APP_ICON,
    badge: APP_ICON,
    data: { url },
  });
  return true;
}