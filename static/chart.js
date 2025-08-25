class CustomChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Chart container not found:', containerId);
            return;
        }
        
        this.width = 800;
        this.height = 400;
        this.padding = { top: 40, right: 60, bottom: 60, left: 60 };
        this.chartWidth = this.width - this.padding.left - this.padding.right;
        this.chartHeight = this.height - this.padding.top - this.padding.bottom;
        
        this.assets = {
            btc: { color: '#f7931a', name: 'Bitcoin', scale: 1000 },
            gold: { color: '#ffd700', name: 'Gold', scale: 1 },
            silver: { color: '#c0c0c0', name: 'Silver', scale: 1 },
            usd_eur: { color: '#2e8b57', name: 'USD Strength', scale: 1000 }
        };
        
        this.init();
    }

    init() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 ${this.width} ${this.height}" style="background: var(--bg-tertiary); border-radius: 10px;">
                <defs>
                    <linearGradient id="gridGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:var(--text-secondary);stop-opacity:0.1" />
                        <stop offset="100%" style="stop-color:var(--text-secondary);stop-opacity:0.05" />
                    </linearGradient>
                </defs>
                <g id="grid"></g>
                <g id="lines"></g>
                <g id="legend"></g>
            </svg>
        `;
    }

    drawGrid() {
        const grid = this.container.querySelector('#grid');
        grid.innerHTML = '';

        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const x = this.padding.left + (i * this.chartWidth / 10);
            grid.innerHTML += `<line x1="${x}" y1="${this.padding.top}" x2="${x}" y2="${this.height - this.padding.bottom}" stroke="var(--bg-tertiary)" stroke-width="1"/>`;
        }

        // Horizontal grid lines
        for (let i = 0; i <= 8; i++) {
            const y = this.padding.top + (i * this.chartHeight / 8);
            grid.innerHTML += `<line x1="${this.padding.left}" y1="${y}" x2="${this.width - this.padding.right}" y2="${y}" stroke="var(--bg-tertiary)" stroke-width="1"/>`;
        }

        // Axes
        grid.innerHTML += `
            <line x1="${this.padding.left}" y1="${this.padding.top}" x2="${this.padding.left}" y2="${this.height - this.padding.bottom}" stroke="var(--text-secondary)" stroke-width="2"/>
            <line x1="${this.padding.left}" y1="${this.height - this.padding.bottom}" x2="${this.width - this.padding.right}" y2="${this.height - this.padding.bottom}" stroke="var(--text-secondary)" stroke-width="2"/>
        `;
    }

    drawLegend() {
        const legend = this.container.querySelector('#legend');
        legend.innerHTML = '';

        let x = this.padding.left;
        const y = 20;

        Object.keys(this.assets).forEach((asset, index) => {
            const assetInfo = this.assets[asset];
            
            legend.innerHTML += `
                <circle cx="${x}" cy="${y}" r="6" fill="${assetInfo.color}"/>
                <text x="${x + 15}" y="${y + 4}" fill="var(--text-primary)" font-size="12" font-weight="500">${assetInfo.name}</text>
            `;
            
            x += assetInfo.name.length * 8 + 40;
        });
    }

    normalizeData(data, asset) {
        if (!data || data.length === 0) return [];
        
        const prices = data.map(item => item.price);
        const scale = this.assets[asset]?.scale || 1;
        
        // Apply scaling
        const scaledPrices = prices.map(price => {
            if (asset === 'btc') return price / scale; // Bitcoin: divide by 1000
            if (asset === 'usd_eur') return (1 / price) * scale; // USD: invert and scale
            return price; // Gold, Silver: use as-is
        });
        
        return scaledPrices;
    }

    drawLine(data, asset, maxValue, minValue) {
        if (!data || data.length < 2) return '';
        
        const normalizedData = this.normalizeData(data, asset);
        const range = maxValue - minValue || 1;
        
        let path = '';
        
        normalizedData.forEach((value, index) => {
            if (value === null || value === undefined) return;
            
            const x = this.padding.left + (index / (normalizedData.length - 1)) * this.chartWidth;
            const y = this.height - this.padding.bottom - ((value - minValue) / range) * this.chartHeight;
            
            if (index === 0) {
                path += `M ${x} ${y}`;
            } else {
                path += ` L ${x} ${y}`;
            }
        });
        
        return path;
    }

    update(allHistories) {
        if (!this.container) return;
        
        this.drawGrid();
        this.drawLegend();
        
        const lines = this.container.querySelector('#lines');
        if (!lines) return;
        
        lines.innerHTML = '';
        
        // Get all normalized data
        const allNormalizedData = {};
        let globalMin = Infinity;
        let globalMax = -Infinity;
        let hasData = false;
        
        Object.keys(this.assets).forEach(asset => {
            if (allHistories[asset] && allHistories[asset].length > 0) {
                const normalizedData = this.normalizeData(allHistories[asset], asset);
                if (normalizedData.length > 0) {
                    allNormalizedData[asset] = normalizedData;
                    
                    const validData = normalizedData.filter(v => v !== null && v !== undefined && !isNaN(v));
                    if (validData.length > 0) {
                        const min = Math.min(...validData);
                        const max = Math.max(...validData);
                        
                        globalMin = Math.min(globalMin, min);
                        globalMax = Math.max(globalMax, max);
                        hasData = true;
                    }
                }
            }
        });
        
        if (!hasData) {
            lines.innerHTML = `<text x="${this.width / 2}" y="${this.height / 2}" fill="var(--text-secondary)" text-anchor="middle">No data available</text>`;
            return;
        }
        
        // Draw lines for each asset
        Object.keys(this.assets).forEach(asset => {
            if (allHistories[asset] && allHistories[asset].length > 0) {
                const path = this.drawLine(allHistories[asset], asset, globalMax, globalMin);
                
                if (path) {
                    lines.innerHTML += `
                        <path d="${path}" 
                              stroke="${this.assets[asset].color}" 
                              stroke-width="3" 
                              fill="none" 
                              stroke-linecap="round"
                              stroke-linejoin="round"/>
                    `;
                }
            }
        });
        
        // Add Y-axis labels
        for (let i = 0; i <= 5; i++) {
            const value = globalMin + (globalMax - globalMin) * (i / 5);
            const y = this.height - this.padding.bottom - (i / 5) * this.chartHeight;
            
            lines.innerHTML += `
                <text x="${this.padding.left - 10}" y="${y + 4}" 
                      fill="var(--text-secondary)" 
                      font-size="11" 
                      text-anchor="end">$${value.toFixed(0)}</text>
            `;
        }
        
        // Add title
        lines.innerHTML += `
            <text x="${this.width / 2}" y="25" 
                  fill="var(--text-primary)" 
                  font-size="16" 
                  font-weight="600" 
                  text-anchor="middle">Multi-Asset Price Comparison</text>
        `;
    }
}