class UniversalAPI {
    constructor() {
        this.baseCurrency = localStorage.getItem('baseCurrency') || 'USD';
        
        this.assets = {
            btc: { symbol: 'BTC', name: 'Bitcoin', emoji: '₿', unit: 'BTC', type: 'crypto' },
            gold: { symbol: 'XAU', name: 'Gold', emoji: '🥇', unit: 'oz', type: 'metal' },
            silver: { symbol: 'XAG', name: 'Silver', emoji: '🥈', unit: 'oz', type: 'metal' },
            
            // Major Currencies
            usd_eur: { symbol: 'EUR', name: 'USD to Euro', emoji: '🇪🇺', unit: 'EUR', type: 'currency' },
            usd_gbp: { symbol: 'GBP', name: 'USD to British Pound', emoji: '🇬🇧', unit: 'GBP', type: 'currency' },
            usd_jpy: { symbol: 'JPY', name: 'USD to Japanese Yen', emoji: '🇯🇵', unit: 'JPY', type: 'currency' },
            usd_cad: { symbol: 'CAD', name: 'USD to Canadian Dollar', emoji: '🇨🇦', unit: 'CAD', type: 'currency' },
            usd_aud: { symbol: 'AUD', name: 'USD to Australian Dollar', emoji: '🇦🇺', unit: 'AUD', type: 'currency' },
            usd_chf: { symbol: 'CHF', name: 'USD to Swiss Franc', emoji: '🇨🇭', unit: 'CHF', type: 'currency' },
            usd_cny: { symbol: 'CNY', name: 'USD to Chinese Yuan', emoji: '🇨🇳', unit: 'CNY', type: 'currency' },
            usd_inr: { symbol: 'INR', name: 'USD to Indian Rupee', emoji: '🇮🇳', unit: 'INR', type: 'currency' },
            usd_krw: { symbol: 'KRW', name: 'USD to Korean Won', emoji: '🇰🇷', unit: 'KRW', type: 'currency' },
            usd_mxn: { symbol: 'MXN', name: 'USD to Mexican Peso', emoji: '🇲🇽', unit: 'MXN', type: 'currency' },
            usd_brl: { symbol: 'BRL', name: 'USD to Brazilian Real', emoji: '🇧🇷', unit: 'BRL', type: 'currency' },
            usd_rub: { symbol: 'RUB', name: 'USD to Russian Ruble', emoji: '🇷🇺', unit: 'RUB', type: 'currency' },
            usd_sgd: { symbol: 'SGD', name: 'USD to Singapore Dollar', emoji: '🇸🇬', unit: 'SGD', type: 'currency' },
            usd_nzd: { symbol: 'NZD', name: 'USD to New Zealand Dollar', emoji: '🇳🇿', unit: 'NZD', type: 'currency' },
            usd_nok: { symbol: 'NOK', name: 'USD to Norwegian Krone', emoji: '🇳🇴', unit: 'NOK', type: 'currency' },
            usd_sek: { symbol: 'SEK', name: 'USD to Swedish Krona', emoji: '🇸🇪', unit: 'SEK', type: 'currency' },
            usd_dkk: { symbol: 'DKK', name: 'USD to Danish Krone', emoji: '🇩🇰', unit: 'DKK', type: 'currency' },
            usd_pln: { symbol: 'PLN', name: 'USD to Polish Zloty', emoji: '🇵🇱', unit: 'PLN', type: 'currency' },
            usd_czk: { symbol: 'CZK', name: 'USD to Czech Koruna', emoji: '🇨🇿', unit: 'CZK', type: 'currency' },
            usd_huf: { symbol: 'HUF', name: 'USD to Hungarian Forint', emoji: '🇭🇺', unit: 'HUF', type: 'currency' },
            usd_try: { symbol: 'TRY', name: 'USD to Turkish Lira', emoji: '🇹🇷', unit: 'TRY', type: 'currency' },
            usd_zar: { symbol: 'ZAR', name: 'USD to South African Rand', emoji: '🇿🇦', unit: 'ZAR', type: 'currency' },
            usd_thb: { symbol: 'THB', name: 'USD to Thai Baht', emoji: '🇹🇭', unit: 'THB', type: 'currency' },
            usd_php: { symbol: 'PHP', name: 'USD to Philippine Peso', emoji: '🇵🇭', unit: 'PHP', type: 'currency' },
            usd_idr: { symbol: 'IDR', name: 'USD to Indonesian Rupiah', emoji: '🇮🇩', unit: 'IDR', type: 'currency' },
            usd_myr: { symbol: 'MYR', name: 'USD to Malaysian Ringgit', emoji: '🇲🇾', unit: 'MYR', type: 'currency' },
            usd_vnd: { symbol: 'VND', name: 'USD to Vietnamese Dong', emoji: '🇻🇳', unit: 'VND', type: 'currency' },
            usd_aed: { symbol: 'AED', name: 'USD to UAE Dirham', emoji: '🇦🇪', unit: 'AED', type: 'currency' },
            usd_sar: { symbol: 'SAR', name: 'USD to Saudi Riyal', emoji: '🇸🇦', unit: 'SAR', type: 'currency' },
            usd_ils: { symbol: 'ILS', name: 'USD to Israeli Shekel', emoji: '🇮🇱', unit: 'ILS', type: 'currency' },
            usd_egp: { symbol: 'EGP', name: 'USD to Egyptian Pound', emoji: '🇪🇬', unit: 'EGP', type: 'currency' },
            
            // Big Mac Index
            bigmac_us: { symbol: 'US', name: 'Big Mac USA', emoji: '🇺🇸', unit: 'USD', type: 'bigmac' },
            bigmac_uk: { symbol: 'UK', name: 'Big Mac UK', emoji: '🇬🇧', unit: 'GBP', type: 'bigmac' },
            bigmac_jp: { symbol: 'JP', name: 'Big Mac Japan', emoji: '🇯🇵', unit: 'JPY', type: 'bigmac' },
            bigmac_ca: { symbol: 'CA', name: 'Big Mac Canada', emoji: '🇨🇦', unit: 'CAD', type: 'bigmac' },
            bigmac_au: { symbol: 'AU', name: 'Big Mac Australia', emoji: '🇦🇺', unit: 'AUD', type: 'bigmac' },
            bigmac_eu: { symbol: 'EU', name: 'Big Mac Eurozone', emoji: '🇪🇺', unit: 'EUR', type: 'bigmac' },
            bigmac_ch: { symbol: 'CH', name: 'Big Mac Switzerland', emoji: '🇨🇭', unit: 'CHF', type: 'bigmac' },
            bigmac_cn: { symbol: 'CN', name: 'Big Mac China', emoji: '🇨🇳', unit: 'CNY', type: 'bigmac' },
            bigmac_in: { symbol: 'IN', name: 'Big Mac India', emoji: '🇮🇳', unit: 'INR', type: 'bigmac' },
            bigmac_kr: { symbol: 'KR', name: 'Big Mac South Korea', emoji: '🇰🇷', unit: 'KRW', type: 'bigmac' },
            bigmac_mx: { symbol: 'MX', name: 'Big Mac Mexico', emoji: '🇲🇽', unit: 'MXN', type: 'bigmac' },
            bigmac_br: { symbol: 'BR', name: 'Big Mac Brazil', emoji: '🇧🇷', unit: 'BRL', type: 'bigmac' }
        };
        
        this.fallbackPrices = {
            btc: 45000, gold: 2050, silver: 24.5,
            usd_eur: 0.92, usd_gbp: 0.79, usd_jpy: 150, usd_cad: 1.35, usd_aud: 1.52, usd_chf: 0.88,
            usd_cny: 7.25, usd_inr: 83.2, usd_krw: 1320, usd_mxn: 17.8, usd_brl: 5.2, usd_rub: 75.8,
            usd_sgd: 1.34, usd_nzd: 1.62, usd_nok: 10.5, usd_sek: 10.8, usd_dkk: 6.9, usd_pln: 4.1,
            usd_czk: 23.5, usd_huf: 360, usd_try: 28.5, usd_zar: 18.2, usd_thb: 35.8, usd_php: 56.2,
            usd_idr: 15800, usd_myr: 4.7, usd_vnd: 24500, usd_aed: 3.67, usd_sar: 3.75, usd_ils: 3.8, usd_egp: 31.0,
            bigmac_us: 5.50, bigmac_uk: 4.20, bigmac_jp: 390, bigmac_ca: 6.25, bigmac_au: 6.80, bigmac_eu: 4.80,
            bigmac_ch: 6.50, bigmac_cn: 24.4, bigmac_in: 190, bigmac_kr: 4500, bigmac_mx: 54, bigmac_br: 17.5
        };
        
        this.lastPrices = JSON.parse(localStorage.getItem('lastAssetPrices')) || this.fallbackPrices;
        this.userSelectedAssets = JSON.parse(localStorage.getItem('userSelectedAssets')) || ['btc', 'gold', 'silver', 'usd_eur'];
        this.newsCache = null;
        this.newsCacheTime = 0;
        this.currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'KRW', 'MXN', 'BRL', 'RUB', 'SGD', 'NZD', 'NOK', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF', 'TRY', 'ZAR', 'THB', 'PHP', 'IDR', 'MYR', 'VND', 'AED', 'SAR', 'ILS', 'EGP'];
    }

    async fetchWithTimeout(url, timeout = 5000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
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

    async fetchCryptoPrice() {
        const apis = [
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
            'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
            'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
        ];
        
        for (const api of apis) {
            try {
                const data = await this.fetchWithTimeout(api);
                
                let price;
                if (data.bitcoin?.usd) {
                    price = data.bitcoin.usd;
                } else if (data.data?.rates?.USD) {
                    price = parseFloat(data.data.rates.USD);
                } else if (data.price) {
                    price = parseFloat(data.price);
                }
                
                if (price && price > 0) {
                    this.lastPrices.btc = price;
                    this.saveLastPrices();
                    return price;
                }
            } catch (error) {
                console.warn(`BTC API ${api} failed:`, error.message);
            }
        }
        
        return this.simulatePrice('btc');
    }

    async fetchMetalPrice(asset) {
        const isGold = asset === 'gold';
        const apis = [
            `https://api.metals.live/v1/spot/${isGold ? 'gold' : 'silver'}`,
            `https://api.coinbase.com/v2/exchange-rates?currency=${isGold ? 'XAU' : 'XAG'}`
        ];
        
        for (const api of apis) {
            try {
                const data = await this.fetchWithTimeout(api);
                
                let price;
                if (data.price) {
                    price = data.price;
                } else if (data.data?.rates?.USD) {
                    price = parseFloat(data.data.rates.USD);
                }
                
                if (price && price > 0) {
                    this.lastPrices[asset] = price;
                    this.saveLastPrices();
                    return price;
                }
            } catch (error) {
                console.warn(`${asset} API ${api} failed:`, error.message);
            }
        }
        
        return this.simulatePrice(asset);
    }

    async fetchForexPrice(asset) {
        const currency = asset.split('_')[1].toUpperCase();
        const apis = [
            `https://api.exchangerate-api.com/v4/latest/USD`,
            `https://open.er-api.com/v6/latest/USD`
        ];
        
        for (const api of apis) {
            try {
                const data = await this.fetchWithTimeout(api);
                
                if (data.rates && data.rates[currency]) {
                    const rate = data.rates[currency];
                    this.lastPrices[asset] = rate;
                    this.saveLastPrices();
                    return rate;
                }
            } catch (error) {
                console.warn(`${asset} API ${api} failed:`, error.message);
            }
        }
        
        return this.simulatePrice(asset);
    }

    simulatePrice(asset) {
        const basePrice = this.lastPrices[asset] || this.fallbackPrices[asset];
        const variation = (Math.random() - 0.5) * 0.02; // 2% max variation
        const newPrice = basePrice * (1 + variation);
        this.lastPrices[asset] = newPrice;
        this.saveLastPrices();
        return newPrice;
    }

    async fetchPrice(asset = 'btc') {
        const assetInfo = this.assets[asset];
        if (!assetInfo) return this.simulatePrice(asset);

        try {
            switch (assetInfo.type) {
                case 'crypto':
                    return await this.fetchCryptoPrice();
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
        const promises = this.userSelectedAssets.map(async asset => {
            prices[asset] = await this.fetchPrice(asset);
        });
        
        await Promise.all(promises);
        return prices;
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

    getAssetInfo(asset) {
        return this.assets[asset];
    }

    getAllAssets() {
        return Object.keys(this.assets);
    }

    getBigMacPrice(asset) {
        const basePrice = this.fallbackPrices[asset] || 5.0;
        const variation = (Math.random() - 0.5) * 0.05;
        const price = basePrice * (1 + variation);
        
        this.lastPrices[asset] = price;
        this.saveLastPrices();
        return price;
    }

    setBaseCurrency(currency) {
        this.baseCurrency = currency;
        localStorage.setItem('baseCurrency', currency);
    }

    getBaseCurrency() {
        return this.baseCurrency;
    }

    getCurrencies() {
        return this.currencies;
    }

    getAssetsByType(type) {
        return Object.keys(this.assets).filter(asset => this.assets[asset].type === type);
    }

    async fetchNews() {
        const newsItems = [
            { title: "Bitcoin reaches new monthly high amid institutional adoption", source: { name: "CoinDesk" }, publishedAt: new Date().toISOString(), url: "https://www.coindesk.com" },
            { title: "Gold prices surge amid market uncertainty", source: { name: "Financial Times" }, publishedAt: new Date(Date.now() - 3600000).toISOString(), url: "https://www.ft.com" },
            { title: "USD strengthens against major currencies", source: { name: "Reuters" }, publishedAt: new Date(Date.now() - 7200000).toISOString(), url: "https://www.reuters.com" },
            { title: "Silver demand increases in industrial applications", source: { name: "Bloomberg" }, publishedAt: new Date(Date.now() - 10800000).toISOString(), url: "https://www.bloomberg.com" },
            { title: "Central banks continue gold purchases", source: { name: "MarketWatch" }, publishedAt: new Date(Date.now() - 14400000).toISOString(), url: "https://www.marketwatch.com" }
        ];
        return newsItems;
    }
}