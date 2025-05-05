// Loading Screen Script - Simplified Version
document.addEventListener('DOMContentLoaded', function() {
    // Get the loading screen element
    const loadingScreen = document.getElementById('loading-screen');

    // Check if we're on the Horizons page and add the special class
    if (window.location.href.includes('horizons.html')) {
        loadingScreen.classList.add('horizons-loading');
    }

    // Hide loading screen after resources are loaded
    window.addEventListener('load', function() {
        setTimeout(function() {
            loadingScreen.classList.add('fade-out');

            // Remove loading screen from DOM after animation completes
            setTimeout(function() {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 500);
    });

    // Fallback: If loading takes too long, hide the loading screen after 4 seconds
    setTimeout(function() {
        if (loadingScreen.style.display !== 'none') {
            loadingScreen.classList.add('fade-out');
            setTimeout(function() {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 4000);
});
