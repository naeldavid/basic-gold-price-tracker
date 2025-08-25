class DataStorage {
    constructor() {
        this.maxHistory = 1000;
        this.compressionEnabled = true;
    }

    saveHistory(history) {
        const compressed = this.compressionEnabled ? this.compress(history) : history;
        localStorage.setItem('goldPriceHistory', JSON.stringify(compressed));
    }

    loadHistory() {
        const data = localStorage.getItem('goldPriceHistory');
        if (!data) return [];
        
        const parsed = JSON.parse(data);
        return this.compressionEnabled && parsed.compressed ? this.decompress(parsed) : parsed;
    }

    compress(history) {
        return {
            compressed: true,
            data: history.map(item => [
                Math.round(item.price * 100),
                new Date(item.timestamp).getTime(),
                Math.round((item.change || 0) * 100)
            ])
        };
    }

    decompress(compressed) {
        return compressed.data.map(item => ({
            price: item[0] / 100,
            timestamp: new Date(item[1]).toLocaleString(),
            change: item[2] / 100
        }));
    }

    exportData() {
        const data = {
            history: this.loadHistory(),
            settings: this.loadSettings(),
            alerts: this.loadAlerts(),
            exported: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gold-tracker-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.history) this.saveHistory(data.history);
                    if (data.settings) this.saveSettings(data.settings);
                    if (data.alerts) this.saveAlerts(data.alerts);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }

    saveSettings(settings) {
        localStorage.setItem('goldTrackerSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const defaults = {
            theme: 'dark',
            refreshInterval: 300000,
            soundEnabled: false,
            razanMode: false
        };
        const saved = localStorage.getItem('goldTrackerSettings');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    saveAlerts(alerts) {
        localStorage.setItem('goldPriceAlerts', JSON.stringify(alerts));
    }

    loadAlerts() {
        const saved = localStorage.getItem('goldPriceAlerts');
        return saved ? JSON.parse(saved) : [{ type: 'below', value: 1800, enabled: true }];
    }
}