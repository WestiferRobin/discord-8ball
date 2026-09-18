import { DiscordSDK } from '@discord/embedded-app-sdk';

const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(
  window.location.hostname,
);
const hasFrameId = new URLSearchParams(window.location.search).has('frame_id');

export const isDevelopmentPreview =
  import.meta.env.DEV &&
  isLocalhost &&
  window.parent === window &&
  !hasFrameId;

let connection: Promise<void> | undefined;

export function connectToDiscord(): Promise<void> {
  // Share one handshake across React StrictMode's development effect re-runs.
  connection ??= initializeDiscord();
  return connection;
}

async function initializeDiscord(): Promise<void> {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID?.trim();
  if (!clientId || !/^\d{17,20}$/.test(clientId)) {
    throw new Error('Set VITE_DISCORD_CLIENT_ID to your public application ID, then restart Vite or rebuild.');
  }
  if (!hasFrameId) {
    throw new Error('Launch this app from the Discord App Launcher. Browser preview is available only on the local development server.');
  }

  const sdk = new DiscordSDK(clientId);
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      sdk.ready(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error('Discord did not respond. Check the Activity URL mapping and tunnel, then retry.'));
        }, 15_000);
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}
