document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');

    // Password visibility toggle feature
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        if (type === 'text') {
            eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });

    // Handle form submission and show loading state
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent actual submission for this demo
        
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Simulate a network request (2 seconds)
        setTimeout(() => {
            alert('Sign-in simulation complete!');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }, 2000);
    });
});