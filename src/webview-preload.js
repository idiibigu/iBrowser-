// This script will be loaded in the webview context
// It can be used to inject custom CSS or JavaScript into the loaded page

// Function to inject custom CSS
function injectCustomCSS() {
    const style = document.createElement('style');
    style.textContent = `
        /* Custom styles for better integration with the desktop app */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(30, 41, 59, 0.2);
            border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: rgba(3, 131, 135, 0.5);
            border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(3, 131, 135, 0.7);
        }
        
        /* Add smooth transitions */
        a, button, input, select, textarea {
            transition: all 0.3s ease !important;
        }
        
        /* Improve focus states */
        a:focus, button:focus, input:focus, select:focus, textarea:focus {
            outline: 2px solid rgba(3, 131, 135, 0.5) !important;
            outline-offset: 2px !important;
        }
    `;
    document.head.appendChild(style);
}

// Function to enhance page navigation with animations
function enhanceNavigation() {
    // Add page transition animations
    document.addEventListener('click', (e) => {
        // Only handle link clicks
        if (e.target.tagName === 'A' || e.target.closest('a')) {
            const link = e.target.tagName === 'A' ? e.target : e.target.closest('a');
            
            // Only handle internal links
            if (link.href && link.href.startsWith(window.location.origin) && !link.target && !e.ctrlKey && !e.metaKey) {
                // Add fade-out effect
                document.body.style.opacity = '0.5';
                document.body.style.transition = 'opacity 0.3s ease';
            }
        }
    });
    
    // Fade in when page loads
    window.addEventListener('load', () => {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });
}

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    injectCustomCSS();
    enhanceNavigation();
    
    // Log that the preload script has run
    console.log('Webview preload script executed');
});
