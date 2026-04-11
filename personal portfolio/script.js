// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Theme Toggle ---
    const themeBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('portfolio_theme');
    if (savedTheme) {
        htmlEl.setAttribute('data-theme', savedTheme);
    } else {
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        htmlEl.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
    }

    themeBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('portfolio_theme', newTheme);
    });

    // --- 2. Sticky Navbar ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- 3. Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');
    // Also grab progress bars to animate width when in view
    const progressBars = document.querySelectorAll('.progress');

    const revealSettings = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it's a skills section, animate the bars
                if (entry.target.id === 'skills') {
                    progressBars.forEach(bar => {
                        const targetWidth = bar.getAttribute('style').match(/--target-width:\s*([^;]+);/)[1];
                        bar.style.width = targetWidth;
                    });
                }
                
                // Optionally stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, revealSettings);

    revealElements.forEach(el => revealObserver.observe(el));

    // --- 4. 3D Tilt Effect on Hover ---
    const tiltCards = document.querySelectorAll('.tilt');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            // Get dimensions and coordinates
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Maximum tilt rotation (in degrees)
            const maxTilt = 10;
            
            // Calculate rotation based on cursor distance from center
            const rotateX = ((y - centerY) / centerY) * -maxTilt;
            const rotateY = ((x - centerX) / centerX) * maxTilt;
            
            // Apply transform
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset to default
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
        });
        
        card.addEventListener('mouseenter', () => {
            // Remove transition quickly for snappy tracking
            card.style.transition = 'none';
        });
    });

    // --- 5. Form Validation ---
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            
            const nameEl = document.getElementById('name');
            const emailEl = document.getElementById('email');
            const msgEl = document.getElementById('message');
            
            // Reset errors
            document.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));
            
            // Name validation
            if (!nameEl.value.trim()) {
                nameEl.parentElement.classList.add('error');
                isValid = false;
            }
            
            // Email validation (simple regex)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailEl.value.trim())) {
                emailEl.parentElement.classList.add('error');
                isValid = false;
            }
            
            // Message Validation
            if (!msgEl.value.trim()) {
                msgEl.parentElement.classList.add('error');
                isValid = false;
            }
            
            if (isValid) {
                // Success animation/logic
                const btn = contactForm.querySelector('.submit-btn');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<span>Message Sent! ✓</span>';
                btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
                contactForm.reset();
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                }, 3000);
            }
        });
    }
});
