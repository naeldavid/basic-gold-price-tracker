class GoldTracker {
    constructor() {
        this.currentPrice = 0;
        this.previousPrice = 0;
        this.api = new GoldAPI();
        this.storage = new DataStorage();
        this.analytics = new Analytics();
        this.alerts = new AlertSystem();
        this.themes = new ThemeManager();
        
        this.priceHistory = this.storage.loadHistory();
        this.settings = this.storage.loadSettings();
        this.chart = null;
        this.razanMode = this.settings.razanMode;
        this.refreshInterval = null;
        
        this.init();
    }

    init() {
        this.themes.loadTheme();
        this.alerts.loadAlerts();
        this.alerts.soundEnabled = this.settings.soundEnabled;
        
        this.fetchGoldPrice();
        this.displayHistory();
        this.setupUI();
        this.startAutoRefresh();
        this.setupKeyboardShortcuts();
        
        if (this.razanMode) {
            setTimeout(() => {
                document.getElementById('razanMode').style.display = 'block';
                this.initChart();
                this.updateAdvancedAnalytics();
            }, 100);
        }
    }

    setupUI() {
        // Theme selector
        const themeSelect = document.getElementById('themeSelect');
        this.themes.getAvailableThemes().forEach(theme => {
            const option = document.createElement('option');
            option.value = theme;
            option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
            if (theme === this.themes.getCurrentTheme()) option.selected = true;
            themeSelect.appendChild(option);
        });

        // Sound setting
        document.getElementById('soundEnabled').checked = this.settings.soundEnabled;
        document.getElementById('soundEnabled').onchange = (e) => {
            this.settings.soundEnabled = e.target.checked;
            this.alerts.soundEnabled = e.target.checked;
            this.storage.saveSettings(this.settings);
        };

        // Refresh interval
        document.getElementById('refreshInterval').value = this.settings.refreshInterval;

        this.updateAlertsList();
        this.updatePortfolioCalculator();
    }

    async fetchGoldPrice() {
        try {
            this.previousPrice = this.currentPrice;
            this.currentPrice = await this.api.fetchPrice();
            
            this.updateDisplay();
            this.saveToHistory();
            this.alerts.checkAlerts(this.currentPrice, this.previousPrice);
            
            if (typeof triggerCoinRain === 'function' && Math.random() < 0.1) {
                triggerCoinRain();
            }
            
        } catch (error) {
            console.error('Error fetching gold price:', error);
            this.showAlert('⚠️ Unable to fetch current price. Using cached data.');
        }
    }

    updateDisplay() {
        const priceElement = document.getElementById('currentPrice');
        const changeElement = document.getElementById('priceChange');
        const loadingElement = document.getElementById('loadingText');
        const trendElement = document.getElementById('trendIndicator');

        loadingElement.style.display = 'none';
        priceElement.textContent = `$${this.currentPrice.toFixed(2)}`;

        if (this.previousPrice > 0) {
            const change = this.currentPrice - this.previousPrice;
            const changePercent = ((change / this.previousPrice) * 100).toFixed(2);
            
            changeElement.textContent = `${change >= 0 ? '+' : ''}$${change.toFixed(2)} (${changePercent}%)`;
            changeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
        }

        // Update trend indicator
        if (this.priceHistory.length > 0) {
            const prices = this.priceHistory.slice(0, 10).map(h => h.price);
            const trend = this.analytics.calculateTrend(prices);
            trendElement.textContent = trend === 'bullish' ? '📈 Bullish' : trend === 'bearish' ? '📉 Bearish' : '➡️ Neutral';
            trendElement.className = `trend-indicator trend-${trend}`;
        }

        this.updateMiniChart();
        this.updatePortfolioCalculator();
    }

    updateMiniChart() {
        const miniChart = document.getElementById('miniChart');
        if (this.priceHistory.length < 2) return;

        const prices = this.priceHistory.slice(0, 20).map(h => h.price).reverse();
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const range = max - min || 1;

        let path = '';
        let area = '';
        prices.forEach((price, i) => {
            const x = (i / (prices.length - 1)) * 100;
            const y = 100 - ((price - min) / range) * 80 - 10;
            const cmd = i === 0 ? 'M' : 'L';
            path += `${cmd}${x},${y} `;
            if (i === 0) area = `M${x},90 L${x},${y} `;
            else area += `L${x},${y} `;
        });
        area += `L${(prices.length-1) / (prices.length-1) * 100},90 Z`;

        const isPositive = prices[prices.length-1] > prices[0];
        const color = isPositive ? 'var(--success)' : 'var(--danger)';
        
        miniChart.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:${color};stop-opacity:0.05" />
                </linearGradient>
            </defs>
            <path d="${area}" fill="url(#gradient)"/>
            <path d="${path}" stroke="${color}" stroke-width="2" fill="none"/>
            <circle cx="${(prices.length-1) / (prices.length-1) * 100}" cy="${100 - ((prices[prices.length-1] - min) / range) * 80 - 10}" r="2" fill="${color}"/>
        </svg>`;
    }

    saveToHistory() {
        const timestamp = new Date().toLocaleString();
        const historyItem = {
            price: this.currentPrice,
            timestamp: timestamp,
            change: this.previousPrice > 0 ? this.currentPrice - this.previousPrice : 0
        };

        this.priceHistory.unshift(historyItem);
        
        if (this.priceHistory.length > this.storage.maxHistory) {
            this.priceHistory = this.priceHistory.slice(0, this.storage.maxHistory);
        }

        this.storage.saveHistory(this.priceHistory);
        this.displayHistory();
    }

    displayHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.priceHistory.length === 0) {
            historyList.innerHTML = '<p>No price history available yet.</p>';
            return;
        }

        historyList.innerHTML = this.priceHistory.slice(0, 20).map(item => `
            <div class="history-item">
                <span>$${item.price.toFixed(2)}</span>
                <span>${item.timestamp}</span>
                <span class="${item.change >= 0 ? 'positive' : 'negative'}">
                    ${item.change >= 0 ? '+' : ''}$${item.change.toFixed(2)}
                </span>
            </div>
        `).join('');
        
        if (this.razanMode) this.updateAdvancedAnalytics();
    }

    initChart() {
        const ctx = document.getElementById('priceChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Gold Price',
                    data: [],
                    borderColor: 'var(--accent-primary)',
                    backgroundColor: 'rgba(219, 186, 0, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: '7-Day MA',
                    data: [],
                    borderColor: 'var(--success)',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: 'var(--text-primary)' } }
                },
                scales: {
                    x: { ticks: { color: 'var(--text-secondary)' } },
                    y: { 
                        beginAtZero: false,
                        ticks: { color: 'var(--text-secondary)' }
                    }
                }
            }
        });
    }

    updateAdvancedAnalytics() {
        if (!this.chart || this.priceHistory.length === 0) return;

        const recent = this.priceHistory.slice(0, 50).reverse();
        const prices = recent.map(item => item.price);
        
        // Update chart
        this.chart.data.labels = recent.map(item => item.timestamp.split(' ')[1] || item.timestamp.split(',')[0]);
        this.chart.data.datasets[0].data = prices;
        
        // Calculate moving averages
        const ma7Data = [];
        for (let i = 6; i < prices.length; i++) {
            ma7Data.push(this.analytics.calculateMovingAverage(prices.slice(i-6, i+1), 7));
        }
        this.chart.data.datasets[1].data = [null, null, null, null, null, null, ...ma7Data];
        
        this.chart.update('none');

        // Update stats
        const allPrices = this.priceHistory.map(h => h.price);
        const high = Math.max(...allPrices.slice(0, 24));
        const low = Math.min(...allPrices.slice(0, 24));
        const volatility = this.analytics.calculateVolatility(allPrices.slice(0, 24));
        const ma7 = this.analytics.calculateMovingAverage(allPrices, 7);
        const ma30 = this.analytics.calculateMovingAverage(allPrices, 30);
        const sentiment = this.analytics.getMarketSentiment(this.priceHistory);
        const prediction = this.analytics.predictNextPrice(this.priceHistory);

        document.getElementById('dayHigh').textContent = `$${high.toFixed(2)}`;
        document.getElementById('dayLow').textContent = `$${low.toFixed(2)}`;
        document.getElementById('volatility').textContent = `${volatility.toFixed(2)}%`;
        document.getElementById('ma7').textContent = ma7 ? `$${ma7.toFixed(2)}` : 'N/A';
        document.getElementById('ma30').textContent = ma30 ? `$${ma30.toFixed(2)}` : 'N/A';
        document.getElementById('sentiment').textContent = `${sentiment.sentiment} (${sentiment.confidence}%)`;

        // Update prediction
        if (prediction) {
            document.getElementById('predictionBox').innerHTML = `
                <h4>Price Prediction</h4>
                <div>Next Update: $${prediction.toFixed(2)}</div>
                <small>Based on trend analysis and volatility</small>
            `;
        }
    }

    updateAlertsList() {
        const alertsList = document.getElementById('alertsList');
        const alerts = this.alerts.getAlertsList();
        
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item">
                <span>${alert.description}</span>
                <button onclick="removeAlert(${alert.id})" style="background: var(--danger); color: white; border: none; padding: 5px 10px; border-radius: 3px;">Remove</button>
            </div>
        `).join('');
    }

    updatePortfolioCalculator() {
        const buyPrice = parseFloat(document.getElementById('buyPrice').value);
        const amount = parseFloat(document.getElementById('amount').value) || 1;
        const resultDiv = document.getElementById('portfolioResult');

        if (buyPrice && this.currentPrice) {
            const result = this.analytics.calculateProfitLoss(buyPrice, this.currentPrice, amount);
            resultDiv.innerHTML = `
                <div style="margin-top: 10px;">
                    <div>Current Value: $${result.totalValue.toFixed(2)}</div>
                    <div class="${result.profit >= 0 ? 'positive' : 'negative'}">
                        P&L: ${result.profit >= 0 ? '+' : ''}$${result.profit.toFixed(2)} (${result.percentage.toFixed(2)}%)
                    </div>
                </div>
            `;
        }
    }

    startAutoRefresh() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(() => this.fetchGoldPrice(), this.settings.refreshInterval);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') toggleRazanMode();
            if (e.key === ' ') { e.preventDefault(); refreshPrice(); }
            if (e.key === 'h' || e.key === 'H') toggleHistory();
            if (e.key === 's' || e.key === 'S') toggleSettings();
            if (e.key === 't' || e.key === 'T') toggleTheme();
        });
    }

    showAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'price-alert';
        alert.textContent = message;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 5000);
    }

    clearHistory() {
        this.priceHistory = [];
        this.storage.saveHistory([]);
        this.displayHistory();
    }
}

// Global functions
function refreshPrice() {
    goldTracker.fetchGoldPrice();
}

function toggleHistory() {
    const historySection = document.getElementById('historySection');
    historySection.style.display = historySection.style.display === 'none' ? 'block' : 'none';
}

function toggleSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
}

function toggleRazanMode() {
    const razanMode = document.getElementById('razanMode');
    goldTracker.razanMode = !goldTracker.razanMode;
    goldTracker.settings.razanMode = goldTracker.razanMode;
    goldTracker.storage.saveSettings(goldTracker.settings);
    
    if (goldTracker.razanMode) {
        razanMode.style.display = 'block';
        if (!goldTracker.chart) goldTracker.initChart();
        goldTracker.updateAdvancedAnalytics();
    } else {
        razanMode.style.display = 'none';
    }
}

function toggleTheme() {
    goldTracker.themes.toggleTheme();
}

function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    goldTracker.themes.setTheme(theme);
}

function changeRefreshInterval() {
    const interval = parseInt(document.getElementById('refreshInterval').value);
    goldTracker.settings.refreshInterval = interval;
    goldTracker.storage.saveSettings(goldTracker.settings);
    goldTracker.startAutoRefresh();
}

function addAlert() {
    const type = document.getElementById('alertType').value;
    const value = parseFloat(document.getElementById('alertValue').value);
    
    if (value) {
        goldTracker.alerts.addAlert(type, value);
        goldTracker.updateAlertsList();
        document.getElementById('alertValue').value = '';
    }
}

function removeAlert(id) {
    goldTracker.alerts.removeAlert(id);
    goldTracker.updateAlertsList();
}

function exportData() {
    goldTracker.storage.exportData();
}

function importData(event) {
    const file = event.target.files[0];
    if (file) {
        goldTracker.storage.importData(file).then(() => {
            goldTracker.priceHistory = goldTracker.storage.loadHistory();
            goldTracker.displayHistory();
            goldTracker.showAlert('✅ Data imported successfully!');
        }).catch(error => {
            goldTracker.showAlert('❌ Import failed: ' + error.message);
        });
    }
}



// Initialize the app
let goldTracker;
document.addEventListener('DOMContentLoaded', () => {
    goldTracker = new GoldTracker();
    
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Portfolio calculator real-time updates
    ['buyPrice', 'amount'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            goldTracker.updatePortfolioCalculator();
        });
    });
});