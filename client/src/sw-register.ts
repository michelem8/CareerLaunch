// Add declaration for global property
declare global {
  interface Window {
    API_ACCESSIBLE?: boolean;
  }
}

// Register the service worker
export function registerServiceWorker() {
  // Only register in development mode
  if (import.meta.env.MODE === 'development') {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
          .then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(function(error) {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  } else if ('serviceWorker' in navigator) {
    // Unregister any existing service worker in production
    window.addEventListener('load', function() {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for (let registration of registrations) {
          registration.unregister();
          console.log('Service Worker unregistered for production');
        }
      });
    });
  }
}

// Check if the API is accessible or if we need to use fallbacks
export async function checkApiStatus() {
  // Only check in development mode
  if (import.meta.env.MODE !== 'development') {
    window.API_ACCESSIBLE = true;
    return;
  }
  
  try {
    const response = await fetch('/api/cors-test', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    
    if (response.ok) {
      console.log('API is accessible, no need for fallbacks');
      window.API_ACCESSIBLE = true;
    } else {
      console.warn('API returned error, enabling fallbacks');
      window.API_ACCESSIBLE = false;
    }
  } catch (error) {
    console.error('API check failed, enabling fallbacks:', error instanceof Error ? error.message : String(error));
    window.API_ACCESSIBLE = false;
  }
} 