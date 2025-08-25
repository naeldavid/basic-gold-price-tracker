class Analytics {
    constructor() {
        this.indicators = {};
    }

    calculateMovingAverage(prices, period) {
        if (prices.length < period) return null;
        const sum = prices.slice(0, period).reduce((a, b) => a + b, 0);
        return sum / period;
    }

    calculateVolatility(prices) {
        if (prices.length < 2) return 0;
        const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
        return Math.sqrt(variance);
    }

    calculateTrend(prices) {
        if (prices.length < 2) return 'neutral';
        const recent = prices.slice(0, 5);
        const older = prices.slice(5, 10);
        
        if (recent.length === 0 || older.length === 0) return 'neutral';
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        
        const change = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        if (change > 1) return 'bullish';
        if (change < -1) return 'bearish';
        return 'neutral';
    }

    calculateSupport(prices) {
        return Math.min(...prices.slice(0, 20));
    }

    calculateResistance(prices) {
        return Math.max(...prices.slice(0, 20));
    }

    predictNextPrice(history) {
        if (history.length < 3) return null;
        
        const prices = history.slice(0, 10).map(h => h.price);
        const ma5 = this.calculateMovingAverage(prices, 5);
        const trend = this.calculateTrend(prices);
        const volatility = this.calculateVolatility(prices);
        
        let prediction = prices[0];
        
        if (trend === 'bullish') prediction += volatility * 0.5;
        else if (trend === 'bearish') prediction -= volatility * 0.5;
        
        return Math.max(1000, prediction);
    }

    calculateProfitLoss(buyPrice, currentPrice, amount = 1) {
        const totalBuy = buyPrice * amount;
        const totalCurrent = currentPrice * amount;
        const profit = totalCurrent - totalBuy;
        const percentage = ((profit / totalBuy) * 100);
        
        return {
            profit: profit,
            percentage: percentage,
            totalValue: totalCurrent
        };
    }

    getMarketSentiment(history) {
        if (history.length < 10) return 'neutral';
        
        const prices = history.slice(0, 10).map(h => h.price);
        const trend = this.calculateTrend(prices);
        const volatility = this.calculateVolatility(prices);
        const ma7 = this.calculateMovingAverage(prices, 7);
        const currentPrice = prices[0];
        
        let sentiment = 'neutral';
        let confidence = 50;
        
        if (trend === 'bullish' && currentPrice > ma7) {
            sentiment = 'bullish';
            confidence = Math.min(90, 60 + (volatility < 20 ? 20 : 0));
        } else if (trend === 'bearish' && currentPrice < ma7) {
            sentiment = 'bearish';
            confidence = Math.min(90, 60 + (volatility < 20 ? 20 : 0));
        }
        
        return { sentiment, confidence };
    }
}