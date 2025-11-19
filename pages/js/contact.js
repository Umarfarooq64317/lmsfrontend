// Contact page functionality
const contactForm = document.getElementById('contactForm');
const contactMessage = document.getElementById('contactMessage');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // In a real application, this would send the form data to a backend
        // For now, we'll just show a success message
        contactMessage.textContent = 'Thank you for your message! We will get back to you soon.';
        contactMessage.style.display = 'block';
        
        // Reset form
        contactForm.reset();
        
        setTimeout(() => {
            contactMessage.style.display = 'none';
        }, 5000);
    });
}



