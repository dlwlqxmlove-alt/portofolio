/* =============================================
   Graphic Detail Page — Script
   ============================================= */
(function () {
    'use strict';

    /* ── 프로젝트 데이터 로드 ── */
    const params  = new URLSearchParams(window.location.search);
    const id      = parseInt(params.get('id'), 10);
    const project = (typeof GRAPHIC_PROJECTS !== 'undefined')
        ? GRAPHIC_PROJECTS.find(p => p.id === id)
        : null;

    if (!project) {
        window.location.href = 'index.html#graphic';
        return;
    }

    const total        = GRAPHIC_PROJECTS.length;
    const currentIndex = GRAPHIC_PROJECTS.findIndex(p => p.id === id);
    const prevProject  = currentIndex > 0           ? GRAPHIC_PROJECTS[currentIndex - 1] : null;
    const nextProject  = currentIndex < total - 1   ? GRAPHIC_PROJECTS[currentIndex + 1] : null;

    /* ── 페이지 타이틀 ── */
    document.title = `${project.title} | Graphic | Portfolio`;

    /* ── Hero ── */
    const heroSection = document.getElementById('gd-hero');
    const heroImg     = document.getElementById('gd-hero-img');

    heroImg.alt = project.title;
    heroImg.src = project.heroImage;
    heroImg.addEventListener('load',  () => heroSection.classList.add('is-loaded'));
    heroImg.addEventListener('error', () => heroSection.classList.add('is-loaded'));

    document.getElementById('gd-category').textContent = project.category;
    document.getElementById('gd-title').textContent    = project.title;

    /* ── Overview ── */
    document.getElementById('gd-overview').textContent = project.overview;

    /* ── Meta ── */
    const metaItems = [
        { label: '작업명',   value: project.title },
        { label: '작업 기간', value: project.period },
        { label: '참여도',   value: project.contribution },
        { label: '타겟',     value: project.target },
        { label: '사용 툴',  tools: project.tools },
    ];

    document.getElementById('gd-meta').innerHTML = metaItems.map(item => {
        if (item.tools) {
            const tags = item.tools
                .map(t => `<span class="gd-meta__tool-tag">${t}</span>`)
                .join('');
            return `<div class="gd-meta__item">
                        <dt class="gd-meta__label">${item.label}</dt>
                        <dd class="gd-meta__tools">${tags}</dd>
                    </div>`;
        }
        return `<div class="gd-meta__item">
                    <dt class="gd-meta__label">${item.label}</dt>
                    <dd class="gd-meta__value">${item.value}</dd>
                </div>`;
    }).join('');

    /* ── Concept & Description ── */
    document.getElementById('gd-concept').textContent = project.concept;
    document.getElementById('gd-desc').innerHTML      = project.description;

    /* ── Gallery ── */
    document.getElementById('gd-gallery').innerHTML = project.images.map((img, i) =>
        `<div class="gd-gallery__item" data-gallery-index="${i}">
            <img src="${img.src}" alt="${img.caption}"
                 class="gd-gallery__item-img" loading="lazy">
            <p class="gd-gallery__caption">${img.caption}</p>
        </div>`
    ).join('');

    /* ── Retrospective ── */
    document.getElementById('gd-learned').textContent = project.retrospective.learned;
    document.getElementById('gd-intent').textContent  = project.retrospective.intent;

    /* ── Prev / Next Navigation ── */
    if (prevProject) {
        const el = document.getElementById('gd-prev-link');
        el.href  = `graphic-detail.html?id=${prevProject.id}`;
        document.getElementById('gd-prev-name').textContent = prevProject.title;
        el.removeAttribute('hidden');
    }

    if (nextProject) {
        const el = document.getElementById('gd-next-link');
        el.href  = `graphic-detail.html?id=${nextProject.id}`;
        document.getElementById('gd-next-name').textContent = nextProject.title;
        el.removeAttribute('hidden');
    }

    /* ── Header scroll ── */
    const header      = document.getElementById('header');
    const scrollTopBtn = document.querySelector('.scroll-top');

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        header.classList.toggle('is-scrolled', y > 30);
        scrollTopBtn?.classList.toggle('is-visible', y > 400);
    }, { passive: true });

    scrollTopBtn?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ── Mobile nav ── */
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');

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

    /* ── GSAP Animations ── */
    window.addEventListener('load', () => {
        if (!window.gsap) return;

        if (window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
        }

        /* Hero text entrance */
        gsap.timeline({ delay: 0.2, defaults: { ease: 'power3.out' } })
            .to('#gd-category', { y: 0, opacity: 1, duration: 0.6 })
            .to('#gd-title',    { y: 0, opacity: 1, duration: 0.75 }, '-=0.35');

        if (!window.ScrollTrigger) return;

        /* Overview */
        gsap.from('.gd-overview__text', {
            scrollTrigger: { trigger: '.gd-overview', start: 'top 85%' },
            y: 24, opacity: 0, duration: 0.7, ease: 'power3.out',
        });

        /* Meta sidebar */
        gsap.from('.gd-meta', {
            scrollTrigger: { trigger: '.gd-layout', start: 'top 80%' },
            x: -28, opacity: 0, duration: 0.65, ease: 'power3.out',
        });

        /* Content */
        gsap.from('.gd-content', {
            scrollTrigger: { trigger: '.gd-layout', start: 'top 80%' },
            x: 28, opacity: 0, duration: 0.65, ease: 'power3.out',
        });

        /* Gallery items — each fades in as it enters viewport */
        document.querySelectorAll('.gd-gallery__item').forEach((item, i) => {
            gsap.to(item, {
                scrollTrigger: { trigger: item, start: 'top 88%' },
                y: 0, opacity: 1,
                duration: 0.65,
                delay: i === 0 ? 0 : 0.08,
                ease: 'power3.out',
            });
        });

        /* Retrospective cards */
        gsap.from('.gd-retro__item', {
            scrollTrigger: { trigger: '.gd-retro__grid', start: 'top 82%' },
            y: 28, opacity: 0,
            stagger: 0.15,
            duration: 0.6,
            ease: 'power3.out',
        });

        /* Nav area */
        gsap.from('.gd-nav__item, .gd-nav__back', {
            scrollTrigger: { trigger: '.gd-nav__inner', start: 'top 90%' },
            y: 16, opacity: 0,
            stagger: 0.1,
            duration: 0.5,
            ease: 'power3.out',
        });
    });
}());
