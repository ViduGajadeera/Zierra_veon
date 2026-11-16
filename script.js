document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. AYUBOWAN WELCOME OVERLAY
    // =========================================================
    const overlay = document.getElementById('ayubowanOverlay');

    if (overlay) {
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            overlay.classList.add('hidden');
            setTimeout(() => {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
                animateHeroEntrance();
            }, 850);
        }, 2200);
    } else {
        animateHeroEntrance();
    }

    // =========================================================
    // 2. LENIS SMOOTH SCROLL
    // =========================================================
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

    // =========================================================
    // 3. GSAP + ScrollTrigger
    // =========================================================
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance animation (called after overlay fades)
    function animateHeroEntrance() {
        const heroEls = [
            '.hero-eyebrow',
            '.hero-title',
            '.hero-sub',
            '.hero-body .btn-pill'
        ];

        heroEls.forEach((sel, i) => {
            const el = document.querySelector(sel);
            if (!el) return;
            gsap.to(el, {
                y: 0,
                opacity: 1,
                duration: 1,
                delay: 0.15 * i,
                ease: 'power3.out'
            });
        });
    }

    // Scroll-triggered fade-up elements
    // (hero elements are excluded — they animate on load)
    const fadeUpEls = document.querySelectorAll(
        '[data-gsap="fade-up"]:not(.hero-eyebrow):not(.hero-title):not(.hero-sub)'
    );

    fadeUpEls.forEach(el => {
        const delay = parseFloat(el.getAttribute('data-delay') || '0');
        gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 1,
            delay,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 88%',
            }
        });
    });

    // Staggered service cards
    ScrollTrigger.batch('[data-gsap="stagger-card"]', {
        start: 'top 82%',
        onEnter: batch => gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power3.out'
        }),
        onLeaveBack: batch => gsap.to(batch, {
            opacity: 0,
            y: 40,
            overwrite: true
        })
    });

    // Parent section fade-up (showcases, cta, etc.)
    document.querySelectorAll('[data-gsap="fade-up"]:not(.hero-eyebrow):not(.hero-title):not(.hero-sub)').forEach(el => {
        // already handled above, skip duplicates
    });

    // Section-level fade-in for showcase/cta etc.
    document.querySelectorAll('.showcase, .showcase-fullbleed, .cta-section, .intro-text, .services-teaser').forEach(section => {
        // The child [data-gsap] elements handle their own entrance
        // so we just ensure ScrollTrigger refreshes
    });

    // =========================================================
    // 4. PARALLAX IMAGES
    // =========================================================
    document.querySelectorAll('[data-gsap="parallax"]').forEach(img => {
        gsap.to(img, {
            yPercent: 15,
            ease: 'none',
            scrollTrigger: {
                trigger: img.closest('.showcase-media, .showcase-fullbleed, .hero-bg') || img.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    });

    // =========================================================
    // 5. HEADER — scroll opacity
    // =========================================================
    const header = document.getElementById('siteHeader');
    if (header) {
        ScrollTrigger.create({
            start: 'top -60',
            onUpdate: self => {
                if (self.scroll() > 60) {
                    header.style.boxShadow = '0 1px 0 rgba(0,0,0,0.1)';
                } else {
                    header.style.boxShadow = 'none';
                }
            }
        });
    }

    // =========================================================
    // 6. MOBILE MENU
    // =========================================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = mobileNav.classList.toggle('open');
            mobileMenuBtn.classList.toggle('open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close on link click
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                mobileMenuBtn.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // =========================================================
    // 7. GOOGLE SHEETS CSV FETCH (Promo Banner, Services page, Home Teaser)
    // =========================================================
    const servicesContainer = document.getElementById('full-services-container');
    const loadingText = document.getElementById('services-loading');
    const promoBanner = document.getElementById('promo-banner');
    const homeServicesGrid = document.getElementById('home-services-grid');

    // Published Google Sheet CSV URL
    const googleSheetCSVUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_4qiLeKQdrotj1T9Ln9QZC7iFSNI4FCaxcsAKeWNte0ohWAOhhNZ9J8jsTeyLYM8zmaQ0R9jHpc7u/pub?gid=0&single=true&output=csv';

    fetch(googleSheetCSVUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(csvText => {
            // Parse CSV (handles quoted commas & carriage returns)
            const rows = csvText
                .replace(/\r/g, '')
                .split('\n')
                .filter(line => line.trim().length > 0)
                .map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));

            rows.shift(); // Remove header row

            // --- Promo Banner ---
            const promoRow = rows.find(row =>
                row.length >= 3 &&
                row[0].replace(/^"|"$/g, '').trim().toUpperCase() === 'PROMO'
            );

            if (promoRow && promoBanner) {
                const status = promoRow[1].replace(/^"|"$/g, '').trim().toUpperCase();
                const text   = promoRow[2].replace(/^"|"$/g, '').trim();

                if (status === 'ON') {
                    const promoTextEl = document.getElementById('promo-text');
                    if (promoTextEl) promoTextEl.innerText = text;
                    promoBanner.style.display = 'flex';
                }
            }

            // Group all services and calculate minimum prices per category
            const categories = {};
            const schemaOffers = [];
            const minPrices = {
                Gents: Infinity,
                Ladies: Infinity,
                Beauty: Infinity,
                Facials: Infinity
            };

            rows.forEach(row => {
                if (row.length >= 3) {
                    const category    = row[0].replace(/^"|"$/g, '').trim();
                    const serviceName = row[1].replace(/^"|"$/g, '').trim();
                    const price       = row[2].replace(/^"|"$/g, '').trim();

                    if (category.toUpperCase() === 'PROMO') return;

                    if (category && serviceName) {
                        if (!categories[category]) categories[category] = [];
                        categories[category].push({ name: serviceName, price });

                        // Extract numerical price
                        const numericPriceMatch = price.replace(/,/g, '').match(/\d+/);
                        const numericVal = numericPriceMatch ? parseInt(numericPriceMatch[0], 10) : null;

                        if (numericVal !== null && !isNaN(numericVal)) {
                            const catLower = category.toLowerCase();
                            if (catLower.includes('gent')) {
                                minPrices.Gents = Math.min(minPrices.Gents, numericVal);
                            } else if (catLower.includes('lad')) {
                                minPrices.Ladies = Math.min(minPrices.Ladies, numericVal);
                            } else if (catLower.includes('beauty') || catLower.includes('pedicure') || catLower.includes('manicure') || catLower.includes('nail') || catLower.includes('threading')) {
                                minPrices.Beauty = Math.min(minPrices.Beauty, numericVal);
                            } else if (catLower.includes('facial') || catLower.includes('clean up')) {
                                minPrices.Facials = Math.min(minPrices.Facials, numericVal);
                            }
                        }

                        schemaOffers.push({
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": serviceName,
                                "category": category
                            },
                            ...(numericVal ? { "price": String(numericVal), "priceCurrency": "LKR" } : {})
                        });
                    }
                }
            });

            // Update Home Page "What We Offer" Teaser Cards dynamically from Google Sheet
            if (homeServicesGrid) {
                const cards = homeServicesGrid.querySelectorAll('.service-apple-card');
                cards.forEach(card => {
                    const catKey = card.getAttribute('data-category');
                    const priceEl = card.querySelector('.service-from');
                    if (catKey && minPrices[catKey] && minPrices[catKey] !== Infinity && priceEl) {
                        priceEl.textContent = `From LKR ${minPrices[catKey].toLocaleString()}`;
                    }
                });
            }

            // --- Services Grid (services.html only) ---
            if (servicesContainer) {
                if (loadingText) loadingText.remove();

                // If Google Sheet rows are loaded, clear initial static placeholder cards
                const staticCards = servicesContainer.querySelectorAll('.static-card');
                if (Object.keys(categories).length > 0) {
                    staticCards.forEach(c => c.remove());
                }

                for (const [category, services] of Object.entries(categories)) {
                    const card = document.createElement('div');
                    card.className = 'price-card';

                    const title = document.createElement('h3');
                    title.className = 'service-title';
                    title.textContent = category;
                    card.appendChild(title);

                    const list = document.createElement('ul');
                    list.className = 'service-list';

                    services.forEach(s => {
                        let displayPrice = s.price;
                        if (displayPrice && !displayPrice.toLowerCase().includes('lkr')) {
                            displayPrice = `LKR ${displayPrice}`;
                        }

                        const li = document.createElement('li');
                        const nameSpan = document.createElement('span');
                        nameSpan.textContent = s.name;

                        const priceSpan = document.createElement('span');
                        priceSpan.textContent = displayPrice;

                        li.appendChild(nameSpan);
                        li.appendChild(priceSpan);
                        list.appendChild(li);
                    });

                    card.appendChild(list);
                    servicesContainer.appendChild(card);
                }

                // Inject Structured Data (Schema.org) for Search Engines & AI Agents
                if (schemaOffers.length > 0) {
                    const existingLd = document.getElementById('ai-price-schema');
                    if (existingLd) existingLd.remove();

                    const scriptLd = document.createElement('script');
                    scriptLd.id = 'ai-price-schema';
                    scriptLd.type = 'application/ld+json';
                    scriptLd.textContent = JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "HairSalon",
                        "name": "Zierra Veon",
                        "url": "https://zierraveon.com",
                        "hasOfferCatalog": {
                            "@type": "OfferCatalog",
                            "name": "Zierra Veon Price & Services List",
                            "itemListElement": schemaOffers
                        }
                    });
                    document.head.appendChild(scriptLd);
                }
            }
        })
        .catch(error => {
            console.warn('Google Sheet fetch failed:', error);
            if (loadingText && servicesContainer) {
                loadingText.textContent = 'Prices coming soon — call us on 074 31 81 001';
                loadingText.style.color = 'var(--apple-gray)';
            }
        });

    // =========================================================
    // 8. PROMO BANNER — close button
    // =========================================================
    const closePromoBtn = document.getElementById('close-promo');
    if (closePromoBtn && promoBanner) {
        closePromoBtn.addEventListener('click', () => {
            promoBanner.style.display = 'none';
        });
    }

    // =========================================================
    // 9. PAGE TRANSITIONS — simple fade via page-veil
    // =========================================================
    const pageVeil = document.getElementById('pageVeil');

    function showVeil(callback) {
        if (!pageVeil) { callback(); return; }
        pageVeil.classList.add('active');
        setTimeout(callback, 400);
    }

    function hideVeil() {
        if (!pageVeil) return;
        setTimeout(() => {
            pageVeil.classList.remove('active');
        }, 50);
    }

    // Hide veil on page load (in case back-forward cache restores it)
    hideVeil();

    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function (e) {
            const targetUrl = this.getAttribute('href');

            // Skip: empty, external, new-tab, mailto, tel, hash-only
            if (
                !targetUrl ||
                this.getAttribute('target') === '_blank' ||
                targetUrl.startsWith('http') ||
                targetUrl.startsWith('mailto:') ||
                targetUrl.startsWith('tel:') ||
                targetUrl.startsWith('#')
            ) {
                return;
            }

            const [targetPage, targetAnchor] = targetUrl.split('#');

            // Normalize paths
            let currentPath = window.location.pathname;
            if (currentPath.endsWith('/') || currentPath.endsWith('index.html')) currentPath = '/';
            else if (currentPath.endsWith('services') || currentPath.endsWith('services.html')) currentPath = '/services';

            let normalTarget = targetPage;
            if (!normalTarget || normalTarget === './' || normalTarget === '/') normalTarget = '/';
            else if (normalTarget === 'services' || normalTarget.endsWith('services.html')) normalTarget = '/services';

            // Same-page navigation (possibly with hash)
            if (normalTarget === currentPath || normalTarget === '') {
                e.preventDefault();

                // Close mobile menu
                if (mobileNav) { mobileNav.classList.remove('open'); mobileMenuBtn && mobileMenuBtn.classList.remove('open'); document.body.style.overflow = ''; }

                const hashTarget = targetAnchor ? document.getElementById(targetAnchor) : null;
                if (hashTarget) {
                    lenis.scrollTo(hashTarget, { offset: -60 });
                } else if (!targetAnchor) {
                    lenis.scrollTo(0, { immediate: false });
                }
                return;
            }

            // Cross-page navigation
            e.preventDefault();
            showVeil(() => {
                window.location.href = targetUrl;
            });
        });
    });

    // On page load — if arriving via page transition, fade in
    window.addEventListener('pageshow', e => {
        if (e.persisted) hideVeil();
    });

    // Handle hash in URL on first load (after overlay)
    if (window.location.hash) {
        setTimeout(() => {
            const targetEl = document.querySelector(window.location.hash);
            if (targetEl) lenis.scrollTo(targetEl, { offset: -60 });
        }, 2000); // after overlay
    }

});
