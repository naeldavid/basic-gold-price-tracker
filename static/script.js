class GoldTracker {
    constructor() {
        this.currentPrice = 0;
        this.previousPrice = 0;
        this.priceHistory = JSON.parse(localStorage.getItem('goldPriceHistory')) || [];
        this.init();
    }

    init() {
        this.fetchGoldPrice();
        this.displayHistory();
        setInterval(() => this.fetchGoldPrice(), 30);
    }

    async fetchGoldPrice() {
        try {
            const response = await fetch('https://api.metals.live/v1/spot/gold');
            const data = await response.json();
            
            this.previousPrice = this.currentPrice;
            this.currentPrice = data.price;
            
            this.updateDisplay();
            this.saveToHistory();
            
        } catch (error) {
            console.error('Error fetching gold price:', error);
            this.simulatePrice();
        }
    }

    simulatePrice() {
        const basePrice = 2000;
        const variation = (Math.random() - 0.5) * 50;
        this.previousPrice = this.currentPrice;
        this.currentPrice = basePrice + variation;
        this.updateDisplay();
        this.saveToHistory();
    }

    updateDisplay() {
        const priceElement = document.getElementById('currentPrice');
        const changeElement = document.getElementById('priceChange');
        const loadingElement = document.getElementById('loadingText');

        loadingElement.style.display = 'none';

        priceElement.textContent = `$${this.currentPrice.toFixed(2)}`;

        if (this.previousPrice > 0) {
            const change = this.currentPrice - this.previousPrice;
            const changePercent = ((change / this.previousPrice) * 100).toFixed(2);
            
            changeElement.textContent = `${change >= 0 ? '+' : ''}$${change.toFixed(2)} (${changePercent}%)`;
            changeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
        }
    }

    saveToHistory() {
        const timestamp = new Date().toLocaleString();
        const historyItem = {
            price: this.currentPrice,
            timestamp: timestamp,
            change: this.previousPrice > 0 ? this.currentPrice - this.previousPrice : 0
        };

        this.priceHistory.unshift(historyItem);
        
        if (this.priceHistory.length > 10) {
            this.priceHistory = this.priceHistory.slice(0, 10);
        }

        localStorage.setItem('goldPriceHistory', JSON.stringify(this.priceHistory));
        this.displayHistory();
    }

    displayHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.priceHistory.length === 0) {
            historyList.innerHTML = '<p>No price history available yet.</p>';
            return;
        }

        historyList.innerHTML = this.priceHistory.map(item => `
            <div class="history-item">
                <span>$${item.price.toFixed(2)}</span>
                <span>${item.timestamp}</span>
                <span class="${item.change >= 0 ? 'positive' : 'negative'}">
                    ${item.change >= 0 ? '+' : ''}$${item.change.toFixed(2)}
                </span>
            </div>
        `).join('');
    }

    clearHistory() {
        this.priceHistory = [];
        localStorage.removeItem('goldPriceHistory');
        this.displayHistory();
    }
}

// Global functions for button clicks
function refreshPrice() {
    goldTracker.fetchGoldPrice();
}

function toggleHistory() {
    const historySection = document.getElementById('historySection');
    historySection.style.display = historySection.style.display === 'none' ? 'block' : 'none';
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all price history?')) {
        goldTracker.clearHistory();
    }
}

// Initialize the app when page loads
let goldTracker;
document.addEventListener('DOMContentLoaded', () => {
    goldTracker = new GoldTracker();
});