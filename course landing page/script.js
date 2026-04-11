document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Mobile Navigation Toggle ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-link');

    // Toggle menu
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Animate hamburger to X
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when a link is clicked
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // --- 2. Sticky Navbar & Active Section Highlighting ---
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('.section');

    window.addEventListener('scroll', () => {
        // Sticky Navbar effect
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active State Link Highlighting
        let current = '';
        const scrollPosition = window.scrollY + 200; // Offset for better accuracy

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinksItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // --- 3. Smooth Scrolling for Internal Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Fixed offset top to account for sticky navbar height
                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 4. Contact Form Validation and Simulation ---
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        // Helper function to validate email using Regex
        const isValidEmail = email => {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        };

        const validateField = (input, validator) => {
            const parent = input.parentElement;
            if (validator(input.value.trim())) {
                parent.classList.remove('error');
                return true;
            } else {
                parent.classList.add('error');
                return false;
            }
        };

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            // Validate all fields
            const isNameValid = validateField(nameInput, val => val !== '');
            const isEmailValid = validateField(emailInput, val => val !== '' && isValidEmail(val));
            const isMessageValid = validateField(messageInput, val => val !== '');
            
            // If completely valid, simulate sending process
            if (isNameValid && isEmailValid && isMessageValid) {
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                // Show loading state
                submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.8';
                
                // Simulate network request delay
                setTimeout(() => {
                    // Success state
                    submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Message Sent Successfully';
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)'; // Green gradient
                    submitBtn.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                    
                    // Reset form
                    this.reset();
                    
                    // Revert button after 4 seconds
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        submitBtn.style.background = ''; // Reverts to CSS default
                        submitBtn.style.boxShadow = '';
                        submitBtn.style.opacity = '1';
                    }, 4000);
                }, 1500);
            }
        });
        
        // Real-time validation removal on user input
        const inputs = contactForm.querySelectorAll('input, document');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.parentElement.classList.remove('error');
            });
        });
    }
});
