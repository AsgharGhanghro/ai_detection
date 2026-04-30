// global-stats.js
const GlobalStats = {
    // Get or initialize global stats
    getStats: function() {
        let stats = JSON.parse(localStorage.getItem('textguard_global_stats') || '{}');
        
        // Initialize if doesn't exist
        if (!stats.initialized) {
            stats = {
                initialized: true,
                totalUsers: 0,
                totalAnalyses: 0,
                totalAIResults: 0,
                totalPlagiarismChecks: 0,
                averageAccuracy: 99.0,
                lastUpdated: new Date().toISOString()
            };
            
            // Get initial user count
            const users = JSON.parse(localStorage.getItem('textguard_users') || '[]');
            stats.totalUsers = users.length;
            
            localStorage.setItem('textguard_global_stats', JSON.stringify(stats));
        }
        
        return stats;
    },
    
    // Update user count
    updateUserCount: function() {
        const stats = this.getStats();
        const users = JSON.parse(localStorage.getItem('textguard_users') || '[]');
        stats.totalUsers = users.length;
        stats.lastUpdated = new Date().toISOString();
        localStorage.setItem('textguard_global_stats', JSON.stringify(stats));
        
        // Update UI if needed
        this.updateUI();
    },
    
    // Update analysis count
    updateAnalysisCount: function() {
        const stats = this.getStats();
        stats.totalAnalyses++;
        stats.lastUpdated = new Date().toISOString();
        localStorage.setItem('textguard_global_stats', JSON.stringify(stats));
    },
    
    // Update UI elements
    updateUI: function() {
        const stats = this.getStats();
        
        // Update hero stats
        const heroStat = document.querySelector('.hero-stats');
        if (heroStat) {
            const userCountElement = heroStat.querySelector('.stat-item:nth-child(3) .stat-value');
            if (userCountElement) {
                userCountElement.setAttribute('data-target', stats.totalUsers);
                userCountElement.textContent = stats.totalUsers;
            }
        }
        
        // Update dashboard if exists
        this.updateDashboardStats();
    },
    
    // Update dashboard stats
    updateDashboardStats: function() {
        const stats = this.getStats();
        
        // Find and update global stats in dashboard
        const globalStatsElements = document.querySelectorAll('[data-stat-type]');
        globalStatsElements.forEach(element => {
            const statType = element.getAttribute('data-stat-type');
            if (stats[statType] !== undefined) {
                element.textContent = stats[statType].toLocaleString();
            }
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    GlobalStats.getStats();
    GlobalStats.updateUI();
});