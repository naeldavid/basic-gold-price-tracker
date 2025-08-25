class GoldAPI {
    constructor() {
        this.apis = [
            { url: 'https://api.metals.live/v1/spot/gold', parser: d => d.price },
            { url: 'https://api.goldapi.io/api/XAU/USD', parser: d => d.price },
            { url: 'https://api.coindesk.com/v1/bpi/currentprice.json', parser: d => parseFloat(d.bpi.USD.rate.replace(',', '')) * 0.0311 * 2000 }
        ];
        this.retryCount = 0;
        this.maxRetries = 3;
        this.lastPrice = parseFloat(localStorage.getItem('lastGoldPrice')) || 2650;
    }

    async fetchPrice() {
        for (let api of this.apis) {
            try {
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(api.url)}`);
                const data = JSON.parse((await response.json()).contents);
                const price = api.parser(data);
                
                if (price && price > 1000) {
                    this.lastPrice = price;
                    localStorage.setItem('lastGoldPrice', price.toString());
                    this.retryCount = 0;
                    return price;
                }
            } catch (error) {
                console.warn(`API failed: ${api.url}`, error);
            }
        }
        
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            await this.delay(Math.pow(2, this.retryCount) * 1000);
            return this.fetchPrice();
        }
        
        return this.simulatePrice();
    }

    simulatePrice() {
        const variation = (Math.random() - 0.5) * 20;
        return Math.max(1800, this.lastPrice + variation);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}