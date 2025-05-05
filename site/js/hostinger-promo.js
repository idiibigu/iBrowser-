document.addEventListener('DOMContentLoaded', function() {
    // Fade-in animations
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    fadeElements.forEach(element => {
        fadeInObserver.observe(element);
    });
    
    // Accordion functionality
    const accordions = document.querySelectorAll('.hostinger-accordion');
    
    accordions.forEach(accordion => {
        const header = accordion.querySelector('.hostinger-accordion-header');
        
        header.addEventListener('click', () => {
            accordion.classList.toggle('active');
        });
    });
    
    // Countdown timer
    const countdownElement = document.getElementById('hostinger-countdown');
    if (countdownElement) {
        // Set the countdown date to 3 days from now
        const countdownDate = new Date();
        countdownDate.setDate(countdownDate.getDate() + 3);
        
        function updateCountdown() {
            const now = new Date().getTime();
            const distance = countdownDate - now;
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            
            if (distance < 0) {
                clearInterval(countdownInterval);
                countdownElement.innerHTML = "العرض انتهى!";
            }
        }
        
        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000);
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Track referral link clicks
    const referralLinks = document.querySelectorAll('.hostinger-referral-link');
    
    referralLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // You can add analytics tracking here if needed
            console.log('Referral link clicked: ' + this.href);
        });
    });
});
