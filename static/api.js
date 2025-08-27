class UniversalAPI {
    constructor() {
        this.baseCurrency = localStorage.getItem('baseCurrency') || 'USD';
        
        this.assets = {
            // Cryptocurrencies
            btc: { symbol: 'BTC', name: 'Bitcoin', emoji: '₿', type: 'crypto' },
            eth: { symbol: 'ETH', name: 'Ethereum', emoji: '⟠', type: 'crypto' },
            bnb: { symbol: 'BNB', name: 'Binance Coin', emoji: '🔶', type: 'crypto' },
            ada: { symbol: 'ADA', name: 'Cardano', emoji: '🌐', type: 'crypto' },
            sol: { symbol: 'SOL', name: 'Solana', emoji: '☀️', type: 'crypto' },
            xrp: { symbol: 'XRP', name: 'Ripple', emoji: '🌊', type: 'crypto' },
            dot: { symbol: 'DOT', name: 'Polkadot', emoji: '🔴', type: 'crypto' },
            doge: { symbol: 'DOGE', name: 'Dogecoin', emoji: '🐶', type: 'crypto' },
            avax: { symbol: 'AVAX', name: 'Avalanche', emoji: '⛰️', type: 'crypto' },
            matic: { symbol: 'MATIC', name: 'Polygon', emoji: '🔷', type: 'crypto' },
            
            // Precious Metals
            gold: { symbol: 'XAU', name: 'Gold', emoji: '🥇', type: 'metal' },
            silver: { symbol: 'XAG', name: 'Silver', emoji: '🥈', type: 'metal' },
            platinum: { symbol: 'XPT', name: 'Platinum', emoji: '⬜', type: 'metal' },
            palladium: { symbol: 'XPD', name: 'Palladium', emoji: '🔘', type: 'metal' },
            
            // Major Currencies
            usd_eur: { symbol: 'EUR', name: 'USD to Euro', emoji: '🇪🇺', type: 'currency' },
            usd_gbp: { symbol: 'GBP', name: 'USD to Pound', emoji: '🇬🇧', type: 'currency' },
            usd_jpy: { symbol: 'JPY', name: 'USD to Yen', emoji: '🇯🇵', type: 'currency' },
            usd_cad: { symbol: 'CAD', name: 'USD to Canadian Dollar', emoji: '🇨🇦', type: 'currency' },
            usd_aud: { symbol: 'AUD', name: 'USD to Australian Dollar', emoji: '🇦🇺', type: 'currency' },
            usd_chf: { symbol: 'CHF', name: 'USD to Swiss Franc', emoji: '🇨🇭', type: 'currency' },
            usd_cny: { symbol: 'CNY', name: 'USD to Chinese Yuan', emoji: '🇨🇳', type: 'currency' },
            usd_inr: { symbol: 'INR', name: 'USD to Indian Rupee', emoji: '🇮🇳', type: 'currency' },
            
            // World Currencies
            usd_krw: { symbol: 'KRW', name: 'USD to Korean Won', emoji: '🇰🇷', type: 'currency' },
            usd_brl: { symbol: 'BRL', name: 'USD to Brazilian Real', emoji: '🇧🇷', type: 'currency' },
            usd_mxn: { symbol: 'MXN', name: 'USD to Mexican Peso', emoji: '🇲🇽', type: 'currency' },
            usd_rub: { symbol: 'RUB', name: 'USD to Russian Ruble', emoji: '🇷🇺', type: 'currency' },
            usd_try: { symbol: 'TRY', name: 'USD to Turkish Lira', emoji: '🇹🇷', type: 'currency' },
            usd_zar: { symbol: 'ZAR', name: 'USD to South African Rand', emoji: '🇿🇦', type: 'currency' },
            usd_nok: { symbol: 'NOK', name: 'USD to Norwegian Krone', emoji: '🇳🇴', type: 'currency' },
            usd_sek: { symbol: 'SEK', name: 'USD to Swedish Krona', emoji: '🇸🇪', type: 'currency' },
            
            // Big Mac Index
            bigmac_us: { symbol: 'US', name: 'Big Mac USA', emoji: '🇺🇸', type: 'bigmac' },
            bigmac_uk: { symbol: 'UK', name: 'Big Mac UK', emoji: '🇬🇧', type: 'bigmac' },
            bigmac_jp: { symbol: 'JP', name: 'Big Mac Japan', emoji: '🇯🇵', type: 'bigmac' },
            bigmac_eu: { symbol: 'EU', name: 'Big Mac EU', emoji: '🇪🇺', type: 'bigmac' },
            bigmac_ca: { symbol: 'CA', name: 'Big Mac Canada', emoji: '🇨🇦', type: 'bigmac' }
        };
        
        this.fallbackPrices = {
            // Crypto
            btc: 43000, eth: 2600, bnb: 240, ada: 0.38, sol: 60, xrp: 0.52, dot: 5.2, doge: 0.08, avax: 12, matic: 0.75,
            // Metals
            gold: 2050, silver: 24.5, platinum: 950, palladium: 1200,
            // Major Currencies
            usd_eur: 0.92, usd_gbp: 0.79, usd_jpy: 150, usd_cad: 1.35, usd_aud: 1.52, usd_chf: 0.88, usd_cny: 7.25, usd_inr: 83.2,
            // World Currencies
            usd_krw: 1320, usd_brl: 5.1, usd_mxn: 17.8, usd_rub: 92, usd_try: 29.5, usd_zar: 18.7, usd_nok: 10.8, usd_sek: 10.9,
            // Big Mac
            bigmac_us: 5.69, bigmac_uk: 4.89, bigmac_jp: 450, bigmac_eu: 5.15, bigmac_ca: 6.77
        };
        
        this.lastPrices = JSON.parse(localStorage.getItem('lastAssetPrices')) || this.fallbackPrices;
        this.userSelectedAssets = JSON.parse(localStorage.getItem('userSelectedAssets')) || [];
    }

    async fetchWithTimeout(url, timeout = 8000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 
                    'Accept': 'application/json'
                }
            });
            clearTimeout(timeoutId);
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
        throw new Error('Request failed');
    }

    async fetchCryptoPrice(asset = 'btc') {
        const cryptoIds = { 
            btc: 'bitcoin', eth: 'ethereum', bnb: 'binancecoin', ada: 'cardano', 
            sol: 'solana', xrp: 'ripple', dot: 'polkadot', doge: 'dogecoin', 
            avax: 'avalanche-2', matic: 'matic-network'
        };
        const cryptoId = cryptoIds[asset];
        
        if (!cryptoId) return this.fallbackPrices[asset];
        
        const apis = [
            `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`
        ];
        
        for (const apiUrl of apis) {
            try {
                const data = await this.fetchWithTimeout(apiUrl);
                let price;
                
                if (data[cryptoId]?.usd) {
                    price = data[cryptoId].usd;
                }
                
                if (price && price > 0.001) {
                    this.lastPrices[asset] = price;
                    this.saveLastPrices();
                    console.log(`Real ${asset.toUpperCase()} price: $${price}`);
                    return price;
                }
            } catch (error) {
                console.warn(`${asset.toUpperCase()} API failed: ${error.message}`);
                continue;
            }
        }
        
        console.warn(`All ${asset.toUpperCase()} APIs failed, using last known price`);
        return this.lastPrices[asset] || this.fallbackPrices[asset];
    }

    async fetchMetalPrice(asset) {
        const metalApis = {
            gold: 'https://api.metals.live/v1/spot/gold',
            silver: 'https://api.metals.live/v1/spot/silver'
        };
        
        const apiUrl = metalApis[asset];
        if (!apiUrl) return this.fallbackPrices[asset];
        
        try {
            const data = await this.fetchWithTimeout(apiUrl);
            
            if (data && data.price && data.price > 0) {
                this.lastPrices[asset] = data.price;
                this.saveLastPrices();
                console.log(`Real ${asset} price: $${data.price}`);
                return data.price;
            }
        } catch (error) {
            console.warn(`${asset} API failed: ${error.message}`);
        }
        
        console.warn(`Using last known ${asset} price`);
        return this.lastPrices[asset] || this.fallbackPrices[asset];
    }

    async fetchForexPrice(asset) {
        const currencyMap = {
            usd_eur: 'EUR', usd_gbp: 'GBP', usd_jpy: 'JPY', usd_cad: 'CAD',
            usd_aud: 'AUD', usd_chf: 'CHF', usd_cny: 'CNY', usd_inr: 'INR',
            usd_krw: 'KRW', usd_brl: 'BRL', usd_mxn: 'MXN', usd_rub: 'RUB',
            usd_try: 'TRY', usd_zar: 'ZAR', usd_nok: 'NOK', usd_sek: 'SEK'
        };
        
        const currency = currencyMap[asset];
        if (!currency) return this.fallbackPrices[asset];
        
        const forexApis = [
            'https://api.exchangerate-api.com/v4/latest/USD'
        ];
        
        for (const apiUrl of forexApis) {
            try {
                const data = await this.fetchWithTimeout(apiUrl);
                
                if (data && data.rates && data.rates[currency]) {
                    const rate = data.rates[currency];
                    this.lastPrices[asset] = rate;
                    this.saveLastPrices();
                    console.log(`Real ${asset} rate: ${rate}`);
                    return rate;
                }
            } catch (error) {
                console.warn(`${asset} forex API failed: ${error.message}`);
                continue;
            }
        }
        
        console.warn(`Using last known ${asset} rate`);
        return this.lastPrices[asset] || this.fallbackPrices[asset];
    }

    getBigMacPrice(asset) {
        const realPrices = {
            bigmac_us: 5.69, bigmac_uk: 4.89, bigmac_jp: 450, bigmac_eu: 5.15
        };
        
        const basePrice = realPrices[asset] || this.fallbackPrices[asset] || 5.0;
        const variation = (Math.random() - 0.5) * 0.02;
        const price = basePrice * (1 + variation);
        
        this.lastPrices[asset] = price;
        this.saveLastPrices();
        return price;
    }

    simulatePrice(asset) {
        // Only used as absolute last resort - return stored price
        return this.lastPrices[asset] || this.fallbackPrices[asset];
    }

    async fetchPrice(asset) {
        const assetInfo = this.assets[asset];
        if (!assetInfo) return this.simulatePrice(asset);

        try {
            switch (assetInfo.type) {
                case 'crypto':
                    return await this.fetchCryptoPrice(asset);
                case 'metal':
                    return await this.fetchMetalPrice(asset);
                case 'currency':
                    return await this.fetchForexPrice(asset);
                case 'bigmac':
                    return this.getBigMacPrice(asset);
                default:
                    return this.simulatePrice(asset);
            }
        } catch (error) {
            console.warn(`${asset} fetch failed:`, error);
            return this.simulatePrice(asset);
        }
    }

    async fetchAllPrices() {
        const prices = {};
        
        for (const asset of this.userSelectedAssets) {
            try {
                prices[asset] = await this.fetchPrice(asset);
                console.log(`Fetched ${asset}: ${prices[asset]}`);
            } catch (error) {
                console.error(`Failed to fetch ${asset}:`, error);
                prices[asset] = this.simulatePrice(asset);
            }
        }
        
        return prices;
    }

    async fetchNews() {
        return [
            { title: "Bitcoin reaches new monthly high", source: { name: "CoinDesk" }, publishedAt: new Date().toISOString(), url: "https://www.coindesk.com" },
            { title: "Gold prices surge amid uncertainty", source: { name: "Reuters" }, publishedAt: new Date(Date.now() - 3600000).toISOString(), url: "https://www.reuters.com" },
            { title: "USD strengthens against major currencies", source: { name: "Bloomberg" }, publishedAt: new Date(Date.now() - 7200000).toISOString(), url: "https://www.bloomberg.com" },
            { title: "Big Mac Index shows global trends", source: { name: "The Economist" }, publishedAt: new Date(Date.now() - 10800000).toISOString(), url: "https://www.economist.com" }
        ];
    }

    saveLastPrices() {
        localStorage.setItem('lastAssetPrices', JSON.stringify(this.lastPrices));
    }

    saveUserSelection(selectedAssets) {
        this.userSelectedAssets = selectedAssets;
        localStorage.setItem('userSelectedAssets', JSON.stringify(selectedAssets));
    }

    getUserSelectedAssets() {
        return this.userSelectedAssets;
    }

    setBaseCurrency(currency) {
        this.baseCurrency = currency;
        localStorage.setItem('baseCurrency', currency);
    }

    getBaseCurrency() {
        return this.baseCurrency;
    }

    getAssetInfo(asset) {
        return this.assets[asset];
    }

    getAllAssets() {
        return Object.keys(this.assets);
    }

    getAssetsByType(type) {
        return Object.keys(this.assets).filter(asset => this.assets[asset].type === type);
    }
}