document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once visible if you only want it to fire once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-up');
    animatedElements.forEach(el => observer.observe(el));

    // Optional subtle parallax on hero mockup (disabled for GSAP target)
    // const heroMockup = document.querySelector('.hero-mockup-wrapper');
    // ...

    // --- GSAP ScrollTrigger Hero Animation ---
    // Ensure GSAP plugins are registered
    gsap.registerPlugin(ScrollTrigger);

    const mainAgent = document.getElementById('giant-character-wrapper');
    const targetAnchor = document.getElementById('agent-target-anchor');
    const topHero = document.getElementById('top-scroll-hero');

    if (mainAgent && targetAnchor && topHero) {
        // Timeline for the scroll
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: topHero,
                start: "top top",
                end: "+=1000", // Fix the pin duration to a solid 1000px of scrolling for smoothness
                scrub: 1, // Smooth scrubbing
                pin: true, // Pin the top hero while scrolling
                pinSpacing: false, // FALSE: Allows the next section to slide UP and overlap the pinned hero
                anticipatePin: 1,
                onUpdate: (self) => {
                    window.heroScrollProgress = self.progress;
                }
            }
        });

        // Calculate the scale difference
        tl.to(mainAgent, {
            scale: 0.75, // Shrink to fit the 3-col center
            y: "0vh",    // Perfectly centered without arbitrary nudging
            opacity: 1,
            ease: "power2.inOut"
        });

        // Fade out the giant background text quickly
        tl.to('#massive-bg-text', {
            opacity: 0,
            y: -50,
            duration: 0.2
        }, 0.05);

        // Fade out the headline text faster so it doesn't overlap the shrink
        tl.to('#hero-headlines', {
            opacity: 0,
            scale: 0.9,
            duration: 0.2
        }, 0.05);
    }

    // Interactive Accordion Pills Logic
    const interactivePills = document.querySelectorAll('.interactive-pill');

    interactivePills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            // Check if this pill is already active
            const isActive = pill.classList.contains('active');

            // Close all pills first in that specific column list, allowing one per side
            const parentList = pill.closest('.power-list');
            if (parentList) {
                parentList.querySelectorAll('.interactive-pill').forEach(p => p.classList.remove('active'));
            }

            // If it wasn't active, activate it
            if (!isActive) {
                pill.classList.add('active');
            }
        });
    });

    // --- Human Skills Tabs Logic (Block 7) ---
    const skillTabs = document.querySelectorAll('.cu-skill-item');
    if (skillTabs.length > 0) {
        skillTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all
                skillTabs.forEach(t => t.classList.remove('active'));
                // Add to clicked
                tab.classList.add('active');

                // Optional: Update right-side content based on data-tab attribute if needed later
            });
        });
    }

    // --- Stats Count-Up Animation ---
    const statsSections = document.querySelectorAll('.cu-stat-section');
    const statNumbers = document.querySelectorAll('.stat-count-up');

    if (statsSections.length > 0 && statNumbers.length > 0) {
        let hasAnimated = false;

        const countUp = (el) => {
            const targetText = el.innerText;
            // Extract just the numbers to count up to, but remember the rest
            const targetNum = parseInt(targetText.replace(/,/g, '').replace(/[^0-9]/g, ''));
            if (isNaN(targetNum)) return;

            const suffix = targetText.replace(/[0-9,]/g, '');
            const duration = 2000; // 2s
            const frameDuration = 1000 / 60;
            const totalFrames = Math.round(duration / frameDuration);
            let frame = 0;

            const easeOutQuart = t => 1 - (--t) * t * t * t;

            const counter = setInterval(() => {
                frame++;
                const progress = easeOutQuart(frame / totalFrames);
                const currentNum = Math.round(targetNum * progress);

                // Format with commas
                el.innerText = currentNum.toLocaleString() + suffix;

                if (frame === totalFrames) {
                    clearInterval(counter);
                    el.innerText = targetText; // Ensure exact final text
                }
            }, frameDuration);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    statNumbers.forEach(num => {
                        // Store original text in a data attribute temporarily
                        num.dataset.target = num.innerText;
                        countUp(num);
                    });
                }
            });
        }, { threshold: 0.5 });

        statsSections.forEach(sec => observer.observe(sec));
    }

    // --- Web3 Mouse Parallax Effect ---
    // Make the character subtly follow the mouse cursor using GSAP quickTo for performance
    const heroSection = document.getElementById('top-scroll-hero');
    const characterWrapper = document.getElementById('giant-character-wrapper');
    const parallaxInner = document.getElementById('parallax-inner');

    if (heroSection && parallaxInner) {
        // Create performant GSAP setters for X and Y decoupled from the scroll pin wrapper
        const xTo = gsap.quickTo(parallaxInner, "x", { duration: 0.8, ease: "power3" });
        const yTo = gsap.quickTo(parallaxInner, "y", { duration: 0.8, ease: "power3" });

        // Define total subtle movement range in pixels
        const movementRange = 30;

        window.addEventListener("mouseleave", () => {
            // Smoothly return to center when mouse leaves
            xTo(0);
            yTo(0);
        });

        window.addEventListener("mousemove", (e) => {
            // Disable floating if the user has scrolled down (progress tracks the GSAP pin)
            // We expose window.heroScrollProgress from the ScrollTrigger below
            if (window.heroScrollProgress !== undefined && window.heroScrollProgress > 0.05) {
                xTo(0);
                yTo(0);
                return;
            }

            // Calculate mouse position relative to the center of the viewport
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            // Normalize distance from center (-1 to 1)
            const normalizedX = (clientX - centerX) / centerX;
            const normalizedY = (clientY - centerY) / centerY;

            // Calculate final pixel targets (increased range for better visibility)
            const targetX = normalizedX * Number(60);
            const targetY = normalizedY * Number(60);

            // Apply smoothly via GSAP quickTo
            xTo(targetX);
            yTo(targetY);
        });
    }

    // --- Catalog Slider Navigation ---
    const catScroller = document.getElementById('catalog-scroller');
    const catPrev = document.getElementById('cat-prev');
    const catNext = document.getElementById('cat-next');

    if (catScroller && catPrev && catNext) {
        // Approximate width of a card (320px) + gap (1.5rem = 24px)
        const scrollAmount = 350;

        const updateArrowStates = () => {
            if (catScroller.scrollLeft <= 5) {
                catPrev.classList.add('disabled');
            } else {
                catPrev.classList.remove('disabled');
            }

            if (Math.ceil(catScroller.scrollLeft + catScroller.clientWidth) >= catScroller.scrollWidth - 5) {
                catNext.classList.add('disabled');
            } else {
                catNext.classList.remove('disabled');
            }
        };

        // Initialize states
        updateArrowStates();

        // Update on scroll
        catScroller.addEventListener('scroll', () => {
            // throttle or debounce could go here, but native scroll fires fast
            updateArrowStates();
        });

        catPrev.addEventListener('click', () => {
            catScroller.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        catNext.addEventListener('click', () => {
            catScroller.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }
});
