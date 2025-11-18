// Profile page functionality
document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Load user profile
        const user = await apiRequest('/users/profile');
        
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
    } catch (error) {
        console.error('Error loading profile:', error);
    }

    // Handle form submission
    const profileForm = document.getElementById('profileForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            successMessage.textContent = '';
            successMessage.style.display = 'none';
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const updateData = { name, email };
            if (password) {
                updateData.password = password;
            }

            try {
                const response = await apiRequest('/users/profile', {
                    method: 'PUT',
                    body: updateData
                });

                successMessage.textContent = 'Profile updated successfully!';
                successMessage.style.display = 'block';

                // Update stored user data
                const user = getUser();
                if (user) {
                    user.name = name;
                    user.email = email;
                    setUser(user);
                }

                // Clear password field
                document.getElementById('password').value = '';

                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            } catch (error) {
                errorMessage.textContent = error.message || 'Failed to update profile';
                errorMessage.style.display = 'block';
            }
        });
    }
});

