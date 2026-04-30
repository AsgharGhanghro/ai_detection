// avatar-sync.js
(function () {
    'use strict';

    // Function to update avatar in navbar
    function updateNavbarAvatar() {
        const userData = localStorage.getItem('textguard_user');
        if (!userData) return;

        const user = JSON.parse(userData);
        const avatarUrl = user.profile?.avatar;

        // Update user dropdown avatar
        const avatarElements = document.querySelectorAll('.user-avatar, .user-avatar-large');
        avatarElements.forEach(element => {
            if (avatarUrl) {
                element.innerHTML = `<img src="${avatarUrl}" alt="${user.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                const initials = user.name ?
                    user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
                element.innerHTML = `<span style="color: white; font-weight: bold; font-size: 0.9rem;">${initials}</span>`;
            }
        });

        // Update profile page avatar if we're on profile.html
        const profileAvatar = document.getElementById('avatar-image');
        if (profileAvatar && avatarUrl) {
            profileAvatar.innerHTML = `<img src="${avatarUrl}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
    }

    // Function to initialize avatar sync
    function initializeAvatarSync() {
        // Initial update
        updateNavbarAvatar();

        // Listen for avatar updates from profile page
        window.addEventListener('message', function (event) {
            if (event.data.type === 'AVATAR_UPDATE') {
                const userData = localStorage.getItem('textguard_user');
                if (userData) {
                    const user = JSON.parse(userData);
                    if (!user.profile) user.profile = {};
                    user.profile.avatar = event.data.avatar;
                    localStorage.setItem('textguard_user', JSON.stringify(user));
                    updateNavbarAvatar();
                }
            }
        });

        // Update when user data changes
        window.addEventListener('storage', function (event) {
            if (event.key === 'textguard_user') {
                setTimeout(updateNavbarAvatar, 100);
            }
        });
    }

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAvatarSync);
    } else {
        initializeAvatarSync();
    }
})();