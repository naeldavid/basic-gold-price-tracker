class AlertSystem {
    constructor() {
        this.alerts = [];
        this.soundEnabled = false;
        this.emailEnabled = false;
        this.triggeredAlerts = new Set();
    }

    addAlert(type, value, enabled = true) {
        const alert = {
            id: Date.now(),
            type, // 'above', 'below', 'change_up', 'change_down'
            value,
            enabled,
            triggered: false
        };
        this.alerts.push(alert);
        this.saveAlerts();
        return alert.id;
    }

    removeAlert(id) {
        this.alerts = this.alerts.filter(alert => alert.id !== id);
        this.saveAlerts();
    }

    checkAlerts(currentPrice, previousPrice) {
        const change = previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;
        
        this.alerts.forEach(alert => {
            if (!alert.enabled) return;
            
            let shouldTrigger = false;
            let message = '';
            
            switch (alert.type) {
                case 'above':
                    shouldTrigger = currentPrice >= alert.value && !this.triggeredAlerts.has(`above_${alert.value}`);
                    message = `🚀 Gold price reached $${alert.value}! Current: $${currentPrice.toFixed(2)}`;
                    if (shouldTrigger) this.triggeredAlerts.add(`above_${alert.value}`);
                    break;
                    
                case 'below':
                    shouldTrigger = currentPrice <= alert.value && !this.triggeredAlerts.has(`below_${alert.value}`);
                    message = `📉 Gold price dropped to $${alert.value}! Current: $${currentPrice.toFixed(2)}`;
                    if (shouldTrigger) this.triggeredAlerts.add(`below_${alert.value}`);
                    break;
                    
                case 'change_up':
                    shouldTrigger = change >= alert.value;
                    message = `📈 Gold price increased by ${change.toFixed(2)}%! Current: $${currentPrice.toFixed(2)}`;
                    break;
                    
                case 'change_down':
                    shouldTrigger = change <= -alert.value;
                    message = `📉 Gold price decreased by ${Math.abs(change).toFixed(2)}%! Current: $${currentPrice.toFixed(2)}`;
                    break;
            }
            
            if (shouldTrigger) {
                this.triggerAlert(message, alert);
            }
        });
        
        // Reset triggered alerts when price moves away
        if (currentPrice > 1800) this.triggeredAlerts.delete('below_1800');
        if (currentPrice < 2000) this.triggeredAlerts.delete('above_2000');
    }

    triggerAlert(message, alert) {
        // Visual alert
        this.showVisualAlert(message);
        
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Gold Price Alert', {
                body: message,
                icon: 'static/favicon.ico'
            });
        }
        
        // Sound alert
        if (this.soundEnabled) {
            this.playAlertSound();
        }
        
        // Email alert (placeholder for future implementation)
        if (this.emailEnabled) {
            this.sendEmailAlert(message);
        }
    }

    showVisualAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'price-alert';
        alert.textContent = message;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 5000);
    }

    playAlertSound() {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.play().catch(() => {}); // Ignore errors
    }

    sendEmailAlert(message) {
        // Placeholder for email integration
        console.log('Email alert would be sent:', message);
    }

    saveAlerts() {
        localStorage.setItem('goldPriceAlerts', JSON.stringify(this.alerts));
    }

    loadAlerts() {
        const saved = localStorage.getItem('goldPriceAlerts');
        this.alerts = saved ? JSON.parse(saved) : [
            { id: 1, type: 'below', value: 1800, enabled: true }
        ];
    }

    getAlertsList() {
        return this.alerts.map(alert => ({
            ...alert,
            description: this.getAlertDescription(alert)
        }));
    }

    getAlertDescription(alert) {
        switch (alert.type) {
            case 'above': return `Price above $${alert.value}`;
            case 'below': return `Price below $${alert.value}`;
            case 'change_up': return `Price increase ≥${alert.value}%`;
            case 'change_down': return `Price decrease ≥${alert.value}%`;
            default: return 'Unknown alert';
        }
    }
}