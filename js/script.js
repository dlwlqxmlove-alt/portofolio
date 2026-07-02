/* =============================================
   Portfolio — Main Script
   ============================================= */

const header    = document.getElementById('header');
const scrollTop = document.querySelector('.scroll-top');
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

/* ── Header scroll state ── */
window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 30);
    scrollTop?.classList.toggle('is-visible', y > 400);
}, { passive: true });

/* ── Scroll to top ── */
scrollTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── Mobile nav ── */
function closeMobileNav() {
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileNav.classList.toggle('is-open', isOpen);
    mobileNav.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.mobile-nav__link').forEach(link => {
    link.addEventListener('click', closeMobileNav);
});

/* ── Scroll Spy (IntersectionObserver) ── */
const navLinks = document.querySelectorAll('.gnb__link');

function setActiveLink(id) {
    navLinks.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });
}

/* 클릭 시 즉시 활성화 */
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const id = link.getAttribute('href').replace('#', '');
        setActiveLink(id);
    });
});

/* 스크롤 시 자동 감지 — threshold 낮춰서 큰 섹션도 인식 */
const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        setActiveLink(entry.target.id);
    });
}, {
    threshold: 0.1,
    rootMargin: '-60px 0px -45% 0px'
});

document.querySelectorAll('section[id], footer[id]').forEach(el => {
    spyObserver.observe(el);
});

/* ── Scroll Animations ── */
const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseFloat(el.dataset.delay || 0) * 1000;
        setTimeout(() => el.classList.add('is-visible'), delay);
        animObserver.unobserve(el);
    });
}, { threshold: 0.12 });

document.querySelectorAll('[data-animate]').forEach(el => {
    animObserver.observe(el);
});

/* ── GSAP (optional — loads from CDN) ── */
window.addEventListener('load', () => {
    if (!window.gsap) return;

    if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }

    /* Hero entrance */
    gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero__greeting', { y: 18, opacity: 0, duration: .55 })
        .from('.hero__name',     { y: 28, opacity: 0, duration: .65 }, '-=.3')
        .from('.hero__role',     { y: 18, opacity: 0, duration: .55 }, '-=.4')
        .from('.hero__desc',     { y: 18, opacity: 0, duration: .55 }, '-=.35')
        .from('.hero__btns',     { y: 18, opacity: 0, duration: .5  }, '-=.3')
        .from('.hero__social',   { y: 18, opacity: 0, duration: .5  }, '-=.25')
        .from('.hero__visual',   { x: 36, opacity: 0, duration: .75 }, '-=.75')
        .from('.hero__tag',      { y: 10, opacity: 0, stagger: .14, duration: .45 }, '-=.4');

    if (!window.ScrollTrigger) return;

    /* Timeline */
    gsap.from('.timeline__item', {
        scrollTrigger: { trigger: '.timeline', start: 'top 82%' },
        x: -20, opacity: 0, stagger: .13, duration: .5, ease: 'power3.out'
    });
});

/* ── Design Tabs ── */
(function () {
    const tabs   = document.querySelectorAll('.design-tab');
    const panels = document.querySelectorAll('.design-panel');
    if (!tabs.length) return;

    function activate(tabEl) {
        const target = tabEl.dataset.tab;

        tabs.forEach(t => {
            const active = t === tabEl;
            t.classList.toggle('is-active', active);
            t.setAttribute('aria-selected', active);
        });

        panels.forEach(panel => {
            if (panel.id === `panel-${target}`) {
                panel.classList.add('is-active');
            } else {
                panel.classList.remove('is-active');
            }
        });
    }

    tabs.forEach(tab => tab.addEventListener('click', () => activate(tab)));
}());

/* ── Skill Bar Animations ── */
(function () {
    const skillBars = document.querySelector('.skill-bars');
    if (!skillBars) return;

    const fills = skillBars.querySelectorAll('.skill-bar__fill');

    const barObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            fills.forEach((fill, i) => {
                setTimeout(() => {
                    fill.classList.add('is-animated');
                }, 150 + i * 160);
            });
            barObserver.unobserve(entry.target);
        });
    }, { threshold: 0.3 });

    barObserver.observe(skillBars);
}());

/* ── Project Slider ── */
(function () {
    'use strict';

    const slider = document.querySelector('.proj-slider');
    if (!slider) return;

    const track     = slider.querySelector('.proj-slider__track');
    const slides    = [...slider.querySelectorAll('.proj-slide')];
    const prevBtn   = slider.querySelector('.proj-slider__btn--prev');
    const nextBtn   = slider.querySelector('.proj-slider__btn--next');
    const currentEl = slider.querySelector('.proj-slider__current');

    const TOTAL    = slides.length;
    const INTERVAL = 4500;

    let current     = 0;
    let isAnimating = false;
    let autoTimer   = null;

    function updateNav() {
        if (currentEl) currentEl.textContent = current + 1;
    }

    function goTo(index) {
        if (index === current || isAnimating) return;
        isAnimating = true;

        const from = slides[current];
        const to   = slides[index];
        const dir  = index > current ? 1 : -1;

        if (window.gsap) {
            /* Lock track height to prevent layout shift during transition */
            track.style.minHeight = track.offsetHeight + 'px';

            /*
             * Atomically swap classes before the browser paints:
             * from → is-exiting (position:absolute, still visible)
             * to   → is-active  (position:static,   defines track height)
             */
            from.classList.remove('is-active');
            from.classList.add('is-exiting');
            to.classList.add('is-active');

            const fromInfoEls = [...from.querySelectorAll('.proj-slide__info > *')];
            const fromVisual  = from.querySelector('.proj-slide__visual');
            const toInfoEls   = [...to.querySelectorAll('.proj-slide__info > *')];
            const toVisual    = to.querySelector('.proj-slide__visual');

            /* Set incoming slide's initial state (synchronous — before first paint) */
            gsap.set(toInfoEls, { y: dir * 22, opacity: 0 });
            gsap.set(toVisual,  { opacity: 0 });

            gsap.timeline({
                onComplete() {
                    from.classList.remove('is-exiting');
                    gsap.set(fromInfoEls, { clearProps: 'all' });
                    gsap.set(fromVisual,  { clearProps: 'all' });
                    track.style.minHeight = '';
                    isAnimating = false;
                }
            })
            /* Animate out */
            .to(fromInfoEls, { y: dir * -18, opacity: 0, duration: .28, stagger: .03, ease: 'power2.in' }, 0)
            .to(fromVisual,  { opacity: 0,               duration: .28 }, 0)
            /* Animate in */
            .to(toInfoEls,   { y: 0, opacity: 1, duration: .5,  stagger: .07, ease: 'power3.out' }, .24)
            .to(toVisual,    { opacity: 1,        duration: .6,  ease: 'power2.out' }, .24);

        } else {
            /* Fallback without GSAP */
            from.classList.remove('is-active');
            to.classList.add('is-active');
            isAnimating = false;
        }

        current = index;
        updateNav();
    }

    function next() { goTo((current + 1) % TOTAL); }
    function prev() { goTo((current - 1 + TOTAL) % TOTAL); }

    function startAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(next, INTERVAL);
    }

    /* Arrow buttons */
    prevBtn?.addEventListener('click', () => { prev(); startAuto(); });
    nextBtn?.addEventListener('click', () => { next(); startAuto(); });

    /* Pause on hover */
    slider.addEventListener('mouseenter', () => clearInterval(autoTimer));
    slider.addEventListener('mouseleave', startAuto);

    /* Touch swipe */
    let touchStartX = 0;
    slider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            diff > 0 ? next() : prev();
            startAuto();
        }
    }, { passive: true });

    startAuto();
}());
