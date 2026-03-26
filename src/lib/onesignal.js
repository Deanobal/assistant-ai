import { base44 } from '@/api/base44Client';

const SDK_URL = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';

let sdkPromise = null;
let configPromise = null;
let initPromise = null;
let currentLoginId = null;

function canUseOneSignal() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

function loadOneSignalSdk() {
  if (!canUseOneSignal()) return Promise.resolve(null);
  if (window.OneSignal?.init) return Promise.resolve(window.OneSignal);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push((OneSignal) => resolve(OneSignal));

    if (!document.querySelector(`script[src="${SDK_URL}"]`)) {
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.defer = true;
      script.onerror = () => reject(new Error('Failed to load OneSignal SDK'));
      document.head.appendChild(script);
    }
  });

  return sdkPromise;
}

async function getOneSignalConfig() {
  if (!configPromise) {
    configPromise = base44.functions.invoke('getOneSignalConfig', {}).then((response) => response.data);
  }
  return configPromise;
}

async function ensureInitialized(user) {
  if (!canUseOneSignal()) {
    return { OneSignal: null, supported: false, permission: 'unsupported', subscribed: false };
  }

  const [OneSignal, config] = await Promise.all([loadOneSignalSdk(), getOneSignalConfig()]);

  if (!initPromise) {
    initPromise = OneSignal.init({
      appId: config.appId,
      serviceWorkerPath: config.serviceWorkerPath,
      serviceWorkerUpdaterPath: config.serviceWorkerUpdaterPath,
      serviceWorkerParam: { scope: config.serviceWorkerScope },
      allowLocalhostAsSecureOrigin: true,
      notifyButton: { enable: false },
      welcomeNotification: { disable: true },
    });
  }

  await initPromise;

  if (user?.id && currentLoginId !== user.id) {
    await OneSignal.login(user.id);
    currentLoginId = user.id;
  }

  return {
    OneSignal,
    supported: true,
    permission: typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'default',
    subscribed: Boolean(OneSignal.User?.PushSubscription?.optedIn),
  };
}

export async function initOneSignal(user) {
  const status = await ensureInitialized(user);
  return {
    supported: status.supported,
    permission: status.permission,
    subscribed: status.subscribed,
  };
}

export async function enableOneSignalPush(user) {
  const status = await ensureInitialized(user);
  if (!status.OneSignal) return status;

  await status.OneSignal.Notifications.requestPermission();

  if (status.OneSignal.User?.PushSubscription && typeof status.OneSignal.User.PushSubscription.optIn === 'function') {
    await status.OneSignal.User.PushSubscription.optIn();
  }

  return {
    supported: true,
    permission: typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'default',
    subscribed: Boolean(status.OneSignal.User?.PushSubscription?.optedIn),
  };
}