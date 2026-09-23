document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. THEME TOGGLE LOGIC ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('ph-moon', 'ph-sun');
    }
    
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        let targetTheme = 'light';
        
        if (currentTheme === 'light' || !currentTheme) {
            targetTheme = 'dark';
            themeIcon.classList.replace('ph-moon', 'ph-sun');
        } else {
            targetTheme = 'light';
            themeIcon.classList.replace('ph-sun', 'ph-moon');
        }
        
        document.documentElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('theme', targetTheme);
    });

    // --- 2. MOBILE MENU ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    
    mobileMenuBtn.addEventListener('click', () => {
        if (navList.style.display === 'flex') {
            navList.style.display = 'none';
        } else {
            navList.style.display = 'flex';
            navList.style.flexDirection = 'column';
            navList.style.position = 'absolute';
            navList.style.top = '100%';
            navList.style.left = '0';
            navList.style.width = '100%';
            navList.style.backgroundColor = 'var(--color-glass-bg)';
            navList.style.backdropFilter = 'blur(12px)';
            navList.style.padding = '2rem 0';
            navList.style.boxShadow = 'var(--color-glass-shadow)';
        }
    });

    // --- 3. LENIS SMOOTH SCROLL ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        smooth: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // --- 4. CUSTOM CURSOR & MAGNETIC BUTTONS ---
    const cursor = document.querySelector('.cursor');
    const magneticElements = document.querySelectorAll('[data-cursor="-magnetic"]');
    const pointerElements = document.querySelectorAll('[data-cursor="-pointer"], a, button');

    let mouse = { x: 0, y: 0 };
    let cursorObj = { x: 0, y: 0 };
    let isHoveringMagnetic = false;

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Smooth cursor follow
    gsap.ticker.add(() => {
        if (!isHoveringMagnetic) {
            // Normal easing follow
            cursorObj.x += (mouse.x - cursorObj.x) * 0.15;
            cursorObj.y += (mouse.y - cursorObj.y) * 0.15;
            gsap.set(cursor, { x: cursorObj.x, y: cursorObj.y });
        }
    });

    // Pointer hover effect (grow cursor)
    pointerElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    // Magnetic pull effect
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            isHoveringMagnetic = true;
            const rect = el.getBoundingClientRect();
            const hx = rect.left + rect.width / 2;
            const hy = rect.top + rect.height / 2;
            
            // Pull element
            gsap.to(el, {
                x: (e.clientX - hx) * 0.3,
                y: (e.clientY - hy) * 0.3,
                duration: 0.3,
                ease: "power2.out"
            });
            
            // Pull cursor exactly to center of element
            gsap.to(cursor, {
                x: hx + (e.clientX - hx) * 0.1,
                y: hy + (e.clientY - hy) * 0.1,
                duration: 0.1
            });
        });

        el.addEventListener('mouseleave', () => {
            isHoveringMagnetic = false;
            // Reset element
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        });
    });

    // --- 5. GSAP ANIMATIONS & PRELOADER ---
    gsap.registerPlugin(ScrollTrigger);

    // Split text
    const splitTexts = document.querySelectorAll('[data-gsap="split-text"]');
    splitTexts.forEach(text => {
        new SplitType(text, { types: 'words, chars' });
    });

    // Preloader Timeline
    const tlPreloader = gsap.timeline();

    // Start by locking scroll
    lenis.stop();
    document.body.style.overflow = 'hidden';

    tlPreloader.to('.preloader-progress', {
        innerText: "100%",
        duration: 2,
        snap: { innerText: 1 },
        ease: "power2.inOut"
    })
    .to('.preloader-text', {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.in"
    }, "+=0.2")
    .to('.preloader-progress', {
        opacity: 0,
        duration: 0.5
    }, "<")
    .to('.door-left', {
        xPercent: -100,
        duration: 1.2,
        ease: "power4.inOut"
    }, "<")
    .to('.door-right', {
        xPercent: 100,
        duration: 1.2,
        ease: "power4.inOut"
    }, "<")
    .set('.preloader', {
        display: "none"
    })
    .call(() => {
        lenis.start();
        document.body.style.overflow = '';
    }, null, "-=0.2")
    // Intro Animations for Hero
    .fromTo('.hero-title .char', 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.02, duration: 1, ease: "power4.out" },
        "-=0.5"
    )
    .to('.hero-subtitle', { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.6")
    .to('.hero-content .btn', { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.6");

    // Scroll Animations
    
    // Scroll Animations


    // Fade up elements
    const fadeUpElements = document.querySelectorAll('[data-gsap="fade-up"]:not(.hero-subtitle):not(.hero-content .btn)');
    fadeUpElements.forEach(el => {
        gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
            }
        });
    });

    // Scroll Triggered Split Text
    const scrollSplitTexts = document.querySelectorAll('[data-gsap="split-text"]:not(.hero-title)');
    scrollSplitTexts.forEach(text => {
        const chars = text.querySelectorAll('.char');
        gsap.fromTo(chars, 
            { y: 50, opacity: 0 },
            { 
                y: 0, opacity: 1, stagger: 0.015, duration: 0.8, ease: "power4.out",
                scrollTrigger: {
                    trigger: text,
                    start: "top 85%"
                }
            }
        );
    });

    // Staggered Cards (Services)
    ScrollTrigger.batch('[data-gsap="stagger-card"]', {
        start: "top 80%",
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: "power3.out" }),
        onLeaveBack: batch => gsap.to(batch, { opacity: 0, y: 50, overwrite: true })
    });

    // --- 6. GOOGLE SHEETS FETCH (For Promo & Services) ---
    const servicesContainer = document.getElementById('full-services-container');
    const loadingText = document.getElementById('services-loading');
    const promoBanner = document.getElementById('promo-banner');

    // REPLACE THIS URL WITH YOUR PUBLISHED CSV LINK
    const googleSheetCSVUrl = 'INSERT_YOUR_GOOGLE_SHEET_CSV_LINK_HERE';

    // We fetch globally so the promo banner works on all pages
    fetch(googleSheetCSVUrl)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
        })
        .then(csvText => {
            // Parse CSV
            const rows = csvText.split('\n').map(row => {
                return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            });
            
            rows.shift(); // Remove header row
            
            // 1. Check for PROMO Banner row
            const promoRow = rows.find(row => row.length >= 3 && row[0].replace(/^"|"$/g, '').trim().toUpperCase() === 'PROMO');
            if (promoRow && promoBanner) {
                const status = promoRow[1].replace(/^"|"$/g, '').trim().toUpperCase();
                const text = promoRow[2].replace(/^"|"$/g, '').trim();
                
                if (status === 'ON') {
                    const promoTextEl = document.getElementById('promo-text');
                    if (promoTextEl) promoTextEl.innerText = text;
                    promoBanner.style.display = 'flex';
                }
            }

            // 2. Render Services (only on services.html)
            if (servicesContainer) {
                const categories = {};
                rows.forEach(row => {
                    if (row.length >= 3) {
                        const category = row[0].replace(/^"|"$/g, '').trim();
                        const serviceName = row[1].replace(/^"|"$/g, '').trim();
                        const price = row[2].replace(/^"|"$/g, '').trim();
                        
                        // Skip the PROMO row when rendering services
                        if (category.toUpperCase() === 'PROMO') return;
                        
                        if (category && serviceName) {
                            if (!categories[category]) {
                                categories[category] = [];
                            }
                            categories[category].push({ name: serviceName, price: price });
                        }
                    }
                });

                if (loadingText) loadingText.remove();
                
                for (const [category, services] of Object.entries(categories)) {
                    const card = document.createElement('div');
                    card.className = 'service-card';
                    card.style.opacity = 1; 
                    card.style.transform = 'translateY(0)';
                    
                    let html = `<h3 class="service-title" style="margin-bottom: 1.5rem;">${category}</h3><ul class="service-list">`;
                    
                    services.forEach(service => {
                        let displayPrice = service.price;
                        if (displayPrice && !displayPrice.toLowerCase().includes('lkr')) {
                            displayPrice = `LKR ${displayPrice}`;
                        }
                        
                        html += `<li><span>${service.name}</span> <span>${displayPrice}</span></li>`;
                    });
                    
                    html += `</ul>`;
                    card.innerHTML = html;
                    servicesContainer.appendChild(card);
                }
                
                const newCards = servicesContainer.querySelectorAll('.service-card');
                newCards.forEach(card => {
                    card.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
                    card.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
                });
            }
        })
        .catch(error => {
            console.error("Error fetching Google Sheet:", error);
            if (loadingText && servicesContainer) {
                loadingText.innerText = "ADD More Menu Items to Display Here";
                loadingText.style.color = "var(--color-accent)";
            }
        });

    // --- 7. PROMO BANNER LOGIC ---
    const closePromoBtn = document.getElementById('close-promo');
    
    if (closePromoBtn && promoBanner) {
        closePromoBtn.addEventListener('click', () => {
            promoBanner.style.display = 'none';
        });
    }

    // --- 8. PARALLAX IMAGES ---
    const parallaxImages = document.querySelectorAll('[data-gsap="parallax"]');
    parallaxImages.forEach(img => {
        gsap.to(img, {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

});
