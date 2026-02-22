// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
    
    // Highlight active menu item
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Ad View Tracking (Legitimate - optional)
    const watchAdBtn = document.getElementById('watch-ad-btn');
    if (watchAdBtn) {
        watchAdBtn.addEventListener('click', function() {
            // This just simulates an ad view
            // In reality, AdSense Auto Ads would show automatically
            alert('Thank you for supporting our community! You now have priority registration.');
            
            // Track the view (optional)
            trackAdView();
        });
    }
    
    // Contest Registration Form
    const contestForm = document.getElementById('contest-form');
    if (contestForm) {
        contestForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                gamertag: document.getElementById('gamertag').value,
                email: document.getElementById('email').value,
                game: document.getElementById('game').value,
                teamName: document.getElementById('team').value || 'Solo Player'
            };
            
            // Show loading state
            const submitBtn = contestForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Registering...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/register-contest', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Hide form, show success message
                    contestForm.style.display = 'none';
                    document.getElementById('success-message').style.display = 'block';
                    
                    // Track successful registration in analytics
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'contest_registration', {
                            'game': formData.game
                        });
                    }
                } else {
                    alert('Registration failed: ' + data.error);
                }
            } catch (error) {
                alert('Error registering. Please try again.');
                console.error('Registration error:', error);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Load live stats
    async function loadStats() {
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();
            
            // Update stats in hero section
            const statElements = document.querySelectorAll('.stat-number');
            if (statElements.length >= 3) {
                statElements[0].textContent = stats.totalMembers + '+';
                statElements[1].textContent = stats.activeContests + '+';
                statElements[2].textContent = '$' + (stats.activeContests * 500) + '+';
            }
            
            // Update online count
            const onlineElement = document.querySelector('.online-count');
            if (onlineElement) {
                onlineElement.innerHTML = `<i class="fas fa-circle"></i> ${stats.onlineNow} online`;
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }
    
    // Track ad view (legitimate)
    function trackAdView() {
        // This just sends a tracking event
        // It doesn't force ad clicks
        fetch('/api/track-ad-view', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: localStorage.getItem('userId') || 'anonymous'
            })
        }).catch(error => console.log('Ad tracking:', error));
    }
    
    // Initialize
    loadStats();
    
    // Refresh stats every 30 seconds
    setInterval(loadStats, 30000);
    
    // Lazy load images for better performance
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});