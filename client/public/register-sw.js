// Register the service worker
if ('serviceWorker' in navigator && import.meta.env.MODE === 'development') {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(function(error) {
        console.error('Service Worker registration failed:', error);
      });
  });
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

// Check if the API is accessible or if we need to use fallbacks
async function checkApiStatus() {
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
    console.error('API check failed, enabling fallbacks:', error);
    window.API_ACCESSIBLE = false;
  }
}

// Run the check once the page loads
window.addEventListener('load', checkApiStatus); 