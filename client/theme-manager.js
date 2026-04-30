// theme-manager.js
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('textguard_theme') || 'dark';
        this.init();
    }
    
    init() {
        this.applyTheme();
        this.setupThemeSwitch();
        this.setupThemeChangeListener();
    }
    
    applyTheme() {
        // Set theme attribute on html element
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Update theme switch if exists
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) {
            themeSwitch.checked = this.theme === 'light';
        }
        
        // Apply CSS variables based on theme
        this.applyThemeVariables();
        
        console.log('Theme applied:', this.theme);
    }
    
    applyThemeVariables() {
        const root = document.documentElement;
        
        if (this.theme === 'light') {
            // Light theme - White backgrounds
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f8fafc');
            root.style.setProperty('--bg-card', '#ffffff');
            root.style.setProperty('--bg-glass', 'rgba(255, 255, 255, 0.8)');
            root.style.setProperty('--text-primary', '#1e293b');
            root.style.setProperty('--text-secondary', '#64748b');
            root.style.setProperty('--border-color', '#e2e8f0');
            root.style.setProperty('--profile-bg', '#ffffff');
            root.style.setProperty('--profile-card-bg', '#ffffff');
            root.style.setProperty('--profile-card-border', '#e2e8f0');
            root.style.setProperty('--profile-text-primary', '#1e293b');
            root.style.setProperty('--profile-text-secondary', '#64748b');
        } else {
            // Dark theme - Dark backgrounds
            root.style.setProperty('--bg-primary', '#0f172a');
            root.style.setProperty('--bg-secondary', '#1e293b');
            root.style.setProperty('--bg-card', 'rgba(30, 41, 59, 0.7)');
            root.style.setProperty('--bg-glass', 'rgba(15, 23, 42, 0.8)');
            root.style.setProperty('--text-primary', '#f1f5f9');
            root.style.setProperty('--text-secondary', '#94a3b8');
            root.style.setProperty('--border-color', 'rgba(148, 163, 184, 0.1)');
            root.style.setProperty('--profile-bg', '#0f172a');
            root.style.setProperty('--profile-card-bg', 'rgba(30, 41, 59, 0.7)');
            root.style.setProperty('--profile-card-border', 'rgba(148, 163, 184, 0.1)');
            root.style.setProperty('--profile-text-primary', '#f1f5f9');
            root.style.setProperty('--profile-text-secondary', '#94a3b8');
        }
    }
    
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('textguard_theme', this.theme);
        this.applyTheme();
        
        // Show notification
        this.showNotification(`Switched to ${this.theme} mode`, 'success');
        
        return this.theme;
    }
    
    setupThemeSwitch() {
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) {
            themeSwitch.addEventListener('change', () => {
                this.toggleTheme();
            });
        }
    }
    
    setupThemeChangeListener() {
        // Listen for theme changes from other pages
        window.addEventListener('storage', (e) => {
            if (e.key === 'textguard_theme') {
                this.theme = e.newValue || 'dark';
                this.applyTheme();
            }
        });
    }

    
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Add animation styles if not present
        if (!document.getElementById('notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Create global instance
window.themeManager = new ThemeManager();