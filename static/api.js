class GoldAPI {
    constructor() {
        this.lastPrice = parseFloat(localStorage.getItem('lastGoldPrice')) || 2650;
    }

    async fetchPrice() {
        // Try working APIs only (no CORS issues)
        const apis = [
            {
                url: 'https://api.coinbase.com/v2/exchange-rates?currency=XAU',
                parser: (data) => parseFloat(data.data.rates.USD)
            },
            {
                url: 'https://api.exchangerate-api.com/v4/latest/XAU',
                parser: (data) => 1 / data.rates.USD
            }
        ];

        for (const api of apis) {
            try {
                const response = await fetch(api.url);
                if (response.ok) {
                    const data = await response.json();
                    const price = api.parser(data);
                    if (price && price > 1000 && price < 10000) {
                        this.lastPrice = price;
                        localStorage.setItem('lastGoldPrice', price.toString());
                        console.log(`Real gold price fetched: $${price.toFixed(2)}`);
                        return price;
                    }
                }
            } catch (error) {
                console.warn(`API ${api.url} failed:`, error);
            }
        }
        
        // If all APIs fail, use last known price with small variation
        console.warn('All APIs failed, using last known price');
        return this.lastPrice;
    }
}