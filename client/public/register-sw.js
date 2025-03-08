// Register the service worker
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

// Check if the API is accessible or if we need to use fallbacks
async function checkApiStatus() {
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