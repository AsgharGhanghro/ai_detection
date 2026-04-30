// user-counter.js
class UserCounter {
    constructor() {
        this.initialize();
    }
    
    initialize() {
        // Initialize on load
        document.addEventListener('DOMContentLoaded', () => {
            this.updateAllCounters();
            
            // Listen for new signups
            window.addEventListener('storage', (e) => {
                if (e.key === 'textguard_users') {
                    setTimeout(() => this.updateAllCounters(), 100);
                }
            });
        });
    }
    
    // Get actual user count
    getActiveUserCount() {
        try {
            const users = JSON.parse(localStorage.getItem('textguard_users') || '[]');
            // Filter out test/duplicate users if needed
            const uniqueUsers = this.getUniqueUsers(users);
            return uniqueUsers.length;
        } catch (error) {
            console.error('Error getting user count:', error);
            return 0;
        }
    }
    
    // Get unique users by email
    getUniqueUsers(users) {
        const uniqueEmails = new Set();
        return users.filter(user => {
            if (user && user.email) {
                const email = user.email.toLowerCase();
                if (!uniqueEmails.has(email)) {
                    uniqueEmails.add(email);
                    return true;
                }
            }
            return false;
        });
    }
    
    // Update all counters on the page
    updateAllCounters() {
        const userCount = this.getActiveUserCount();
        
        // 1. Update hero section
        const heroCounter = document.getElementById('active-users-count');
        if (heroCounter) {
            this.animateCounter(heroCounter, userCount);
        }
        
        // 2. Update members modal
        this.updateMembersModal(userCount);
        
        // 3. Update dashboard if exists
        this.updateDashboard(userCount);
        
        // Save to global stats
        this.updateGlobalStats(userCount);
        
        console.log(`User count updated: ${userCount} active users`);
    }
    
    // Animate counter value
    animateCounter(element, targetValue) {
        const current = parseInt(element.textContent) || 0;
        if (current === targetValue) return;
        
        const increment = targetValue > current ? 1 : -1;
        let currentValue = current;
        
        const update = () => {
            currentValue += increment;
            element.textContent = currentValue;
            
            if ((increment > 0 && currentValue < targetValue) || 
                (increment < 0 && currentValue > targetValue)) {
                setTimeout(update, 50);
            }
        };
        
        update();
    }
    
    // Update members modal stats
    updateMembersModal(userCount) {
        // Find the active users stat in members modal
        const membersStats = document.querySelectorAll('.team-stat-value');
        if (membersStats.length >= 3) {
            // Assuming 3rd stat is active users
            membersStats[2].textContent = `${userCount}+`;
        }
        
        // Also update in the team-stats section if exists
        const teamStats = document.querySelectorAll('.team-stat-item');
        teamStats.forEach(stat => {
            const label = stat.querySelector('.team-stat-label');
            if (label && label.textContent.includes('Active Users')) {
                const value = stat.querySelector('.team-stat-value');
                if (value) {
                    value.textContent = `${userCount}+`;
                }
            }
        });
    }
    
    // Update dashboard
    updateDashboard(userCount) {
        const dashboard = document.getElementById('stats-dashboard');
        if (dashboard) {
            const userStat = dashboard.querySelector('[data-stat="active-users"]');
            if (userStat) {
                userStat.textContent = userCount;
            }
        }
    }
    
    // Update global statistics
    updateGlobalStats(userCount) {
        let globalStats = JSON.parse(localStorage.getItem('textguard_global_stats') || '{}');
        globalStats.totalUsers = userCount;
        globalStats.lastUpdated = new Date().toISOString();
        localStorage.setItem('textguard_global_stats', JSON.stringify(globalStats));
    }
    
    // Register new user (call this when user signs up)
    registerNewUser(user) {
        // Get existing users
        let users = JSON.parse(localStorage.getItem('textguard_users') || '[]');
        
        // Check if user already exists by email
        const exists = users.some(u => 
            u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()
        );
        
        if (!exists) {
            // Add new user
            users.push(user);
            localStorage.setItem('textguard_users', JSON.stringify(users));
            
            // Update counters
            this.updateAllCounters();
            
            return true;
        }
        
        return false;
    }
}

// Create global instance
window.userCounter = new UserCounter();

// Export functions for other files
function getActiveUserCount() {
    return window.userCounter?.getActiveUserCount() || 0;
}

function registerNewUser(user) {
    return window.userCounter?.registerNewUser(user) || false;
}