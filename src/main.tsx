import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Store install prompt globally
let deferredPrompt: any = null;

// Capture the install prompt event early
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Store in window for access from components
  (window as any).deferredPrompt = e;
});

// Register service worker with auto-update
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New content available, refreshing...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  onRegisteredSW(swUrl, registration) {
    console.log('Service Worker registered:', swUrl);
    // Check for updates every 60 seconds
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60000);
    }
  },
  onRegisterError(error) {
    console.error('Service Worker registration error:', error);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
