/**
 * Script for the new idiibi header
 * Handles the interactive functionality of the header
 * Supports multilingual switching between Arabic and English
 */

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const header = document.querySelector('.new-header');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navItems = document.querySelectorAll('.new-header .nav-item.has-dropdown');
    const glowEffect = document.querySelector('.new-header .glow-effect');

    // Efecto de scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Toggle del menú móvil
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');

            // Prevenir scroll cuando el menú está abierto
            if (mainNav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    // Manejo de dropdowns en móvil
    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');

        link.addEventListener('click', function(e) {
            // Solo en vista móvil
            if (window.innerWidth <= 992) {
                e.preventDefault();
                item.classList.toggle('dropdown-open');

                // Cerrar otros dropdowns
                navItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('dropdown-open');
                    }
                });
            }
        });
    });

    // Efecto de iluminación al mover el mouse
    if (glowEffect) {
        header.addEventListener('mousemove', function(e) {
            const rect = header.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            glowEffect.style.left = `${x - 75}px`;
            glowEffect.style.top = `${y - 75}px`;
            glowEffect.style.opacity = '1';
        });

        header.addEventListener('mouseleave', function() {
            glowEffect.style.opacity = '0';
        });
    }

    // Cerrar el menú móvil al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.new-header .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 992 && !this.parentElement.classList.contains('has-dropdown')) {
                mobileToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Cerrar el menú móvil al hacer clic fuera de él
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 992 && mainNav.classList.contains('active')) {
            if (!e.target.closest('.new-header')) {
                mobileToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Mark the active link based on the current page
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks2 = document.querySelectorAll('.new-header .nav-link');

    navLinks2.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Language switcher functionality
    const langSwitch = document.getElementById('lang-switch');
    if (langSwitch) {
        langSwitch.addEventListener('click', function(e) {
            // Store the current language preference in localStorage
            const currentLang = document.documentElement.lang;
            localStorage.setItem('preferredLanguage', currentLang === 'ar' ? 'en' : 'ar');

            // The actual navigation happens through the href attribute
            // No need to prevent default or add additional navigation code
        });
    }

    // Check if there's a stored language preference on page load
    const storedLang = localStorage.getItem('preferredLanguage');
    if (storedLang) {
        const currentLang = document.documentElement.lang;

        // If the stored preference doesn't match the current page language,
        // and we're on the homepage, redirect to the preferred language version
        if (storedLang !== currentLang && (currentPage === '' || currentPage === 'index.html')) {
            if (storedLang === 'en') {
                window.location.href = 'en/index.html';
            } else {
                // If we're already in the /en/ directory, go up one level
                if (window.location.pathname.includes('/en/')) {
                    window.location.href = '../index.html';
                }
            }
        }
    }
});
