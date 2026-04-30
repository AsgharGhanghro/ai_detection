// authentication.js - Complete Authentication System
let currentUser = null;

function updateUIForLoggedInUser() {
    const authButton = document.getElementById('auth-button');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    const dropdownUserName = document.getElementById('dropdown-user-name');
    const dropdownUserEmail = document.getElementById('dropdown-user-email');

    if (currentUser) {
        // Update user info
        if (userName) userName.textContent = currentUser.name.split(' ')[0];
        if (dropdownUserName) dropdownUserName.textContent = currentUser.name;
        if (dropdownUserEmail) dropdownUserEmail.textContent = currentUser.email;

        // Show user menu, hide auth button
        if (authButton) authButton.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';

        // IMPORTANT: Update avatar everywhere
        updateAvatarUIEverywhere();

        // Update analytics data with user's data
        if (currentUser.analytics) {
            if (typeof analyticsData !== 'undefined') {
                analyticsData = currentUser.analytics;
                if (typeof renderDynamicDashboard === 'function') {
                    renderDynamicDashboard();
                }
            }
        }

        // Hide login prompt if visible
        const loginPrompt = document.getElementById('login-prompt');
        if (loginPrompt) {
            loginPrompt.style.display = 'none';
        }

        // Enable analyzer
        enableAnalyzer();

    } else {
        // Show auth button, hide user menu
        if (authButton) authButton.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

let verificationCode = null;
let verificationTimer = null;
let resendTimer = null;


// Add this function to update user avatar globally
function updateUserAvatar(imageDataUrl) {
    if (!currentUser) return;

    // Update currentUser
    if (!currentUser.profile) currentUser.profile = {};
    currentUser.profile.avatar = imageDataUrl;

    // Save to localStorage
    localStorage.setItem('textguard_user', JSON.stringify(currentUser));

    // Update users list
    const users = JSON.parse(localStorage.getItem('textguard_users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('textguard_users', JSON.stringify(users));
    }

    // Update UI on all pages
    updateAvatarUI();

    showNotification('Profile picture updated!', 'success');
}

// Update avatar UI across the site
function updateAvatarUI() {
    if (!currentUser) return;

    // Update main app avatar
    const userAvatar = document.querySelector('.user-avatar i');
    if (userAvatar && currentUser.profile?.avatar) {
        userAvatar.style.display = 'none';
        const parent = userAvatar.parentElement;
        parent.style.backgroundImage = `url(${currentUser.profile.avatar})`;
        parent.style.backgroundSize = 'cover';
        parent.style.backgroundPosition = 'center';
    }

    // Update dropdown avatar
    const dropdownAvatar = document.querySelector('.user-avatar-large i');
    if (dropdownAvatar && currentUser.profile?.avatar) {
        dropdownAvatar.style.display = 'none';
        const parent = dropdownAvatar.parentElement;
        parent.style.backgroundImage = `url(${currentUser.profile.avatar})`;
        parent.style.backgroundSize = 'cover';
        parent.style.backgroundPosition = 'center';
        parent.style.borderRadius = '50%';
    }

    // Update profile page if we're on it
    if (window.location.pathname.includes('profile.html')) {
        const profileAvatar = document.getElementById('avatar-image');
        if (profileAvatar && currentUser.profile?.avatar) {
            profileAvatar.innerHTML = `<img src="${currentUser.profile.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        }
    }
}


// Initialize authentication
function initializeAuth() {
    loadCurrentUser();
    setupTheme();
    setupAuthForms();
    checkAuthState();
}

// Load current user from localStorage
function loadCurrentUser() {
    try {
        const userData = localStorage.getItem('textguard_user');
        const authToken = localStorage.getItem('textguard_token');

        if (userData && authToken) {
            currentUser = JSON.parse(userData);
            updateUIForLoggedInUser();
        }
    } catch (error) {
        console.error('Error loading user:', error);
        logout();
    }
}

// Add this function to authentication.js (anywhere after the currentUser declaration)

function updateUserAvatar(imageDataUrl) {
    if (!currentUser) return false;

    try {
        // Update currentUser in memory
        if (!currentUser.profile) currentUser.profile = {};
        currentUser.profile.avatar = imageDataUrl;

        // Save to localStorage
        localStorage.setItem('textguard_user', JSON.stringify(currentUser));

        // Update users list
        const users = JSON.parse(localStorage.getItem('textguard_users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('textguard_users', JSON.stringify(users));
        }

        // Update UI everywhere
        updateAvatarUI();

        return true;
    } catch (error) {
        console.error('Error updating avatar:', error);
        return false;
    }
}

function updateAvatarUI() {
    if (!currentUser) return;

    // Update in app.html (home page)
    const userAvatar = document.querySelector('.user-avatar, .user-avatar-large');
    const avatar = currentUser.profile?.avatar;

    if (userAvatar) {
        if (avatar) {
            userAvatar.innerHTML = `<img src="${avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            // Fallback to initials
            const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
            userAvatar.innerHTML = `<span style="font-size: 0.8rem; font-weight: bold;">${initials}</span>`;
        }
    }

    // Update in user dropdown
    const dropdownAvatar = document.querySelector('.user-avatar-large');
    if (dropdownAvatar) {
        if (avatar) {
            dropdownAvatar.innerHTML = `<img src="${avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        }
    }
}

// Setup theme from localStorage
function setupTheme() {
    const savedTheme = localStorage.getItem('textguard_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
        themeSwitch.checked = savedTheme === 'light';
        themeSwitch.addEventListener('change', toggleTheme);
    }
}

// Toggle theme
function toggleTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    const newTheme = themeSwitch.checked ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('textguard_theme', newTheme);

    // Update UI elements that might need theme-specific adjustments
    updateThemeDependentElements();
}

// Update theme-dependent UI elements
function updateThemeDependentElements() {
    // Add any theme-specific UI updates here
}

// Setup auth form event listeners
function setupAuthForms() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
        setupPasswordStrength();
    }

    // Verification form
    const verificationForm = document.getElementById('verification-form');
    if (verificationForm) {
        verificationForm.addEventListener('submit', handleVerification);
    }

    // Forgot password form
    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
}

// Setup password strength indicator
function setupPasswordStrength() {
    const passwordInput = document.getElementById('signup-password');
    if (!passwordInput) return;

    passwordInput.addEventListener('input', function () {
        const password = this.value;
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text span');

        if (!strengthBar || !strengthText) return;

        let strength = 0;
        let color = 'var(--error)';
        let text = 'Weak';

        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;

        strength = Math.min(strength, 100);

        if (strength >= 75) {
            color = 'var(--success)';
            text = 'Strong';
        } else if (strength >= 50) {
            color = 'var(--warning)';
            text = 'Good';
        } else if (strength >= 25) {
            color = '#f59e0b';
            text = 'Fair';
        }

        strengthBar.style.width = strength + '%';
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    });
}


let isPasswordShown = false;

function eyesWatchForm() {
    const leftPupil = document.getElementById('leftPupil');
    const rightPupil = document.getElementById('rightPupil');

    // Only watch form if NO password is currently shown
    if (!isPasswordShown) {
        if (leftPupil) {
            leftPupil.classList.remove('looking-away');
            leftPupil.classList.add('watching-form');
        }
        if (rightPupil) {
            rightPupil.classList.remove('looking-away');
            rightPupil.classList.add('watching-form');
        }
    }
}

function eyesLookAway() {
    const leftPupil = document.getElementById('leftPupil');
    const rightPupil = document.getElementById('rightPupil');

    isPasswordShown = true;

    if (leftPupil) {
        leftPupil.classList.remove('watching-form');
        leftPupil.classList.add('looking-away');
    }
    if (rightPupil) {
        rightPupil.classList.remove('watching-form');
        rightPupil.classList.add('looking-away');
    }
}

function eyesLookBack() {
    const leftPupil = document.getElementById('leftPupil');
    const rightPupil = document.getElementById('rightPupil');

    // Set flag to false - password is now hidden
    isPasswordShown = false;

    // Eyes look back at form
    if (leftPupil) {
        leftPupil.classList.remove('looking-away');
        leftPupil.classList.add('watching-form');
    }
    if (rightPupil) {
        rightPupil.classList.remove('looking-away');
        rightPupil.classList.add('watching-form');
    }
}


function togglePasswordVisibility(fieldId) {
    const input = document.getElementById(fieldId);
    const icon = document.getElementById(`${fieldId}-icon`);

    if (!input || !icon) return;

    // Toggle input type
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');

        // EYES LOOK AWAY (opposite direction)
        // They will STAY looking away until user closes it
        eyesLookAway();
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');

        eyesLookBack();
    }
}

function openAuthModal() {
    const authModal = document.getElementById('auth-modal');
    const authOverlay = document.getElementById('auth-overlay');

    if (authModal && authOverlay) {
        authModal.classList.add('active');
        authOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Reset to login tab
        showLoginTab();

        // Eyes watch form when modal opens
        isPasswordShown = false;
        eyesWatchForm();
    }
}

// Close Auth Modal
function closeAuthModal() {
    const authModal = document.getElementById('auth-modal');
    const authOverlay = document.getElementById('auth-overlay');

    if (authModal && authOverlay) {
        authModal.classList.remove('active');
        authOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function showLoginTab() {
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const loginTab = document.getElementById('login-tab');
    if (loginTab) {
        loginTab.classList.add('active');
        const loginBtn = document.getElementById('login-tab-btn');
        if (loginBtn) loginBtn.classList.add('active');

        const title = document.getElementById('auth-title');
        const subtitle = document.getElementById('auth-subtitle');
        if (title) title.textContent = 'Sign In';
        if (subtitle) subtitle.textContent = 'Enter your credentials to access TextGuard AI';
    }

    clearFormErrors();
    resetEyes();
}

// Show Signup Tab
function showSignupTab() {
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const signupTab = document.getElementById('signup-tab');
    if (signupTab) {
        signupTab.classList.add('active');
        const signupBtn = document.getElementById('signup-tab-btn');
        if (signupBtn) signupBtn.classList.add('active');

        const title = document.getElementById('auth-title');
        const subtitle = document.getElementById('auth-subtitle');
        if (title) title.textContent = 'Create Account';
        if (subtitle) subtitle.textContent = 'Join TextGuard AI today';
    }

    clearFormErrors();
    resetEyes();
}

// Show Forgot Password
function showForgotPassword() {
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const forgotTab = document.getElementById('forgot-tab');
    if (forgotTab) {
        forgotTab.classList.add('active');

        const title = document.getElementById('auth-title');
        const subtitle = document.getElementById('auth-subtitle');
        if (title) title.textContent = 'Reset Password';
        if (subtitle) subtitle.textContent = 'Enter your email to receive a reset link';
    }

    clearFormErrors();
    resetEyes();
}

// Reset eyes to normal position
function resetEyes() {
    isPasswordShown = false;
    const leftPupil = document.getElementById('leftPupil');
    const rightPupil = document.getElementById('rightPupil');

    if (leftPupil) {
        leftPupil.classList.remove('looking-away');
        leftPupil.classList.add('watching-form');
    }
    if (rightPupil) {
        rightPupil.classList.remove('looking-away');
        rightPupil.classList.add('watching-form');
    }
}

function clearFormErrors() {
    document.querySelectorAll('.form-error').forEach(error => {
        error.textContent = '';
    });
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('error', 'success');
    });
}

// Show field error
function showFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (input && errorElement) {
        input.classList.add('error');
        input.classList.remove('success');
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    }
}

// Show field success
function showFieldSuccess(fieldId) {
    const input = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (input && errorElement) {
        input.classList.add('success');
        input.classList.remove('error');
        errorElement.textContent = '';
    }
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate password strength
function validatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;

    return strength;
}

// Update password strength bar
function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');

    if (!strengthBar || !strengthText) return;

    const strength = validatePasswordStrength(password);
    const levels = ['None', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', 'weak', 'fair', 'good', 'strong', 'strong'];

    strengthBar.className = `strength-fill ${colors[strength]}`;
    strengthText.textContent = levels[strength];
}

function handleLogin(e) {
    e.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('login-submit-btn');

    if (!emailInput || !passwordInput || !submitBtn) {
        console.error('Login form elements not found');
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    clearFormErrors();

    // Validation
    if (!email) {
        showFieldError('login-email', 'Email address is required');
        return;
    }

    if (!validateEmail(email)) {
        showFieldError('login-email', 'Please enter a valid email address');
        return;
    }

    if (!password) {
        showFieldError('login-password', 'Password is required');
        return;
    }

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

    // Wait 2 seconds
    setTimeout(() => {
        // Check if user exists
        const users = JSON.parse(localStorage.getItem('textguard_users') || '[]');
        const user = users.find(u => u.email === email);

        if (!user) {
            // Email not found error
            showFieldError('login-email', 'Email address not found. Please check or create an account');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Sign In';
            return;
        }

        // Check password (simple comparison - in production use proper hashing)
        if (user.password !== password && user.password !== hashPassword(password)) {
            // Wrong password error
            showFieldError('login-password', 'Password is incorrect. Please try again');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Sign In';
            return;
        }

        // Success
        showFieldSuccess('login-email');
        showFieldSuccess('login-password');

        const authToken = generateAuthToken();

        localStorage.setItem('textguard_token', authToken);
        localStorage.setItem('textguard_user', JSON.stringify(user));

        if (typeof currentUser !== 'undefined') {
            currentUser = user;
        }

        // Show success message
        if (typeof showNotification === 'function') {
            showNotification('✓ Successfully signed in!', 'success');
        }

        // Close modal after success
        setTimeout(() => {
            if (typeof updateUIForLoggedInUser === 'function') {
                updateUIForLoggedInUser();
            }
            closeAuthModal();

            // Reset button
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Sign In';
        }, 500);

    }, 2000);
}


function handleSignup(e) {
    e.preventDefault();

    // Check if elements exist first
    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmInput = document.getElementById('signup-confirm');
    const termsCheckbox = document.getElementById('terms-checkbox');
    const submitBtn = document.getElementById('signup-submit-btn');

    if (!nameInput || !emailInput || !passwordInput || !confirmInput || !termsCheckbox || !submitBtn) {
        console.error('Signup form elements not found');
        return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    const termsChecked = termsCheckbox.checked;

    clearFormErrors();

    // Validation
    if (!name) {
        showFieldError('signup-name', 'Full name is required');
        return;
    }

    if (!email) {
        showFieldError('signup-email', 'Email address is required');
        return;
    }

    if (!validateEmail(email)) {
        showFieldError('signup-email', 'Please enter a valid email address');
        return;
    }

    const users = JSON.parse(localStorage.getItem('textguard_users') || '[]');
    if (users.find(u => u.email === email)) {
        showFieldError('signup-email', 'This email is already registered. Please sign in or use a different email');
        return;
    }

    if (!password) {
        showFieldError('signup-password', 'Password is required');
        return;
    }

    if (password.length < 8) {
        showFieldError('signup-password', 'Password must be at least 8 characters long');
        return;
    }

    if (password !== confirm) {
        showFieldError('signup-confirm', 'Passwords do not match');
        return;
    }

    if (!termsChecked) {
        if (typeof showNotification === 'function') {
            showNotification('Please accept the Terms & Conditions', 'warning');
        }
        return;
    }

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

    // Wait 2 seconds
    setTimeout(() => {
        showFieldSuccess('signup-name');
        showFieldSuccess('signup-email');
        showFieldSuccess('signup-password');
        showFieldSuccess('signup-confirm');

        const newUser = {
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            password: password, // In production, use proper hashing
            verified: false,
            createdAt: new Date().toISOString(),
            plan: 'free',
            analytics: {
                totalAnalyses: 0,
                totalCharacters: 0,
                aiDetections: 0,
                plagiarismDetections: 0,
                recentAnalyses: []
            }
        };

        users.push(newUser);
        localStorage.setItem('textguard_users', JSON.stringify(users));

        if (typeof showNotification === 'function') {
            showNotification('✓ Account created successfully! Please sign in.', 'success');
        }

        // Reset button
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';

        setTimeout(() => {
            showLoginTab();
        }, 1000);
    }, 2000);
}

function handleForgotPassword(e) {
    e.preventDefault();

    const emailInput = document.getElementById('forgot-email');

    if (!emailInput) {
        console.error('Forgot password form element not found');
        return;
    }

    const email = emailInput.value.trim();

    if (!email) {
        showFieldError('forgot-email', 'Email address is required');
        return;
    }

    if (!validateEmail(email)) {
        showFieldError('forgot-email', 'Please enter a valid email address');
        return;
    }

    const users = JSON.parse(localStorage.getItem('textguard_users') || '[]');
    const user = users.find(u => u.email === email);

    if (!user) {
        showFieldError('forgot-email', 'No account found with this email address');
        return;
    }

    const resetToken = 'reset_' + Date.now();
    localStorage.setItem(`reset_${resetToken}`, JSON.stringify({
        email: email,
        expires: Date.now() + 3600000
    }));

    showFieldSuccess('forgot-email');

    if (typeof showNotification === 'function') {
        showNotification('✓ Password reset link sent to your email!', 'success');
    }

    setTimeout(() => {
        const form = document.getElementById('forgot-form');
        if (form) form.reset();
        showLoginTab();
    }, 2000);
}


function setupPasswordStrength() {
    const passwordInput = document.getElementById('signup-password');

    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            updatePasswordStrength(this.value);
        });
    }
}

function setupAuthForms() {
    setupPasswordStrength();

    const authOverlay = document.getElementById('auth-overlay');
    if (authOverlay) {
        authOverlay.addEventListener('click', closeAuthModal);
    }
}

function resendVerificationCode() {
    if (typeof showNotification === 'function') {
        showNotification('Verification code sent! Check your email.', 'info');
    }
}


function showTerms() {
    closeAuthModal();
    if (typeof showNotification === 'function') {
        showNotification('Terms & Conditions modal would open here', 'info');
    }
}


function loginWithGoogle() {
    if (typeof showNotification === 'function') {
        showNotification('Google login would be implemented with Firebase/Auth0 in production', 'info');
    }

    const mockUser = {
        id: 'google_' + Date.now(),
        name: 'Google User',
        email: 'googleuser@example.com',
        verified: true,
        createdAt: new Date().toISOString(),
        plan: 'free',
        analytics: {
            totalAnalyses: 0,
            totalCharacters: 0,
            aiDetections: 0,
            plagiarismDetections: 0,
            recentAnalyses: []
        }
    };

    const authToken = 'token_' + Date.now();

    localStorage.setItem('textguard_token', authToken);
    localStorage.setItem('textguard_user', JSON.stringify(mockUser));

    if (typeof currentUser !== 'undefined') {
        currentUser = mockUser;
    }

    if (typeof updateUIForLoggedInUser === 'function') {
        updateUIForLoggedInUser();
    }

    closeAuthModal();

    if (typeof showNotification === 'function') {
        showNotification('✓ Successfully signed in with Google!', 'success');
    }
}


document.addEventListener('DOMContentLoaded', function () {
    setupAuthForms();
});



document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeAuthModal();
    }
});


async function handleSignup(e) {
    e.preventDefault();
    console.log('=== SIGNUP STARTED ===');

    // Check if elements exist before reading values
    const nameEl = document.getElementById('signup-name');
    const emailEl = document.getElementById('signup-email');
    const passwordEl = document.getElementById('signup-password');
    const confirmEl = document.getElementById('signup-confirm');
    const termsEl = document.getElementById('terms-checkbox');

    if (!nameEl || !emailEl || !passwordEl || !confirmEl || !termsEl) {
        console.error('Required form elements not found');
        console.log('nameEl:', nameEl);
        console.log('emailEl:', emailEl);
        console.log('passwordEl:', passwordEl);
        console.log('confirmEl:', confirmEl);
        console.log('termsEl:', termsEl);
        return;
    }

    const confirmPasswordEl = confirmEl;

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const password = passwordEl.value;
    const confirmPassword = confirmPasswordEl.value;
    const termsAgree = termsEl.checked;

    console.log('Form values:', {
        name,
        email,
        password: password ? '***' : 'empty',
        confirmPassword: confirmPassword ? '***' : 'empty',
        termsAgree
    });

    // Clear previous errors
    clearAuthErrors();

    // Validate inputs
    if (!name) {
        showError('signup-name-error', 'Please enter your full name');
        return;
    }

    if (!validateEmail(email)) {
        showError('signup-email-error', 'Please enter a valid email address');
        return;
    }

    if (password.length < 8) {
        showError('signup-password-error', 'Password must be at least 8 characters');
        return;
    }

    if (password !== confirmPassword) {
        showError('signup-confirm-error', 'Passwords do not match');
        return;
    }

    if (!termsAgree) {
        console.log('Terms not agreed - showing error');
        const termsError = document.getElementById('terms-error');
        if (termsError) {
            termsError.textContent = 'You must agree to the Terms & Conditions to create an account';
            termsError.style.display = 'block';
            termsError.style.color = '#ff6b6b';
            termsError.style.fontWeight = '600';
            termsError.style.padding = '0.5rem';
            termsError.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
            termsError.style.borderRadius = '6px';
            termsError.style.border = '1px solid rgba(255, 107, 107, 0.3)';
        }

        // Highlight the checkbox
        const termsCheckbox = document.getElementById('terms-agree');
        if (termsCheckbox) {
            termsCheckbox.style.outline = '2px solid #ff6b6b';
            termsCheckbox.style.outlineOffset = '2px';

            // Scroll to the checkbox
            termsCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Add shake animation
            termsCheckbox.parentElement.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                termsCheckbox.parentElement.style.animation = '';
            }, 500);
        }

        return;
    }

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('textguard_users') || '[]');
    if (users.some(u => u.email === email)) {
        showError('signup-email-error', 'Email already registered');
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('signup-submit-btn');
    if (!submitBtn) {
        console.error('Submit button not found');
        return;
    }
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;

    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate verification code
        const verificationCode = generateVerificationCode();

        // Create user object
        const user = {
            id: generateUserId(),
            name: name,
            email: email,
            password: hashPassword(password),
            verified: false,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            plan: 'free',
            profile: {
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
                bio: '',
                location: '',
                website: '',
                joined: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            },
            settings: {
                theme: 'dark',
                notifications: true,
                emailNotifications: true,
                autoSave: true,
                language: 'en',
                privacy: {
                    showAnalytics: true,
                    shareData: false,
                    publicProfile: false
                }
            },
            analytics: {
                totalAnalyses: 0,
                totalCharacters: 0,
                aiDetections: 0,
                plagiarismDetections: 0,
                recentAnalyses: []
            }
        };

        // Save user (temporarily for verification)
        const pendingUsers = JSON.parse(localStorage.getItem('textguard_pending_users') || '{}');
        pendingUsers[email] = {
            user: user,
            verificationCode: verificationCode,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        };
        localStorage.setItem('textguard_pending_users', JSON.stringify(pendingUsers));

        // Simulate sending verification email
        simulateSendVerificationEmail(email, verificationCode);

        // Show verification tab
        showVerificationTab(email);

        // Show success message
        showNotification('Verification code sent to your email!', 'success');

    } catch (error) {
        console.error('Signup error:', error);
        showError('signup-email-error', 'Failed to create account. Please try again.');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }

    console.log('=== SIGNUP COMPLETED ===');
}

// Add these if missing
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(elementId, message) {
    console.log('Showing error:', elementId, message);
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.style.color = '#ff6b6b';
    }
}

function clearAuthErrors() {
    console.log('Clearing auth errors');
    const errors = document.querySelectorAll('.form-error');
    errors.forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
    });

    // Also reset checkbox styling
    const termsCheckbox = document.getElementById('terms-agree');
    if (termsCheckbox) {
        termsCheckbox.style.outline = '';
    }
}

function hashPassword(password) {
    // Simple hash for demo
    console.log('Hashing password');
    return btoa(password).split('').reverse().join('');
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function showNotification(message, type = 'info') {
    console.log('Notification:', type, message);
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

console.log('Authentication.js loaded successfully!');

// Add event listener debug
document.addEventListener('DOMContentLoaded', function () {
    console.log('Checking signup form...');
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        console.log('Signup form found:', signupForm);
        signupForm.addEventListener('submit', function (e) {
            console.log('Signup form submitted!');
            console.log('handleSignup function exists:', typeof handleSignup);
        });
    } else {
        console.error('Signup form not found!');
    }
});

// Handle verification
async function handleVerification(e) {
    e.preventDefault();

    // Get verification code from inputs
    const code = Array.from({ length: 6 }, (_, i) =>
        document.getElementById(`code-${i + 1}`).value
    ).join('');

    const errorElement = document.getElementById('verification-error');

    // Clear previous error
    if (errorElement) {
        errorElement.textContent = '';
    }

    // Validate code
    if (code.length !== 6) {
        showError('verification-error', 'Please enter the 6-digit code');
        return;
    }

    // Get pending user
    const pendingUsers = JSON.parse(localStorage.getItem('textguard_pending_users') || '{}');
    const pendingEmail = document.getElementById('verification-email').textContent;
    const pendingUser = pendingUsers[pendingEmail];

    if (!pendingUser) {
        showError('verification-error', 'Verification session expired. Please sign up again.');
        return;
    }

    // Check if code has expired
    if (Date.now() > pendingUser.expiresAt) {
        showError('verification-error', 'Verification code has expired. Please request a new one.');
        return;
    }

    // Verify code
    if (code !== pendingUser.verificationCode) {
        showError('verification-error', 'Invalid verification code');
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('verification-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    submitBtn.disabled = true;

    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mark user as verified
        pendingUser.user.verified = true;

        // Save user to users list
        const users = JSON.parse(localStorage.getItem('textguard_users') || '[]');
        users.push(pendingUser.user);
        localStorage.setItem('textguard_users', JSON.stringify(users));

        // Remove from pending
        delete pendingUsers[pendingEmail];
        localStorage.setItem('textguard_pending_users', JSON.stringify(pendingUsers));

        // Create auth token
        const authToken = generateAuthToken();

        // Save to localStorage
        localStorage.setItem('textguard_token', authToken);
        localStorage.setItem('textguard_user', JSON.stringify(pendingUser.user));

        // Update current user
        currentUser = pendingUser.user;

        // Update UI
        updateUIForLoggedInUser();

        // Close modal
        closeAuthModal();

        // Clear verification timer
        clearVerificationTimer();

        // Show success message
        showNotification('Email verified successfully! Welcome to TextGuard AI', 'success');

    } catch (error) {
        showError('verification-error', 'Verification failed. Please try again.');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Handle forgot password
async function handleForgotPassword(e) {
    e.preventDefault();

    const email = document.getElementById('forgot-email').value.trim();

    // Clear previous error
    const errorElement = document.getElementById('forgot-email-error');
    if (errorElement) {
        errorElement.textContent = '';
    }

    // Validate email
    if (!validateEmail(email)) {
        showError('forgot-email-error', 'Please enter a valid email address');
        return;
    }

    // Check if user exists
    const users = JSON.parse(localStorage.getItem('textguard_users') || '[]');
    const user = users.find(u => u.email === email);

    if (!user) {
        showError('forgot-email-error', 'No account found with this email');
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('forgot-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate reset token
        const resetToken = generateResetToken();

        // Save reset token (in a real app, this would be saved to database)
        const resetTokens = JSON.parse(localStorage.getItem('textguard_reset_tokens') || '{}');
        resetTokens[email] = {
            token: resetToken,
            expiresAt: Date.now() + 1 * 60 * 60 * 1000 // 1 hour
        };
        localStorage.setItem('textguard_reset_tokens', JSON.stringify(resetTokens));

      
        simulateSendResetEmail(email, resetToken);

        // Show success message
        const resetSent = document.getElementById('reset-sent');
        if (resetSent) {
            resetSent.style.display = 'block';
        }

        showNotification('Reset link sent to your email!', 'success');

    } catch (error) {
        showError('forgot-email-error', 'Failed to send reset link. Please try again.');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function simulateSendVerificationEmail(email, code) {
    console.log(`Verification code ${code} sent to ${email}`);
    console.log(`In production, this would send a real email to: ${email}`);
    console.log(`Verification code: ${code}`);

    // Store for verification
    localStorage.setItem('textguard_verification_code', code);
    localStorage.setItem('textguard_verification_email', email);

    // Show verification code in console and notification
    console.log('=== VERIFICATION CODE ===');
    console.log(`Code: ${code}`);
    console.log(`Email: ${email}`);
    console.log('========================');

    // Show notification with code visible
    setTimeout(() => {
        showNotification(`✓ Account created! Your verification code is: ${code}`, 'success');
    }, 500);
}

// Update the showVerificationTab function to auto-fill and auto-verify:
function showVerificationTab(email) {
    console.log('Showing verification tab for:', email);

    // Hide all tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show verification tab
    const verificationTab = document.getElementById('verification-tab');
    if (verificationTab) {
        verificationTab.classList.add('active');
    }

    // Update email display
    const verificationEmail = document.getElementById('verification-email');
    if (verificationEmail) {
        verificationEmail.textContent = email;
    }

    // Clear any previous code inputs
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`code-${i}`);
        if (input) input.value = '';
    }

    // Focus first input
    setTimeout(() => {
        const firstInput = document.getElementById('code-1');
        if (firstInput) firstInput.focus();
    }, 100);
}

// Add this new function for auto-verification:
function autoFillAndVerify(email) {
    const demoCode = localStorage.getItem('textguard_verification_code');
    const demoEmail = localStorage.getItem('textguard_verification_email');

    if (demoCode && demoEmail === email) {
        // Auto-fill the verification code
        for (let i = 0; i < 6; i++) {
            const input = document.getElementById(`code-${i + 1}`);
            if (input && demoCode[i]) {
                input.value = demoCode[i];
            }
        }

        console.log('Auto-filled verification code:', demoCode);

        // Auto-submit after a short delay
        setTimeout(() => {
            console.log('Auto-submitting verification form...');

            // Create and dispatch submit event
            const verificationForm = document.getElementById('verification-form');
            if (verificationForm) {
                const submitEvent = new Event('submit', {
                    bubbles: true,
                    cancelable: true
                });
                verificationForm.dispatchEvent(submitEvent);
            }
        }, 1000);
    }
}

// Update the handleVerification function to redirect after success:
async function handleVerification(e) {
    e.preventDefault();

    console.log('=== VERIFICATION STARTED ===');

    // Get verification code from inputs
    const code = Array.from({ length: 6 }, (_, i) =>
        document.getElementById(`code-${i + 1}`).value
    ).join('');

    console.log('Entered code:', code);

    const errorElement = document.getElementById('verification-error');

    // Clear previous error
    if (errorElement) {
        errorElement.textContent = '';
    }

    // Validate code
    if (code.length !== 6) {
        showError('verification-error', 'Please enter the 6-digit code');
        return;
    }

    // Get pending user
    const pendingUsers = JSON.parse(localStorage.getItem('textguard_pending_users') || '{}');
    const pendingEmail = document.getElementById('verification-email').textContent;
    const pendingUser = pendingUsers[pendingEmail];

    console.log('Pending user:', pendingUser);

    if (!pendingUser) {
        showError('verification-error', 'Verification session expired. Please sign up again.');
        return;
    }

    // Check if code has expired
    if (Date.now() > pendingUser.expiresAt) {
        showError('verification-error', 'Verification code has expired. Please request a new one.');
        return;
    }

    // Verify code
    if (code !== pendingUser.verificationCode) {
        showError('verification-error', 'Invalid verification code');
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('verification-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    submitBtn.disabled = true;

    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mark user as verified
        pendingUser.user.verified = true;

        // Save user to users list
        const users = JSON.parse(localStorage.getItem('textguard_users') || '[]');
        users.push(pendingUser.user);
        localStorage.setItem('textguard_users', JSON.stringify(users));

        // Remove from pending
        delete pendingUsers[pendingEmail];
        localStorage.setItem('textguard_pending_users', JSON.stringify(pendingUsers));

        // Create auth token
        const authToken = generateAuthToken();

        // Save to localStorage
        localStorage.setItem('textguard_token', authToken);
        localStorage.setItem('textguard_user', JSON.stringify(pendingUser.user));

        // Update current user
        currentUser = pendingUser.user;

        // Update UI
        updateUIForLoggedInUser();

        // Close modal
        closeAuthModal();

        // Clear verification timer
        clearVerificationTimer();

        // Clear demo verification data
        localStorage.removeItem('textguard_demo_verification_code');
        localStorage.removeItem('textguard_demo_verification_email');

        // Show success message
        showNotification('Email verified successfully! Welcome to TextGuard AI', 'success');

        // Redirect to home page by closing modal and showing dashboard
        setTimeout(() => {
            // Scroll to dashboard section
            scrollToSection('dashboard');

            // Show welcome message
            showNotification(`Welcome ${currentUser.name}! Your account is now active.`, 'success');
        }, 500);

    } catch (error) {
        console.error('Verification error:', error);
        showError('verification-error', 'Verification failed. Please try again.');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Create visible verification demo panel
function createVerificationDemoPanel(email, code) {
    // Remove existing demo panel
    const existingPanel = document.getElementById('verification-demo-panel');
    if (existingPanel) {
        existingPanel.remove();
    }

    // Create demo panel
    const demoPanel = document.createElement('div');
    demoPanel.id = 'verification-demo-panel';
    demoPanel.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        padding: 1.5rem;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 9990;
        max-width: 300px;
        animation: slideInUp 0.5s ease;
    `;

    demoPanel.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <i class="fas fa-envelope" style="font-size: 1.5rem;"></i>
            <h4 style="margin: 0; font-size: 1.2rem;">Demo Email Verification</h4>
        </div>
        <p style="margin: 0 0 10px 0; font-size: 0.9rem; opacity: 0.9;">
            In production, this would be sent to: <strong>${email}</strong>
        </p>
        <div style="background: rgba(255, 255, 255, 0.2); padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.8rem; margin-bottom: 5px;">Your verification code:</div>
            <div style="font-size: 2rem; font-weight: bold; letter-spacing: 5px;">${code}</div>
        </div>
        <p style="margin: 10px 0 0 0; font-size: 0.8rem; opacity: 0.8;">
            <i class="fas fa-info-circle"></i> This is a demo. In a real app, you'd receive this via email.
        </p>
    `;

    document.body.appendChild(demoPanel);

    // Auto-remove after 5 minutes
    setTimeout(() => {
        if (demoPanel.parentNode) {
            demoPanel.style.opacity = '0';
            demoPanel.style.transform = 'translateY(20px)';
            demoPanel.style.transition = 'all 0.3s';
            setTimeout(() => demoPanel.remove(), 300);
        }
    }, 5 * 60 * 1000);
}

// Simulate sending reset email
function simulateSendResetEmail(email, token) {
    console.log(`[DEMO] Reset link with token ${token} sent to ${email}`);
    console.log(`[DEMO] Reset URL: /reset-password?token=${token}&email=${encodeURIComponent(email)}`);

    // For demo purposes
    localStorage.setItem('textguard_reset_token', token);
    localStorage.setItem('textguard_reset_email', email);

    // Show demo alert
    setTimeout(() => {
        showNotification(`DEMO: Reset token: ${token}. Check console for reset URL.`, 'info');
    }, 500);
}

// Start verification timer
function startVerificationTimer() {
    clearVerificationTimer();

    let timeLeft = 5 * 60; // 5 minutes in seconds
    const timerElement = document.getElementById('verification-timer');

    verificationTimer = setInterval(() => {
        timeLeft--;

        if (timeLeft <= 0) {
            clearInterval(verificationTimer);
            if (timerElement) {
                timerElement.innerHTML = 'Code expired';
                timerElement.style.color = 'var(--error)';
            }
            return;
        }

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        if (timerElement) {
            const span = timerElement.querySelector('span');
            if (span) {
                span.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }, 1000);

    // Start resend timer
    startResendTimer();
}

// Start resend timer
function startResendTimer() {
    clearResendTimer();

    let timeLeft = 60; // 60 seconds
    const resendTimerElement = document.getElementById('resend-timer');
    const resendLink = document.getElementById('resend-link');

    if (resendTimerElement) resendTimerElement.style.display = 'block';
    if (resendLink) resendLink.style.pointerEvents = 'none';

    resendTimer = setInterval(() => {
        timeLeft--;

        if (timeLeft <= 0) {
            clearInterval(resendTimer);
            if (resendTimerElement) resendTimerElement.style.display = 'none';
            if (resendLink) {
                resendLink.style.pointerEvents = 'auto';
                resendLink.textContent = 'Resend Code';
            }
            return;
        }

        if (resendTimerElement) {
            const span = resendTimerElement.querySelector('span');
            if (span) {
                span.textContent = timeLeft;
            }
        }

        if (resendLink) {
            resendLink.textContent = `Resend Code (${timeLeft}s)`;
        }
    }, 1000);
}

// Clear verification timer
function clearVerificationTimer() {
    if (verificationTimer) {
        clearInterval(verificationTimer);
        verificationTimer = null;
    }
}

// Clear resend timer
function clearResendTimer() {
    if (resendTimer) {
        clearInterval(resendTimer);
        resendTimer = null;
    }
}

// Resend verification code
function resendVerificationCode() {
    const email = document.getElementById('verification-email').textContent;

    // Generate new code
    verificationCode = generateVerificationCode();

    // Update pending user
    const pendingUsers = JSON.parse(localStorage.getItem('textguard_pending_users') || '{}');
    if (pendingUsers[email]) {
        pendingUsers[email].verificationCode = verificationCode;
        pendingUsers[email].expiresAt = Date.now() + 5 * 60 * 1000; // Reset to 5 minutes
        localStorage.setItem('textguard_pending_users', JSON.stringify(pendingUsers));
    }

    // Simulate sending email
    simulateSendVerificationEmail(email, verificationCode);

    // Restart timers
    startVerificationTimer();

    // Show success message
    showNotification('New verification code sent!', 'success');
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const authButton = document.getElementById('auth-button');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    const dropdownUserName = document.getElementById('dropdown-user-name');
    const dropdownUserEmail = document.getElementById('dropdown-user-email');

    if (currentUser) {
        // Update user info
        if (userName) userName.textContent = currentUser.name.split(' ')[0];
        if (dropdownUserName) dropdownUserName.textContent = currentUser.name;
        if (dropdownUserEmail) dropdownUserEmail.textContent = currentUser.email;

        // Show user menu, hide auth button
        if (authButton) authButton.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';

        // Update analytics data with user's data
        if (currentUser.analytics) {
            // Note: analyticsData is defined in script.js
            if (typeof analyticsData !== 'undefined') {
                analyticsData = currentUser.analytics;
                if (typeof renderDynamicDashboard === 'function') {
                    renderDynamicDashboard();
                }
            }
        }

        // Hide login prompt if visible
        const loginPrompt = document.getElementById('login-prompt');
        if (loginPrompt) {
            loginPrompt.style.display = 'none';
        }

        // Enable analyzer
        enableAnalyzer();

    } else {
        // Show auth button, hide user menu
        if (authButton) authButton.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Toggle user menu
function toggleUserMenu() {
    const userToggle = document.querySelector('.user-toggle');
    if (userToggle) {
        userToggle.classList.toggle('active');
    }
}

// Logout
function logout() {
    // Clear auth data
    localStorage.removeItem('textguard_token');
    localStorage.removeItem('textguard_user');

    // Reset current user
    currentUser = null;

    // Update UI
    updateUIForLoggedInUser();

    // Close user menu
    const userToggle = document.querySelector('.user-toggle');
    if (userToggle) {
        userToggle.classList.remove('active');
    }

    // Show notification
    showNotification('Successfully signed out', 'info');

    // Check auth state
    checkAuthState();
}

// Check auth state and show/hide login prompt
function checkAuthState() {
    const loginPrompt = document.getElementById('login-prompt');

    if (!currentUser) {
        // User is not logged in, show login prompt
        if (loginPrompt) {
            loginPrompt.style.display = 'flex';
        }
        disableAnalyzer();
    } else {
        // User is logged in, hide login prompt
        if (loginPrompt) {
            loginPrompt.style.display = 'none';
        }
        enableAnalyzer();
    }
}

// Continue as guest
function continueAsGuest() {
    const loginPrompt = document.getElementById('login-prompt');
    if (loginPrompt) {
        loginPrompt.style.display = 'none';
    }

    // Enable analyzer for guest
    enableAnalyzerForGuest();

    // Set guest mode in session storage
    sessionStorage.setItem('textguard_guest', 'true');

    showNotification('Continuing as guest. Some features are limited.', 'info');
}

// Enable analyzer for guest
function enableAnalyzerForGuest() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const textInput = document.getElementById('text-input');

    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.title = 'Analyze text (Guest mode)';
    }

    if (textInput) {
        textInput.disabled = false;
        if (typeof updateModePlaceholder === 'function') {
            updateModePlaceholder();
        }
    }
}

// Disable analyzer for non-logged in users
function disableAnalyzer() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const textInput = document.getElementById('text-input');

    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.title = 'Please sign in to analyze text';
    }

    if (textInput) {
        textInput.disabled = true;
        textInput.placeholder = 'Please sign in to analyze text...';
    }
}

// Enable analyzer
function enableAnalyzer() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const textInput = document.getElementById('text-input');

    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.title = 'Analyze text';
    }

    if (textInput) {
        textInput.disabled = false;
        if (typeof updateModePlaceholder === 'function') {
            updateModePlaceholder();
        }
    }
}

// Move to next verification code input
function moveToNext(current) {
    const currentInput = document.getElementById(`code-${current}`);
    const nextInput = document.getElementById(`code-${current + 1}`);

    if (currentInput.value.length === 1 && nextInput) {
        nextInput.focus();
    }

    // Auto-submit if all fields are filled
    if (current === 6) {
        const allFilled = Array.from({ length: 6 }, (_, i) =>
            document.getElementById(`code-${i + 1}`).value.length === 1
        ).every(Boolean);

        if (allFilled) {
            document.getElementById('verification-form').dispatchEvent(new Event('submit'));
        }
    }
}

// Login with Google (demo)
function loginWithGoogle() {
    showNotification('Google login would be implemented with Firebase/Auth0 in production', 'info');

    // For demo, create a mock user
    const mockUser = {
        id: 'google_' + Date.now(),
        name: 'Google User',
        email: 'googleuser@example.com',
        verified: true,
        createdAt: new Date().toISOString(),
        plan: 'free',
        analytics: {
            totalAnalyses: 0,
            totalCharacters: 0,
            aiDetections: 0,
            plagiarismDetections: 0,
            recentAnalyses: []
        }
    };

    // Create auth token
    const authToken = generateAuthToken();

    // Save to localStorage
    localStorage.setItem('textguard_token', authToken);
    localStorage.setItem('textguard_user', JSON.stringify(mockUser));

    // Update current user
    currentUser = mockUser;

    // Update UI
    updateUIForLoggedInUser();

    // Close modal
    closeAuthModal();

    // Show success message
    showNotification('Successfully signed in with Google!', 'success');
}

// Show terms modal
function showTerms() {
    closeAuthModal();
    showNotification('Terms & Conditions would be shown in a modal', 'info');
}

// Helper functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
    }
}

function hashPassword(password) {
    // Simple hash for demo (in production, use bcrypt or similar)
    return btoa(password).split('').reverse().join('');
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateAuthToken() {
    return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
}

function generateResetToken() {
    return 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 24);
}

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Close modals when clicking outside
document.addEventListener('click', function (e) {
    const authModal = document.getElementById('auth-modal');
    const authOverlay = document.getElementById('auth-overlay');
    const userMenu = document.querySelector('.user-menu');

    // Close auth modal when clicking outside
    if (authModal && authOverlay &&
        authModal.style.display === 'block' &&
        !authModal.contains(e.target) &&
        e.target === authOverlay) {
        closeAuthModal();
    }

    // Close user menu when clicking outside
    if (userMenu && userMenu.style.display === 'block') {
        const userToggle = userMenu.querySelector('.user-toggle');
        const userDropdown = userMenu.querySelector('.user-dropdown');

        if (!userToggle.contains(e.target) && !userDropdown.contains(e.target)) {
            userToggle.classList.remove('active');
        }
    }
});

// Close modals with Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeAuthModal();

        // Close user menu
        const userToggle = document.querySelector('.user-toggle');
        if (userToggle) {
            userToggle.classList.remove('active');
        }
    }
});

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAuth);

// Add this function to authentication.js (replace the non-existent function)
function updateAvatarUIEverywhere() {
    updateAvatarUI(); // Just call the existing function

    // Also update profile page if we're on it
    if (currentUser && window.location.pathname.includes('profile.html')) {
        const profileImg = document.getElementById('profile-avatar-img');
        if (profileImg && currentUser.profile?.avatar) {
            profileImg.src = currentUser.profile.avatar;
            profileImg.style.borderRadius = '8px';
        }
    }
}

// Add CSS for demo panel animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

function moveToNextCode(current) {
    const currentInput = document.getElementById(`code-${current}`);
    const nextInput = document.getElementById(`code-${current + 1}`);

    if (currentInput.value.length === 1 && nextInput) {
        nextInput.focus();
    }

    // Check if all fields are filled
    if (current === 6) {
        const allFilled = Array.from({ length: 6 }, (_, i) =>
            document.getElementById(`code-${i + 1}`).value.length === 1
        ).every(Boolean);

        if (allFilled) {
            document.getElementById('verification-form').dispatchEvent(new Event('submit'));
        }
    }
}

function handleVerification(e) {
    e.preventDefault();

    const code = Array.from({ length: 6 }, (_, i) =>
        document.getElementById(`code-${i + 1}`).value
    ).join('');

    console.log('Verifying code:', code);

    if (code.length !== 6) {
        const errorEl = document.getElementById('verification-error');
        if (errorEl) {
            errorEl.textContent = '⚠️ Please enter the complete 6-digit code';
        }
        return;
    }

    // Get stored verification code
    const storedCode = localStorage.getItem('textguard_verification_code');
    const email = localStorage.getItem('textguard_verification_email');

    console.log('Stored code:', storedCode);
    console.log('Entered code:', code);
    console.log('Email:', email);

    if (code === storedCode) {
        // Verification successful
        const pendingUsers = JSON.parse(localStorage.getItem('textguard_pending_users') || '{}');
        const pendingUser = pendingUsers[email];

        if (pendingUser) {
            // Move from pending to confirmed users
            const users = JSON.parse(localStorage.getItem('textguard_users') || '[]');
            const confirmedUser = {
                ...pendingUser.user,
                verified: true
            };
            users.push(confirmedUser);

            localStorage.setItem('textguard_users', JSON.stringify(users));
            delete pendingUsers[email];
            localStorage.setItem('textguard_pending_users', JSON.stringify(pendingUsers));

            // Clear verification data
            localStorage.removeItem('textguard_verification_code');
            localStorage.removeItem('textguard_verification_email');

            showNotification('✓ Email verified successfully! You can now sign in.', 'success');

            setTimeout(() => {
                showLoginTab();
            }, 2000);
        }
    } else {
        const errorEl = document.getElementById('verification-error');
        if (errorEl) {
            errorEl.textContent = '❌ Invalid verification code. Please try again.';
        }
    }
}

function resendVerificationCode() {
    const email = localStorage.getItem('textguard_verification_email');
    if (email) {
        showNotification('Verification code resent to your email!', 'success');
    }
}

function showVerificationTab(email) {
    console.log('Showing verification tab for:', email);

    // Hide all tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show verification tab
    const verificationTab = document.getElementById('verification-tab');
    if (verificationTab) {
        verificationTab.classList.add('active');
    }

    // Update email display
    const verificationEmail = document.getElementById('verification-email');
    if (verificationEmail) {
        verificationEmail.textContent = email;
    }

    // Clear any previous code inputs
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`code-${i}`);
        if (input) input.value = '';
    }

    // Focus first input
    setTimeout(() => {
        const firstInput = document.getElementById('code-1');
        if (firstInput) firstInput.focus();
    }, 100);
}

window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.showLoginTab = showLoginTab;
window.showSignupTab = showSignupTab;
window.showForgotPassword = showForgotPassword;
window.loginWithGoogle = loginWithGoogle;
window.resendVerificationCode = resendVerificationCode;
window.showTerms = showTerms;
window.togglePasswordVisibility = togglePasswordVisibility;
window.eyesWatchForm = eyesWatchForm;
window.eyesLookAway = eyesLookAway;
window.eyesLookBack = eyesLookBack;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleForgotPassword = handleForgotPassword;

window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.showLoginTab = showLoginTab;
window.showSignupTab = showSignupTab;
window.showForgotPassword = showForgotPassword;
window.loginWithGoogle = loginWithGoogle;
window.resendVerificationCode = resendVerificationCode;
window.showTerms = showTerms;
window.moveToNext = moveToNext;
window.logout = logout;
window.toggleUserMenu = toggleUserMenu;
window.continueAsGuest = continueAsGuest;

