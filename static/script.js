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
        this.razanMode = this.settings.razanMode;
        this.refreshInterval = null;
        this.realTimeMode = false;
        
        this.init();
    }

    init() {
        this.themes.loadTheme();
        this.alerts.loadAlerts();
        this.alerts.soundEnabled = this.settings.soundEnabled;
        
        this.setupCategoryTabs();
        this.setupAssetTabs();
        this.displayHistory();
        this.setupUI();
        this.setupKeyboardShortcuts();
        
        setTimeout(() => {
            this.fetchAllPrices();
            this.startAutoRefresh();
            this.loadNews();
        }, 100);
        
        if (this.razanMode) {
            setTimeout(() => {
                const razanMode = document.getElementById('razanMode');
                if (razanMode) {
                    razanMode.style.display = 'block';
                    this.initChart();
                    setTimeout(() => this.updateAdvancedAnalytics(), 200);
                }
            }, 500);
        }
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
        assetTabs.innerHTML = '';
        
        const assets = this.api.getAssetsByType(this.currentCategory);
        assets.forEach((asset, index) => {
            const assetInfo = this.api.getAssetInfo(asset);
            const tab = document.createElement('button');
            tab.className = `asset-tab ${asset === this.currentAsset ? 'active' : ''}`;
            tab.dataset.asset = asset;
            tab.textContent = `${assetInfo.emoji} ${assetInfo.name}`;
            tab.onclick = () => this.switchAsset(asset);
            assetTabs.appendChild(tab);
        });

        if (!assets.includes(this.currentAsset)) {
            this.switchAsset(assets[0]);
        }
    }

    switchAsset(asset) {
        this.currentAsset = asset;
        document.querySelectorAll('.asset-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.asset === asset);
        });
        
        const assetInfo = this.api.getAssetInfo(asset);
        document.getElementById('metalHeader').textContent = `${assetInfo.emoji} ${assetInfo.name}`;
        
        this.currentPrice = this.allPrices[asset] || 0;
        this.updateDisplay();
        this.loadAssetHistory(asset);
    }

    async fetchAllPrices() {
        try {
            document.getElementById('loadingText').style.display = 'block';
            this.allPrices = await this.api.fetchAllPrices();
            
            if (!this.allPrices || Object.keys(this.allPrices).length === 0) {
                throw new Error('No prices received');
            }
            
            this.previousPrice = this.currentPrice;
            this.currentPrice = this.allPrices[this.currentAsset] || 0;
            
            this.updateDisplay();
            this.updateAssetsOverview();
            this.saveToHistory();
            
            if (this.realTimeMode) {
                this.updatePriceTicker();
            }
            
            document.getElementById('loadingText').style.display = 'none';
            
        } catch (error) {
            console.error('Error fetching prices:', error);
            document.getElementById('loadingText').style.display = 'none';
        }
    }

    updateAssetsOverview() {
        const assetsGrid = document.getElementById('assetsGrid');
        const showAll = document.getElementById('showAllAssets')?.checked !== false;
        
        if (!showAll) {
            assetsGrid.style.display = 'none';
            return;
        }
        
        assetsGrid.style.display = 'grid';
        assetsGrid.innerHTML = '';
        
        const assetsToShow = this.api.getUserSelectedAssets();
        
        assetsToShow.forEach(asset => {
            const assetInfo = this.api.getAssetInfo(asset);
            const price = this.allPrices[asset];
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
            
            const formatPrice = (price, asset) => {
                const assetInfo = this.api.getAssetInfo(asset);
                const baseCurrency = this.api.getBaseCurrency();
                
                if (assetInfo.type === 'bigmac') {
                    if (asset.includes('jp')) return `¥${price.toFixed(0)}`;
                    if (asset.includes('eu')) return `€${price.toFixed(2)}`;
                    if (asset.includes('uk')) return `£${price.toFixed(2)}`;
                    return `$${price.toFixed(2)}`;
                }
                
                switch (baseCurrency) {
                    case 'EUR': return `€${price.toFixed(2)}`;
                    case 'GBP': return `£${price.toFixed(2)}`;
                    case 'JPY': return `¥${price.toFixed(0)}`;
                    case 'CAD': return `C$${price.toFixed(2)}`;
                    case 'AUD': return `A$${price.toFixed(2)}`;
                    default: return `$${price.toLocaleString()}`;
                }
            };
            
            card.innerHTML = `
                <div style="font-size: 1.5em;">${assetInfo.emoji}</div>
                <div style="font-weight: 600; font-size: 0.9em;">${assetInfo.name}</div>
                <div style="font-size: 1.1em; margin: 5px 0;">${formatPrice(price, asset)}</div>
                <div class="${change >= 0 ? 'positive' : 'negative'}" style="font-size: 0.8em;">
                    ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                </div>
                <div class="asset-type-badge">${assetInfo.type.toUpperCase()}</div>
            `;
            
            assetsGrid.appendChild(card);
        });
    }

    calculateChange(asset) {
        const history = this.storage.loadHistory(asset);
        if (history.length < 2) {
            // Use fallback calculation if no history
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
        const trendElement = document.getElementById('trendIndicator');
        
        if (!this.currentPrice || isNaN(this.currentPrice) || this.currentPrice <= 0) {
            priceElement.textContent = 'Loading price...';
            return;
        }
        
        const formatPrice = (price) => {
            if (!price || isNaN(price)) return 'N/A';
            
            const baseCurrency = this.api.getBaseCurrency();
            const assetInfo = this.api.getAssetInfo(this.currentAsset);
            
            if (assetInfo.type === 'bigmac') {
                if (this.currentAsset.includes('jp')) return `¥${price.toFixed(0)}`;
                if (this.currentAsset.includes('eu')) return `€${price.toFixed(2)}`;
                if (this.currentAsset.includes('uk')) return `£${price.toFixed(2)}`;
                return `$${price.toFixed(2)}`;
            }
            
            switch (baseCurrency) {
                case 'EUR': return `€${price.toFixed(2)}`;
                case 'GBP': return `£${price.toFixed(2)}`;
                case 'JPY': return `¥${price.toFixed(0)}`;
                case 'CAD': return `C$${price.toFixed(2)}`;
                case 'AUD': return `A$${price.toFixed(2)}`;
                default: return `$${price.toLocaleString()}`;
            }
        };
        
        priceElement.textContent = formatPrice(this.currentPrice);

        if (this.previousPrice > 0 && !isNaN(this.previousPrice)) {
            const change = this.currentPrice - this.previousPrice;
            const changePercent = ((change / this.previousPrice) * 100);
            
            if (!isNaN(change) && !isNaN(changePercent)) {
                changeElement.textContent = `${change >= 0 ? '+' : ''}${formatPrice(change)} (${changePercent.toFixed(2)}%)`;
                changeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
            }
        }

        if (this.priceHistory.length > 0) {
            const prices = this.priceHistory.slice(0, 10).map(h => h.price);
            const trend = this.analytics.calculateTrend(prices);
            trendElement.textContent = trend === 'bullish' ? '📈 Bullish' : trend === 'bearish' ? '📉 Bearish' : '➡️ Neutral';
            trendElement.className = `trend-indicator trend-${trend}`;
        }

        this.updateMiniChart();
        this.updatePortfolioCalculator();
        
        if (this.realTimeMode) {
            this.updatePriceTicker();
        }
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
                <linearGradient id="gradient-${this.currentAsset}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:0.4" />
                    <stop offset="100%" style="stop-color:${color};stop-opacity:0.1" />
                </linearGradient>
            </defs>
            <path d="${area}" fill="url(#gradient-${this.currentAsset})"/>
            <path d="${path}" stroke="${color}" stroke-width="2.5" fill="none"/>
            <circle cx="${(prices.length-1) / (prices.length-1) * 100}" cy="${100 - ((prices[prices.length-1] - min) / range) * 80 - 10}" r="3" fill="${color}"/>
        </svg>`;
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
        const timestamp = new Date().toLocaleString();
        const historyItem = {
            price: this.currentPrice,
            timestamp: timestamp,
            change: this.previousPrice > 0 ? this.currentPrice - this.previousPrice : 0,
            asset: this.currentAsset
        };

        this.priceHistory.unshift(historyItem);
        
        if (this.priceHistory.length > this.storage.maxHistory) {
            this.priceHistory = this.priceHistory.slice(0, this.storage.maxHistory);
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
        const chartContainer = document.getElementById('customChart');
        if (chartContainer && !this.chart) {
            try {
                this.chart = new CustomChart('customChart');
            } catch (error) {
                console.error('Failed to initialize chart:', error);
            }
        }
    }

    generateSampleHistory(asset) {
        const basePrice = this.allPrices[asset] || this.api.fallbackPrices[asset] || 100;
        const history = [];
        
        for (let i = 0; i < 20; i++) {
            const variation = (Math.random() - 0.5) * 0.1;
            const price = Math.max(basePrice * (1 + variation * (i / 10)), 0.01);
            history.push({
                price: price,
                timestamp: new Date(Date.now() - i * 3600000).toISOString(),
                asset: asset,
                change: 0
            });
        }
        
        return history;
    }

    updateAdvancedAnalytics() {
        if (!this.chart) {
            this.initChart();
        }
        
        if (!this.chart || !this.chart.container) return;

        const assets = ['btc', 'gold', 'silver', 'usd_eur'];
        const allHistories = {};
        
        assets.forEach(asset => {
            let history = this.storage.loadHistory(asset);
            if (!history || history.length === 0) {
                history = this.generateSampleHistory(asset);
            }
            allHistories[asset] = history.slice(0, 30).reverse();
        });
        
        try {
            this.chart.update(allHistories);
        } catch (error) {
            console.error('Chart update failed:', error);
        }

        const allPrices = this.priceHistory.map(h => h.price);
        if (allPrices.length > 0) {
            const high = Math.max(...allPrices.slice(0, 24));
            const low = Math.min(...allPrices.slice(0, 24));
            const volatility = this.analytics.calculateVolatility(allPrices.slice(0, 24));
            const ma7 = this.analytics.calculateMovingAverage(allPrices, 7);
            const ma30 = this.analytics.calculateMovingAverage(allPrices, 30);
            const sentiment = this.analytics.getMarketSentiment(this.priceHistory);
            const support = this.analytics.calculateSupport(allPrices);
            const resistance = this.analytics.calculateResistance(allPrices);
            const rsi = this.calculateRSI(allPrices.slice(0, 14));

            document.getElementById('dayHigh').textContent = `$${high.toFixed(2)}`;
            document.getElementById('dayLow').textContent = `$${low.toFixed(2)}`;
            document.getElementById('volatility').textContent = `${volatility.toFixed(2)}%`;
            document.getElementById('ma7').textContent = ma7 ? `$${ma7.toFixed(2)}` : 'N/A';
            document.getElementById('ma30').textContent = ma30 ? `$${ma30.toFixed(2)}` : 'N/A';
            document.getElementById('sentiment').textContent = `${sentiment.sentiment} (${sentiment.confidence}%)`;
            document.getElementById('support').textContent = `$${support.toFixed(2)}`;
            document.getElementById('resistance').textContent = `$${resistance.toFixed(2)}`;
            document.getElementById('rsi').textContent = rsi.toFixed(1);
        }
    }

    calculateRSI(prices, period = 14) {
        if (prices.length < period) return 50;
        
        let gains = 0, losses = 0;
        for (let i = 1; i < period; i++) {
            const change = prices[i] - prices[i-1];
            if (change > 0) gains += change;
            else losses -= change;
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    setupUI() {
        const baseCurrencySelect = document.getElementById('baseCurrencySelect');
        baseCurrencySelect.value = this.api.getBaseCurrency();
        
        const themeSelect = document.getElementById('themeSelect');
        this.themes.getAvailableThemes().forEach(theme => {
            const option = document.createElement('option');
            option.value = theme;
            option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
            if (theme === this.themes.getCurrentTheme()) option.selected = true;
            themeSelect.appendChild(option);
        });

        document.getElementById('soundEnabled').checked = this.settings.soundEnabled;
        document.getElementById('soundEnabled').onchange = (e) => {
            this.settings.soundEnabled = e.target.checked;
            this.alerts.soundEnabled = e.target.checked;
            this.storage.saveSettings(this.settings);
        };

        document.getElementById('refreshInterval').value = this.settings.refreshInterval;

        document.getElementById('realTimeUpdates').onchange = (e) => {
            this.realTimeMode = e.target.checked;
            if (this.realTimeMode) {
                this.startRealTimeUpdates();
            } else {
                this.stopRealTimeUpdates();
            }
        };

        this.setupAssetSelection();
        this.setupPortfolioSelection();
        this.updateAlertsList();
        this.updatePortfolioCalculator();
    }

    setupPortfolioSelection() {
        const portfolioSelection = document.getElementById('portfolioSelection');
        const selectedAssets = JSON.parse(localStorage.getItem('userPortfolio')) || ['btc', 'gold'];
        
        portfolioSelection.innerHTML = '';
        
        const types = ['crypto', 'metal', 'currency', 'bigmac'];
        types.forEach(type => {
            const typeAssets = this.api.getAssetsByType(type);
            
            const typeHeader = document.createElement('div');
            typeHeader.style.fontWeight = 'bold';
            typeHeader.style.marginTop = '10px';
            typeHeader.style.marginBottom = '5px';
            typeHeader.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            portfolioSelection.appendChild(typeHeader);
            
            typeAssets.forEach(asset => {
                const assetInfo = this.api.getAssetInfo(asset);
                const label = document.createElement('label');
                label.style.display = 'block';
                label.style.marginBottom = '3px';
                label.innerHTML = `
                    <input type="checkbox" value="${asset}" ${selectedAssets.includes(asset) ? 'checked' : ''}>
                    ${assetInfo.emoji} ${assetInfo.name}
                `;
                portfolioSelection.appendChild(label);
            });
        });
        
        this.updatePortfolioCalculatorAssets(selectedAssets);
    }
    
    updatePortfolioCalculatorAssets(selectedAssets) {
        const portfolioSelect = document.getElementById('portfolioAsset');
        portfolioSelect.innerHTML = '';
        
        selectedAssets.forEach(asset => {
            const assetInfo = this.api.getAssetInfo(asset);
            const option = document.createElement('option');
            option.value = asset;
            option.textContent = `${assetInfo.emoji} ${assetInfo.name}`;
            portfolioSelect.appendChild(option);
        });
    }

    setupAssetSelection() {
        const assetSelection = document.getElementById('assetSelection');
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

    startRealTimeUpdates() {
        if (this.realTimeInterval) clearInterval(this.realTimeInterval);
        this.realTimeInterval = setInterval(() => {
            this.fetchAllPrices();
        }, 10000);
    }

    stopRealTimeUpdates() {
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
            this.realTimeInterval = null;
        }
    }

    updatePriceTicker() {
        const ticker = document.getElementById('priceTicker');
        const assetInfo = this.api.getAssetInfo(this.currentAsset);
        const change = this.calculateChange(this.currentAsset);
        
        ticker.innerHTML = `
            <span class="live-indicator"></span>
            LIVE: ${assetInfo.name} $${this.currentPrice.toFixed(2)} 
            <span class="${change >= 0 ? 'positive' : 'negative'}">
                ${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%
            </span>
        `;
    }

    updateAlertsList() {
        const alertsList = document.getElementById('alertsList');
        const alerts = this.alerts.getAlertsList();
        
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item">
                <span>${alert.description}</span>
                <button onclick="removeAlert(${alert.id})" style="background: var(--danger); color: white; border: none; padding: 5px 10px;">Remove</button>
            </div>
        `).join('');
    }

    updatePortfolioCalculator() {
        const buyPrice = parseFloat(document.getElementById('buyPrice').value);
        const amount = parseFloat(document.getElementById('amount').value) || 1;
        const selectedAsset = document.getElementById('portfolioAsset').value;
        const currentPrice = this.allPrices[selectedAsset] || this.currentPrice;
        const resultDiv = document.getElementById('portfolioResult');

        if (buyPrice && currentPrice && !isNaN(buyPrice) && !isNaN(currentPrice)) {
            const result = this.analytics.calculateProfitLoss(buyPrice, currentPrice, amount);
            const assetInfo = this.api.getAssetInfo(selectedAsset);
            
            if (assetInfo && result && !isNaN(result.totalValue)) {
                resultDiv.innerHTML = `
                    <div style="margin-top: 10px;">
                        <div>${assetInfo.emoji} ${assetInfo.name}: $${currentPrice.toFixed(2)}/${assetInfo.unit}</div>
                        <div>Current Value: $${result.totalValue.toFixed(2)}</div>
                        <div class="${result.profit >= 0 ? 'positive' : 'negative'}">
                            P&L: ${result.profit >= 0 ? '+' : ''}$${result.profit.toFixed(2)} (${result.percentage.toFixed(2)}%)
                        </div>
                    </div>
                `;
            }
        }
    }

    startAutoRefresh() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(() => this.fetchAllPrices(), this.settings.refreshInterval);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') toggleRazanMode();
            if (e.key === ' ') { e.preventDefault(); refreshPrice(); }
            if (e.key === 'h' || e.key === 'H') toggleHistory();
            if (e.key === 's' || e.key === 'S') toggleSettings();
            if (e.key === 't' || e.key === 'T') toggleTheme();
            if (e.key === 'n' || e.key === 'N') toggleNews();
            if (e.key >= '1' && e.key <= '4') {
                const categories = ['crypto', 'metal', 'currency', 'bigmac'];
                const index = parseInt(e.key) - 1;
                if (categories[index]) {
                    this.currentCategory = categories[index];
                    document.querySelectorAll('.category-tab').forEach(tab => {
                        tab.classList.toggle('active', tab.dataset.category === categories[index]);
                    });
                    this.setupAssetTabs();
                }
            }
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
        this.storage.saveHistory([], this.currentAsset);
        this.displayHistory();
    }
}

function refreshPrice() {
    universalTracker.fetchAllPrices();
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
        
        if (isHidden && universalTracker) {
            universalTracker.loadNews();
        }
    }
}

function toggleRazanMode() {
    const razanMode = document.getElementById('razanMode');
    universalTracker.razanMode = !universalTracker.razanMode;
    universalTracker.settings.razanMode = universalTracker.razanMode;
    universalTracker.storage.saveSettings(universalTracker.settings);
    
    if (universalTracker.razanMode) {
        razanMode.style.display = 'block';
        setTimeout(() => {
            if (!universalTracker.chart) universalTracker.initChart();
            universalTracker.updateAdvancedAnalytics();
        }, 100);
    } else {
        razanMode.style.display = 'none';
    }
}

function toggleTheme() {
    universalTracker.themes.toggleTheme();
}

function changeBaseCurrency() {
    const currency = document.getElementById('baseCurrencySelect').value;
    universalTracker.api.setBaseCurrency(currency);
    universalTracker.updateDisplay();
    universalTracker.updateAssetsOverview();
}

function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    universalTracker.themes.setTheme(theme);
}

function changeRefreshInterval() {
    const interval = parseInt(document.getElementById('refreshInterval').value);
    universalTracker.settings.refreshInterval = interval;
    universalTracker.storage.saveSettings(universalTracker.settings);
    universalTracker.startAutoRefresh();
}

function addAlert() {
    const type = document.getElementById('alertType').value;
    const value = parseFloat(document.getElementById('alertValue').value);
    
    if (value) {
        universalTracker.alerts.addAlert(type, value);
        universalTracker.updateAlertsList();
        document.getElementById('alertValue').value = '';
    }
}

function removeAlert(id) {
    universalTracker.alerts.removeAlert(id);
    universalTracker.updateAlertsList();
}

function exportData() {
    universalTracker.storage.exportData();
}

function importData(event) {
    const file = event.target.files[0];
    if (file) {
        universalTracker.storage.importData(file).then(() => {
            universalTracker.priceHistory = universalTracker.storage.loadHistory(universalTracker.currentAsset);
            universalTracker.displayHistory();
            universalTracker.showAlert('✅ Data imported successfully!');
        }).catch(error => {
            universalTracker.showAlert('❌ Import failed: ' + error.message);
        });
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all price history for ' + universalTracker.api.getAssetInfo(universalTracker.currentAsset).name + '?')) {
        universalTracker.clearHistory();
    }
}

function saveAssetSelection() {
    const checkboxes = document.querySelectorAll('#assetSelection input[type="checkbox"]:checked');
    const selectedAssets = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedAssets.length === 0) {
        alert('Please select at least one asset to track.');
        return;
    }
    
    universalTracker.api.saveUserSelection(selectedAssets);
    universalTracker.fetchAllPrices();
    universalTracker.setupAssetTabs();
    universalTracker.updateAssetsOverview();
    
    universalTracker.showAlert('✅ Asset selection saved!');
}

function savePortfolioSelection() {
    const checkboxes = document.querySelectorAll('#portfolioSelection input[type="checkbox"]:checked');
    const selectedAssets = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedAssets.length === 0) {
        alert('Please select at least one asset for your portfolio.');
        return;
    }
    
    localStorage.setItem('userPortfolio', JSON.stringify(selectedAssets));
    universalTracker.updatePortfolioCalculatorAssets(selectedAssets);
    universalTracker.showAlert('✅ Portfolio selection saved!');
}

let universalTracker;
document.addEventListener('DOMContentLoaded', () => {
    try {
        universalTracker = new UniversalTracker();
        
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        ['buyPrice', 'amount', 'portfolioAsset'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    universalTracker.updatePortfolioCalculator();
                });
            }
        });
    } catch (error) {
        console.error('Failed to initialize app:', error);
        document.body.innerHTML = '<div style="text-align:center;padding:50px;color:white;">Application failed to load. Please refresh the page.</div>';
    }
});