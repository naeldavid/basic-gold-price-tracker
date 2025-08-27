class CoinAnimation {
    constructor() {
        this.coins = [];
        this.coinEmojis = ['🪙', '💰', '🥇', '💎', '₿'];
        this.init();
    }

    init() {
        this.createCoinContainer();
        this.startAnimation();
    }

    createCoinContainer() {
        const container = document.createElement('div');
        container.id = 'coinContainer';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            overflow: hidden;
        `;
        document.body.appendChild(container);
    }

    createCoin() {
        const coin = document.createElement('div');
        const emoji = this.coinEmojis[Math.floor(Math.random() * this.coinEmojis.length)];
        
        coin.textContent = emoji;
        coin.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 20 + 15}px;
            left: ${Math.random() * 100}%;
            top: -50px;
            animation: fall ${Math.random() * 3 + 2}s linear forwards;
            opacity: ${Math.random() * 0.7 + 0.3};
        `;

        const container = document.getElementById('coinContainer');
        if (container) {
            container.appendChild(coin);
            
            // Remove coin after animation
            setTimeout(() => {
                if (coin.parentNode) {
                    coin.parentNode.removeChild(coin);
                }
            }, 5000);
        }
    }

    startAnimation() {
        // Add CSS animation
        if (!document.getElementById('coinAnimationCSS')) {
            const style = document.createElement('style');
            style.id = 'coinAnimationCSS';
            style.textContent = `
                @keyframes fall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Create 10 coins per second
        setInterval(() => {
            this.createCoin();
        }, 100);
    }
}

// Auto-start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new CoinAnimation();
    });
} else {
    new CoinAnimation();
}