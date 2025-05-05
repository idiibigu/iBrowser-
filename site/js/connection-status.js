/**
 * Connection Status Manager
 * Handles online/offline status detection and UI updates
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const statusIcon = document.getElementById('connection-status-icon');
    const statusText = document.getElementById('connection-status-text');
    const statusContainer = document.querySelector('.connection-status-container');

    // Check connection speed and update UI
    function updateConnectionStatus() {
        if (navigator.onLine) {
            // Online - check connection speed
            checkConnectionSpeed().then(speed => {
                document.body.classList.remove('offline');
                document.body.classList.add('online');

                if (speed < 1) {
                    // Very slow connection
                    statusIcon.className = 'connection-status-icon slow';
                    statusText.textContent = document.documentElement.lang === 'ar' ?
                        'اتصال بطيء' : 'Slow Connection';
                } else if (speed < 5) {
                    // Moderate connection
                    statusIcon.className = 'connection-status-icon online';
                    statusText.textContent = document.documentElement.lang === 'ar' ?
                        'متصل (سرعة متوسطة)' : 'Connected (Moderate)';
                } else {
                    // Good connection
                    statusIcon.className = 'connection-status-icon online';
                    statusText.textContent = document.documentElement.lang === 'ar' ?
                        'متصل بالإنترنت' : 'Connected';
                }

                // Hide status after 5 seconds if connection is good
                if (speed >= 5) {
                    setTimeout(() => {
                        statusContainer.style.opacity = '0';
                        setTimeout(() => {
                            statusContainer.style.display = 'none';
                        }, 500);
                    }, 5000);
                }
            });
        } else {
            // Offline
            document.body.classList.remove('online');
            document.body.classList.add('offline');
            statusIcon.className = 'connection-status-icon offline';
            statusText.textContent = document.documentElement.lang === 'ar' ?
                'غير متصل بالإنترنت' : 'Offline';
            statusContainer.style.display = 'flex';
            statusContainer.style.opacity = '0.85';
        }
    }

    // Check connection speed by downloading a small image
    function checkConnectionSpeed() {
        return new Promise((resolve) => {
            const startTime = new Date().getTime();
            const url = 'icons/icon-72x72.png' + '?t=' + startTime; // Add cache buster

            fetch(url)
                .then(response => response.blob())
                .then(data => {
                    const endTime = new Date().getTime();
                    const duration = (endTime - startTime) / 1000; // seconds
                    const size = data.size / 1024; // KB
                    const speed = size / duration; // KB/s

                    console.log(`Connection speed: ${speed.toFixed(2)} KB/s`);
                    resolve(speed);
                })
                .catch(() => {
                    // If fetch fails, assume very slow connection
                    resolve(0.5);
                });
        });
    }

    // Event listeners for online/offline events
    window.addEventListener('online', () => {
        console.log('Device is online');
        updateConnectionStatus();
    });

    window.addEventListener('offline', () => {
        console.log('Device is offline');
        updateConnectionStatus();
    });

    // Initial check
    updateConnectionStatus();

    // Periodically check connection (every 30 seconds)
    setInterval(updateConnectionStatus, 30000);

    // Add click handler to hide status indicator
    statusContainer.addEventListener('click', function() {
        this.style.opacity = '0';
        setTimeout(() => {
            this.style.display = 'none';
        }, 500);
    });

    // Show status indicator when user moves mouse to bottom of screen
    document.addEventListener('mousemove', function(e) {
        const viewportHeight = window.innerHeight;
        if (e.clientY > viewportHeight - 100 && navigator.onLine) {
            statusContainer.style.display = 'flex';
            statusContainer.style.opacity = '0.85';
        }
    });
});
