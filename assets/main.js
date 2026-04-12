/* ============================================
   CDEK Tools — Shared JS
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    var burger = document.querySelector('.header__burger');
    var mobileNav = document.querySelector('.header__mobile-nav');

    if (burger && mobileNav) {
        burger.addEventListener('click', function() {
            burger.classList.toggle('open');
            mobileNav.classList.toggle('open');
        });

        // Close mobile nav when clicking a link
        mobileNav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                burger.classList.remove('open');
                mobileNav.classList.remove('open');
            });
        });

        // Close mobile nav when clicking outside
        document.addEventListener('click', function(e) {
            if (!burger.contains(e.target) && !mobileNav.contains(e.target)) {
                burger.classList.remove('open');
                mobileNav.classList.remove('open');
            }
        });
    }

    // Set active nav link based on current page
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.header__nav a, .header__mobile-nav a').forEach(function(link) {
        var href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
});
