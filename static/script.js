class UniversalTracker {
    constructor() {
        this.currentAsset = 'btc';
        this.currentCategory = 'crypto';
        this.currentPrice = 0;
        this.previousPrice = 0;
        this.allPrices = {};
        this.api = new UniversalAPI();
        this.storage = new DataStorage();
        this.analytics = new Analytics();
        this.alerts = new AlertSystem();
        this.themes = new ThemeManager();
        
        this.priceHistory = this.storage.loadHistory();
        this.settings = this.storage.loadSettings();
        this.chart = null;
        this.refreshInterval = null;
        
        this.init();
    }

    init() {
        this.themes.loadTheme();
        this.setupCategoryTabs();
        this.setupAssetTabs();
        this.setupUI();
        this.setupKeyboardShortcuts();
        
        setTimeout(() => {
            this.fetchAllPrices();
            this.startAutoRefresh();
            this.loadNews();
        }, 100);
    }

    setupCategoryTabs() {
        const categoryTabs = document.querySelectorAll('.category-tab');
        categoryTabs.forEach(tab => {
            tab.onclick = () => {
                this.currentCategory = tab.dataset.category;
                categoryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.setupAssetTabs();
            };
        });
    }

    setupAssetTabs() {
        const assetTabs = document.getElementById('assetTabs');
        if (!assetTabs) return;
        
        assetTabs.innerHTML = '';
        
        const assets = this.api.getAssetsByType(this.currentCategory);
        assets.forEach((asset) => {
            const assetInfo = this.api.getAssetInfo(asset);
            if (!assetInfo) return;
            
            const tab = document.createElement('button');
            tab.className = `asset-tab ${asset === this.currentAsset ? 'active' : ''}`;
            tab.dataset.asset = asset;
            tab.textContent = `${assetInfo.emoji} ${assetInfo.name}`;
            tab.onclick = () => this.switchAsset(asset);
            assetTabs.appendChild(tab);
        });

        if (!assets.includes(this.currentAsset) && assets.length > 0) {
            this.switchAsset(assets[0]);
        }
    }

    switchAsset(asset) {
        this.currentAsset = asset;
        document.querySelectorAll('.asset-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.asset === asset);
        });
        
        const assetInfo = this.api.getAssetInfo(asset);
        const header = document.getElementById('metalHeader');
        if (header && assetInfo) {
            header.textContent = `${assetInfo.emoji} ${assetInfo.name}`;
        }
        
        this.currentPrice = this.allPrices[asset] || 0;
        this.updateDisplay();
        this.loadAssetHistory(asset);
    }

    async fetchAllPrices() {
        try {
            const loadingText = document.getElementById('loadingText');
            if (loadingText) loadingText.style.display = 'block';
            
            this.allPrices = await this.api.fetchAllPrices();
            
            if (!this.allPrices || Object.keys(this.allPrices).length === 0) {
                throw new Error('No prices received');
            }
            
            this.previousPrice = this.currentPrice;
            this.currentPrice = this.allPrices[this.currentAsset] || 0;
            
            this.updateDisplay();
            this.updateAssetsOverview();
            this.saveToHistory();
            
            if (loadingText) loadingText.style.display = 'none';
            
        } catch (error) {
            console.error('Error fetching prices:', error);
            const loadingText = document.getElementById('loadingText');
            if (loadingText) loadingText.style.display = 'none';
        }
    }

    updateAssetsOverview() {
        const assetsGrid = document.getElementById('assetsGrid');
        if (!assetsGrid) return;
        
        assetsGrid.innerHTML = '';
        
        const assetsToShow = this.api.getUserSelectedAssets();
        
        assetsToShow.forEach(asset => {
            const assetInfo = this.api.getAssetInfo(asset);
            if (!assetInfo) return;
            
            const price = this.allPrices[asset] || 0;
            const change = this.calculateChange(asset);
            
            const card = document.createElement('div');
            card.className = `asset-card ${asset === this.currentAsset ? 'selected' : ''}`;
            card.onclick = () => {
                if (assetInfo.type !== this.currentCategory) {
                    this.currentCategory = assetInfo.type;
                    document.querySelectorAll('.category-tab').forEach(tab => {
                        tab.classList.toggle('active', tab.dataset.category === assetInfo.type);
                    });
                    this.setupAssetTabs();
                }
                this.switchAsset(asset);
            };
            
            card.innerHTML = `
                <div style="font-size: 1.5em;">${assetInfo.emoji}</div>
                <div style="font-weight: 600; font-size: 0.9em;">${assetInfo.name}</div>
                <div style="font-size: 1.1em; margin: 5px 0;">${this.formatPrice(price, asset)}</div>
                <div class="${change >= 0 ? 'positive' : 'negative'}" style="font-size: 0.8em;">
                    ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                </div>
                <div class="asset-type-badge">${assetInfo.type.toUpperCase()}</div>
            `;
            
            assetsGrid.appendChild(card);
        });
    }

    formatPrice(price, asset) {
        if (!price || isNaN(price)) return 'N/A';
        
        const assetInfo = this.api.getAssetInfo(asset);
        const baseCurrency = this.api.getBaseCurrency();
        
        if (assetInfo && assetInfo.type === 'bigmac') {
            if (asset.includes('jp')) return `¥${price.toFixed(0)}`;
            if (asset.includes('eu')) return `€${price.toFixed(2)}`;
            if (asset.includes('uk')) return `£${price.toFixed(2)}`;
            return `$${price.toFixed(2)}`;
        }
        
        switch (baseCurrency) {
            case 'EUR': return `€${price.toFixed(2)}`;
            case 'GBP': return `£${price.toFixed(2)}`;
            case 'JPY': return `¥${price.toFixed(0)}`;
            default: return `$${price.toLocaleString()}`;
        }
    }

    calculateChange(asset) {
        const history = this.storage.loadHistory(asset);
        if (history.length < 2) {
            const current = this.allPrices[asset] || 0;
            const fallback = this.api.fallbackPrices[asset] || current;
            if (fallback === 0) return 0;
            return ((current - fallback) / fallback) * 100;
        }
        const current = this.allPrices[asset];
        const previous = history[1]?.price || history[0]?.price || current;
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    }

    updateDisplay() {
        const priceElement = document.getElementById('currentPrice');
        const changeElement = document.getElementById('priceChange');
        
        if (!priceElement) return;
        
        if (!this.currentPrice || isNaN(this.currentPrice) || this.currentPrice <= 0) {
            priceElement.textContent = 'Loading price...';
            return;
        }
        
        priceElement.textContent = this.formatPrice(this.currentPrice, this.currentAsset);

        if (changeElement && this.previousPrice > 0 && !isNaN(this.previousPrice)) {
            const change = this.currentPrice - this.previousPrice;
            const changePercent = ((change / this.previousPrice) * 100);
            
            if (!isNaN(change) && !isNaN(changePercent)) {
                changeElement.textContent = `${change >= 0 ? '+' : ''}${this.formatPrice(Math.abs(change), this.currentAsset)} (${changePercent.toFixed(2)}%)`;
                changeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
            }
        }
    }

    async loadNews() {
        const newsList = document.getElementById('newsList');
        if (!newsList) return;
        
        try {
            newsList.innerHTML = '<p>Loading news...</p>';
            const news = await this.api.fetchNews();
            this.displayNews(news);
        } catch (error) {
            console.warn('Failed to load news:', error);
            newsList.innerHTML = '<p>News temporarily unavailable</p>';
        }
    }

    displayNews(articles) {
        const newsList = document.getElementById('newsList');
        if (!newsList) return;
        
        if (!articles || articles.length === 0) {
            newsList.innerHTML = '<p>No news available</p>';
            return;
        }

        newsList.innerHTML = articles.slice(0, 5).map(article => `
            <div class="news-item" onclick="window.open('${article.url}', '_blank')">
                <div class="news-title">${article.title}</div>
                <div class="news-source">${article.source.name} • ${new Date(article.publishedAt).toLocaleDateString()}</div>
            </div>
        `).join('');
    }

    saveToHistory() {
        if (!this.currentPrice || this.currentPrice <= 0) return;
        
        const timestamp = new Date().toLocaleString();
        const historyItem = {
            price: this.currentPrice,
            timestamp: timestamp,
            change: this.previousPrice > 0 ? this.currentPrice - this.previousPrice : 0,
            asset: this.currentAsset
        };

        this.priceHistory.unshift(historyItem);
        
        if (this.priceHistory.length > 1000) {
            this.priceHistory = this.priceHistory.slice(0, 1000);
        }

        this.storage.saveHistory(this.priceHistory, this.currentAsset);
        this.displayHistory();
    }

    loadAssetHistory(asset) {
        this.priceHistory = this.storage.loadHistory(asset);
        this.displayHistory();
    }

    displayHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        if (this.priceHistory.length === 0) {
            historyList.innerHTML = '<p>No price history available yet.</p>';
            return;
        }

        historyList.innerHTML = this.priceHistory.slice(0, 20).map(item => `
            <div class="history-item">
                <span>${this.formatPrice(item.price, item.asset || this.currentAsset)}</span>
                <span>${item.timestamp}</span>
                <span class="${item.change >= 0 ? 'positive' : 'negative'}">
                    ${item.change >= 0 ? '+' : ''}${this.formatPrice(Math.abs(item.change), item.asset || this.currentAsset)}
                </span>
            </div>
        `).join('');
        
        // Update analytics if advanced mode is visible
        const advancedMode = document.getElementById('advancedMode');
        if (advancedMode && advancedMode.style.display === 'block') {
            this.updateAdvancedAnalytics();
        }
    }

    updateAdvancedAnalytics() {
        if (!this.priceHistory || this.priceHistory.length === 0) return;
        
        const prices = this.priceHistory.map(h => h.price).filter(p => p && !isNaN(p));
        if (prices.length === 0) return;
        
        try {
            const high = Math.max(...prices.slice(0, 24));
            const low = Math.min(...prices.slice(0, 24));
            const volatility = this.analytics.calculateVolatility(prices.slice(0, 24));
            const ma7 = this.analytics.calculateMovingAverage(prices, 7);
            const ma30 = this.analytics.calculateMovingAverage(prices, 30);
            const sentiment = this.analytics.getMarketSentiment(this.priceHistory);
            
            const dayHighEl = document.getElementById('dayHigh');
            const dayLowEl = document.getElementById('dayLow');
            const volatilityEl = document.getElementById('volatility');
            const ma7El = document.getElementById('ma7');
            const ma30El = document.getElementById('ma30');
            const sentimentEl = document.getElementById('sentiment');
            
            if (dayHighEl) dayHighEl.textContent = this.formatPrice(high, this.currentAsset);
            if (dayLowEl) dayLowEl.textContent = this.formatPrice(low, this.currentAsset);
            if (volatilityEl) volatilityEl.textContent = `${volatility.toFixed(2)}%`;
            if (ma7El) ma7El.textContent = ma7 ? this.formatPrice(ma7, this.currentAsset) : 'N/A';
            if (ma30El) ma30El.textContent = ma30 ? this.formatPrice(ma30, this.currentAsset) : 'N/A';
            if (sentimentEl) sentimentEl.textContent = `${sentiment.sentiment} (${sentiment.confidence}%)`;
            
        } catch (error) {
            console.error('Analytics update failed:', error);
        }
    }

    setupUI() {
        const baseCurrencySelect = document.getElementById('baseCurrencySelect');
        if (baseCurrencySelect) {
            baseCurrencySelect.value = this.api.getBaseCurrency();
        }

        this.setupAssetSelection();
    }

    setupAssetSelection() {
        const assetSelection = document.getElementById('assetSelection');
        if (!assetSelection) return;
        
        const selectedAssets = this.api.getUserSelectedAssets();
        
        assetSelection.innerHTML = '';
        
        const types = ['crypto', 'metal', 'currency', 'bigmac'];
        types.forEach(type => {
            const typeAssets = this.api.getAssetsByType(type);
            
            const typeHeader = document.createElement('div');
            typeHeader.style.fontWeight = 'bold';
            typeHeader.style.marginTop = '10px';
            typeHeader.style.marginBottom = '5px';
            typeHeader.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            assetSelection.appendChild(typeHeader);
            
            typeAssets.forEach(asset => {
                const assetInfo = this.api.getAssetInfo(asset);
                if (!assetInfo) return;
                
                const label = document.createElement('label');
                label.style.display = 'block';
                label.style.marginBottom = '3px';
                label.innerHTML = `
                    <input type="checkbox" value="${asset}" ${selectedAssets.includes(asset) ? 'checked' : ''}>
                    ${assetInfo.emoji} ${assetInfo.name}
                `;
                assetSelection.appendChild(label);
            });
        });
    }

    startAutoRefresh() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(() => this.fetchAllPrices(), 300000); // 5 minutes
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') { e.preventDefault(); this.fetchAllPrices(); }
            if (e.key === 'h' || e.key === 'H') toggleHistory();
            if (e.key === 's' || e.key === 'S') toggleSettings();
            if (e.key === 'n' || e.key === 'N') toggleNews();
            if (e.key === 'a' || e.key === 'A') toggleAdvanced();
        });
    }
}

// Global functions
function refreshPrice() {
    if (window.universalTracker) {
        window.universalTracker.fetchAllPrices();
    }
}

function toggleHistory() {
    const historySection = document.getElementById('historySection');
    if (historySection) {
        historySection.style.display = historySection.style.display === 'none' ? 'block' : 'none';
    }
}

function toggleSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    if (settingsPanel) {
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    }
}

function toggleNews() {
    const newsFeed = document.getElementById('newsFeed');
    if (newsFeed) {
        const isHidden = newsFeed.style.display === 'none' || !newsFeed.style.display;
        newsFeed.style.display = isHidden ? 'block' : 'none';
        
        if (isHidden && window.universalTracker) {
            window.universalTracker.loadNews();
        }
    }
}

function toggleAdvanced() {
    const advancedMode = document.getElementById('advancedMode');
    if (advancedMode) {
        const isHidden = advancedMode.style.display === 'none' || !advancedMode.style.display;
        advancedMode.style.display = isHidden ? 'block' : 'none';
        
        if (isHidden && window.universalTracker) {
            setTimeout(() => {
                if (!window.universalTracker.chart) {
                    window.universalTracker.chart = new CustomChart('customChart');
                }
                window.universalTracker.updateAdvancedAnalytics();
            }, 100);
        }
    }
}

function changeBaseCurrency() {
    const currency = document.getElementById('baseCurrencySelect').value;
    if (window.universalTracker) {
        window.universalTracker.api.setBaseCurrency(currency);
        window.universalTracker.updateDisplay();
        window.universalTracker.updateAssetsOverview();
    }
}

function saveAssetSelection() {
    const checkboxes = document.querySelectorAll('#assetSelection input[type="checkbox"]:checked');
    const selectedAssets = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedAssets.length === 0) {
        alert('Please select at least one asset to track.');
        return;
    }
    
    if (window.universalTracker) {
        window.universalTracker.api.saveUserSelection(selectedAssets);
        window.universalTracker.fetchAllPrices();
        window.universalTracker.setupAssetTabs();
        window.universalTracker.updateAssetsOverview();
        alert('✅ Asset selection saved!');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.universalTracker = new UniversalTracker();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        document.body.innerHTML = '<div style="text-align:center;padding:50px;color:white;">Application failed to load. Please refresh the page.</div>';
    }
});