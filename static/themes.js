class ThemeManager {
    constructor() {
        this.themes = {
            dark: {
                '--bg-primary': '#000000',
                '--bg-secondary': '#313131',
                '--bg-tertiary': 'rgba(255,255,255,0.1)',
                '--text-primary': '#ffffff',
                '--text-secondary': '#cccccc',
                '--accent-primary': '#dbba00',
                '--accent-secondary': '#91872c',
                '--success': '#28a745',
                '--danger': '#dc3545',
                '--warning': '#ffc107'
            },
            light: {
                '--bg-primary': '#ffffff',
                '--bg-secondary': '#f8f9fa',
                '--bg-tertiary': 'rgba(0,0,0,0.05)',
                '--text-primary': '#333333',
                '--text-secondary': '#666666',
                '--accent-primary': '#dbba00',
                '--accent-secondary': '#91872c',
                '--success': '#28a745',
                '--danger': '#dc3545',
                '--warning': '#ffc107'
            },
            gold: {
                '--bg-primary': '#1a1a0d',
                '--bg-secondary': '#2d2d1a',
                '--bg-tertiary': 'rgba(255,215,0,0.1)',
                '--text-primary': '#ffd700',
                '--text-secondary': '#ccaa00',
                '--accent-primary': '#ffd700',
                '--accent-secondary': '#ffed4e',
                '--success': '#32cd32',
                '--danger': '#ff6347',
                '--warning': '#ffa500'
            }
        };
        this.currentTheme = 'dark';
    }

    setTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        const root = document.documentElement;
        const theme = this.themes[themeName];
        
        Object.entries(theme).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
        
        this.currentTheme = themeName;
        localStorage.setItem('goldTrackerTheme', themeName);
        
        // Update theme indicator
        document.body.className = `theme-${themeName}`;
    }

    loadTheme() {
        const saved = localStorage.getItem('goldTrackerTheme') || 'dark';
        this.setTheme(saved);
    }

    toggleTheme() {
        const themes = Object.keys(this.themes);
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getAvailableThemes() {
        return Object.keys(this.themes);
    }
}