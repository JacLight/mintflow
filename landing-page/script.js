// Mintflow Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    initMobileMenu();
    
    // Smooth scrolling for anchor links
    initSmoothScroll();
    
    // Animation on scroll (simple implementation)
    initScrollAnimations();
});

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
    const menuButton = document.querySelector('button.md\\:hidden');
    const mobileMenu = document.createElement('div');
    
    // Create mobile menu
    mobileMenu.className = 'fixed inset-0 bg-gray-900/95 z-50 flex items-center justify-center transform transition-transform duration-300 translate-x-full';
    mobileMenu.innerHTML = `
        <div class="w-full max-w-sm p-8">
            <div class="flex justify-end mb-8">
                <button class="text-white" aria-label="Close mobile menu">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            <ul class="flex flex-col space-y-6 text-center">
                <li><a href="#features" class="text-xl text-gray-300 hover:text-white transition">Features</a></li>
                <li><a href="#about" class="text-xl text-gray-300 hover:text-white transition">About</a></li>
                <li><a href="#documentation" class="text-xl text-gray-300 hover:text-white transition">Docs</a></li>
                <li><a href="#waitlist" class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition inline-block mt-4">Join Waitlist</a></li>
            </ul>
        </div>
    `;
    document.body.appendChild(mobileMenu);
    
    // Toggle mobile menu
    menuButton.addEventListener('click', function() {
        mobileMenu.classList.remove('translate-x-full');
    });
    
    // Close mobile menu
    const closeButton = mobileMenu.querySelector('button');
    closeButton.addEventListener('click', function() {
        mobileMenu.classList.add('translate-x-full');
    });
    
    // Close mobile menu when clicking on links
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('translate-x-full');
        });
    });
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Offset for fixed header
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize animations on scroll
 */
function initScrollAnimations() {
    // Simple implementation - could be enhanced with a library like AOS
    const animatedElements = document.querySelectorAll('.bg-gray-800\\/50');
    
    // Create an observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-8');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // Observe each element
    animatedElements.forEach(element => {
        element.classList.add('transition', 'duration-700', 'opacity-0', 'translate-y-8');
        observer.observe(element);
    });
}

/**
 * Form submission handler for waitlist
 */
document.addEventListener('DOMContentLoaded', function() {
    const waitlistForm = document.querySelector('#waitlist-form');
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email && isValidEmail(email)) {
                // In a real implementation, this would send the data to a server
                // For now, just show a success message
                const formContainer = this.parentElement;
                
                // Create success message
                const successMessage = document.createElement('div');
                successMessage.className = 'bg-green-500/20 text-green-400 px-4 py-3 rounded-md mt-4';
                successMessage.innerHTML = `
                    <div class="flex items-center">
                        <i class="fas fa-check-circle mr-2"></i>
                        <p>Thank you for joining our waitlist! We'll keep you updated on our launch.</p>
                    </div>
                `;
                
                // Replace form with success message
                this.classList.add('hidden');
                formContainer.appendChild(successMessage);
            } else {
                // Show error for invalid email
                emailInput.classList.add('border-red-500', 'focus:ring-red-500');
                
                // Remove error styling after 3 seconds
                setTimeout(() => {
                    emailInput.classList.remove('border-red-500', 'focus:ring-red-500');
                }, 3000);
            }
        });
    }
});

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
