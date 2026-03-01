// Navbar functionality
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navbar = document.getElementById('navbar');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Active nav link on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 100) {
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

// Smooth scrolling
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

// Image Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.querySelector('.slider-dots');
const sliderContainer = document.querySelector('.slider-container');
let autoSlideInterval;

// Create dots
slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

function showSlide(n) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    currentSlide = (n + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    
    // Scroll to slide on mobile
    if (window.innerWidth <= 768) {
        sliderContainer.scrollTo({
            left: currentSlide * sliderContainer.offsetWidth,
            behavior: 'smooth'
        });
    }
}

function changeSlide(n) {
    showSlide(currentSlide + n);
}

function goToSlide(n) {
    showSlide(n);
}

// Auto slide function
function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);
}

// Stop auto slide
function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

// Start auto slide
startAutoSlide();

// Pause on hover (desktop only)
if (window.innerWidth > 768) {
    sliderContainer.addEventListener('mouseenter', stopAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);
}

// Update slide on manual scroll (mobile)
if (window.innerWidth <= 768) {
    sliderContainer.addEventListener('scroll', () => {
        const scrollPosition = sliderContainer.scrollLeft;
        const slideWidth = sliderContainer.offsetWidth;
        const newSlide = Math.round(scrollPosition / slideWidth);
        
        if (newSlide !== currentSlide) {
            currentSlide = newSlide;
            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentSlide].classList.add('active');
        }
    });
}

// Clients Carousel
let currentCarouselItem = 0;
const carouselItems = document.querySelectorAll('.carousel-item');

function showCarouselItem(n) {
    carouselItems.forEach(item => item.classList.remove('active'));
    
    currentCarouselItem = (n + carouselItems.length) % carouselItems.length;
    
    carouselItems[currentCarouselItem].classList.add('active');
}

function changeCarousel(n) {
    showCarouselItem(currentCarouselItem + n);
}

// Contact Form Submission
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        action: CONFIG.ACTIONS.CONTACT,
        name: document.getElementById('contactName').value,
        stageName: document.getElementById('contactStageName').value,
        instagram: document.getElementById('contactInstagram').value,
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value,
        message: document.getElementById('contactMessage').value
    };
    
    try {
        const response = await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        alert('Thank you for contacting us! We will get back to you soon.');
        contactForm.reset();
    } catch (error) {
        console.error('Error:', error);
        customAlert('Message sent successfully! We will contact you soon.', 'Success', '✓');
        contactForm.reset();
    }
});

// Check if user is logged in on page load
window.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        showUserProfile(user);
    }
});

function showUserProfile(user) {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('userProfile').style.display = 'block';
    
    // Show invoice menu only if role is Admin
    if (user.role == 'Admin') {
        document.querySelector('.invoice-menu').style.display = 'block';
    } else {
        document.querySelector('.invoice-menu').style.display = 'none';
    }
    
    document.getElementById('profileName').textContent = user.fullName;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileStage').textContent = user.stageName ? `Stage: ${user.stageName}` : '';
    
    // Add mobile profile to menu
    addMobileProfile(user);
}

function addMobileProfile(user) {
    // Remove existing mobile profile if any
    const existingMobile = document.querySelector('.mobile-profile');
    if (existingMobile) existingMobile.remove();
    
    // Create mobile profile element
    const mobileProfile = document.createElement('li');
    mobileProfile.className = 'mobile-profile';
    mobileProfile.innerHTML = `
        <div class="profile-info">
            <p><strong>${user.fullName}</strong></p>
            <p>${user.email}</p>
            ${user.stageName ? `<p>Stage: ${user.stageName}</p>` : ''}
        </div>
        <button class="logout-btn" id="mobileLogoutBtn">Logout</button>
    `;
    
    // Add to nav menu
    navMenu.appendChild(mobileProfile);
    
    // Add logout handler
    document.getElementById('mobileLogoutBtn').addEventListener('click', async () => {
        localStorage.removeItem('user');
        hideUserProfile();
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        await customAlert('Logged out successfully!', 'Success', '✓');
    });
}

function hideUserProfile() {
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('userProfile').style.display = 'none';
    document.querySelector('.invoice-menu').style.display = 'none';
    
    // Remove mobile profile
    const mobileProfile = document.querySelector('.mobile-profile');
    if (mobileProfile) mobileProfile.remove();
}

// Service cards hover effect
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease-out';
    observer.observe(card);
});
