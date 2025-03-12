document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only apply to links that point to an ID on the page
            if (this.getAttribute('href').startsWith('#') && this.getAttribute('href').length > 1) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Offset for fixed header
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    if (mobileMenu.classList.contains('active')) {
                        toggleMobileMenu();
                    }
                }
            }
        });
    });
    
    // Mobile menu toggle
    const menuButton = document.querySelector('button[aria-label="Open mobile menu"]');
    const mobileMenu = document.createElement('div');
    mobileMenu.classList.add('mobile-menu', 'fixed', 'inset-0', 'bg-white', 'z-40', 'transform', 'translate-x-full', 'transition-transform', 'duration-300', 'ease-in-out', 'flex', 'flex-col', 'p-6', 'pt-24');
    document.body.appendChild(mobileMenu);
    
    // Clone navigation links for mobile menu
    const navLinksContainer = document.querySelector('nav ul');
    if (navLinksContainer) {
        const navLinksClone = navLinksContainer.cloneNode(true);
        navLinksClone.classList.remove('hidden', 'md:block', 'space-x-6');
        navLinksClone.classList.add('flex', 'flex-col', 'space-y-4');
        
        const navLinksCloneItems = navLinksClone.querySelectorAll('li');
        navLinksCloneItems.forEach(item => {
            item.classList.add('text-lg', 'font-medium');
        });
        
        mobileMenu.appendChild(navLinksClone);
    }
    
    // Add close button to mobile menu
    const closeButton = document.createElement('button');
    closeButton.classList.add('absolute', 'top-6', 'right-6', 'text-black');
    closeButton.innerHTML = '<i class="fas fa-times text-xl"></i>';
    closeButton.setAttribute('aria-label', 'Close mobile menu');
    mobileMenu.appendChild(closeButton);
    
    function toggleMobileMenu() {
        if (mobileMenu.classList.contains('translate-x-full')) {
            mobileMenu.classList.remove('translate-x-full');
            mobileMenu.classList.add('translate-x-0');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
        } else {
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('translate-x-full');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }
    
    menuButton.addEventListener('click', toggleMobileMenu);
    closeButton.addEventListener('click', toggleMobileMenu);
    
    // Workflow animation
    const workflowNodes = document.querySelectorAll('.workflow-node');
    
    // Add animation to workflow nodes
    workflowNodes.forEach(node => {
        node.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
        
        node.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
    
    // Add workflow lines between nodes (visual connection)
    const workflowContainer = document.querySelector('.workflow-container');
    
    if (workflowContainer && workflowNodes.length >= 2) {
        // Create lines between nodes
        for (let i = 0; i < workflowNodes.length - 1; i++) {
            const startNode = workflowNodes[i];
            const endNode = workflowNodes[i + 1];
            
            const line = document.createElement('div');
            line.classList.add('workflow-line');
            workflowContainer.appendChild(line);
            
            // Position the line to connect the nodes
            const updateLinePosition = () => {
                const startRect = startNode.getBoundingClientRect();
                const endRect = endNode.getBoundingClientRect();
                const containerRect = workflowContainer.getBoundingClientRect();
                
                // Calculate center points relative to the container
                const startX = startRect.left + startRect.width / 2 - containerRect.left;
                const startY = startRect.top + startRect.height / 2 - containerRect.top;
                const endX = endRect.left + endRect.width / 2 - containerRect.left;
                const endY = endRect.top + endRect.height / 2 - containerRect.top;
                
                // Calculate line length and angle
                const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
                
                // Position and rotate the line
                line.style.width = `${length}px`;
                line.style.left = `${startX}px`;
                line.style.top = `${startY}px`;
                line.style.transform = `rotate(${angle}deg)`;
                line.style.transformOrigin = '0 0';
            };
            
            // Initial positioning
            updateLinePosition();
            
            // Update on window resize
            window.addEventListener('resize', updateLinePosition);
        }
    }
    
    // Typing animation for the AI chat
    const aiChatText = document.querySelector('.bg-mint\\/10');
    
    if (aiChatText) {
        const originalText = aiChatText.textContent.trim();
        aiChatText.textContent = '';
        aiChatText.classList.add('typing-animation');
        
        let charIndex = 0;
        const typingInterval = setInterval(() => {
            if (charIndex < originalText.length) {
                aiChatText.textContent += originalText.charAt(charIndex);
                charIndex++;
            } else {
                clearInterval(typingInterval);
                setTimeout(() => {
                    aiChatText.classList.remove('typing-animation');
                }, 1000);
            }
        }, 50);
    }
});
