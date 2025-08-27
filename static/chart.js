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
        
        this.assets = {
            btc: { color: '#f7931a', name: 'Bitcoin' },
            gold: { color: '#ffd700', name: 'Gold' },
            silver: { color: '#c0c0c0', name: 'Silver' },
            usd_eur: { color: '#2e8b57', name: 'USD/EUR' }
        };
        
        this.init();
    }

    init() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 ${this.width} ${this.height}" style="background: var(--bg-tertiary);">
                <g id="grid"></g>
                <g id="lines"></g>
                <g id="legend"></g>
            </svg>
        `;
    }

    drawGrid() {
        const grid = this.container.querySelector('#grid');
        if (!grid) return;
        
        grid.innerHTML = '';

        // Vertical lines
        for (let i = 0; i <= 10; i++) {
            const x = this.padding.left + (i * (this.width - this.padding.left - this.padding.right) / 10);
            grid.innerHTML += `<line x1="${x}" y1="${this.padding.top}" x2="${x}" y2="${this.height - this.padding.bottom}" stroke="var(--bg-tertiary)" stroke-width="1"/>`;
        }

        // Horizontal lines
        for (let i = 0; i <= 8; i++) {
            const y = this.padding.top + (i * (this.height - this.padding.top - this.padding.bottom) / 8);
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
        if (!legend) return;
        
        legend.innerHTML = '';

        let x = this.padding.left;
        const y = 20;

        Object.keys(this.assets).forEach((asset) => {
            const assetInfo = this.assets[asset];
            
            legend.innerHTML += `
                <circle cx="${x}" cy="${y}" r="6" fill="${assetInfo.color}"/>
                <text x="${x + 15}" y="${y + 4}" fill="var(--text-primary)" font-size="12" font-weight="500">${assetInfo.name}</text>
            `;
            
            x += assetInfo.name.length * 8 + 40;
        });
    }

    update(allHistories) {
        if (!this.container) return;
        
        this.drawGrid();
        this.drawLegend();
        
        const lines = this.container.querySelector('#lines');
        if (!lines) return;
        
        lines.innerHTML = '';
        
        if (!allHistories || Object.keys(allHistories).length === 0) {
            lines.innerHTML = `
                <text x="${this.width / 2}" y="${this.height / 2}" 
                      fill="var(--text-primary)" 
                      font-size="16" 
                      text-anchor="middle">Multi-Asset Chart</text>
                <text x="${this.width / 2}" y="${this.height / 2 + 30}" 
                      fill="var(--text-secondary)" 
                      font-size="12" 
                      text-anchor="middle">Loading chart data...</text>
            `;
            return;
        }
        
        // Draw simple lines for each asset
        let yOffset = this.padding.top + 50;
        Object.keys(this.assets).forEach(asset => {
            if (allHistories[asset] && allHistories[asset].length > 0) {
                const assetInfo = this.assets[asset];
                const data = allHistories[asset];
                const prices = data.map(d => d.price).filter(p => p && !isNaN(p));
                
                if (prices.length > 1) {
                    let path = '';
                    const chartWidth = this.width - this.padding.left - this.padding.right;
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    const range = max - min || 1;
                    
                    prices.forEach((price, i) => {
                        const x = this.padding.left + (i / (prices.length - 1)) * chartWidth;
                        const y = yOffset + ((max - price) / range) * 40;
                        path += (i === 0 ? `M${x},${y}` : ` L${x},${y}`);
                    });
                    
                    lines.innerHTML += `
                        <path d="${path}" 
                              stroke="${assetInfo.color}" 
                              stroke-width="2" 
                              fill="none"/>
                        <text x="${this.padding.left}" y="${yOffset - 5}" 
                              fill="${assetInfo.color}" 
                              font-size="12">${assetInfo.name}</text>
                    `;
                    
                    yOffset += 60;
                }
            }
        });
        
        // Add title
        lines.innerHTML += `
            <text x="${this.width / 2}" y="25" 
                  fill="var(--text-primary)" 
                  font-size="16" 
                  font-weight="600" 
                  text-anchor="middle">Multi-Asset Price Chart</text>
        `;
    }
}