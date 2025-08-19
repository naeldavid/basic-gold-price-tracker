class CoinRain {
    constructor() {
        this.coins = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.init();
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'coinCanvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '999';
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createCoin() {
        return {
            x: Math.random() * this.canvas.width,
            y: -20,
            size: Math.random() * 15 + 10,
            speed: Math.random() * 3 + 2,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        };
    }

    drawCoin(coin) {
        this.ctx.save();
        this.ctx.translate(coin.x, coin.y);
        this.ctx.rotate(coin.rotation);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, coin.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#FFA500';
        this.ctx.font = `${coin.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('$', 0, coin.size/3);
        this.ctx.restore();
    }

    start() {
        if (this.animationId) return;
        
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (Math.random() < 0.1) {
                this.coins.push(this.createCoin());
            }
            
            this.coins = this.coins.filter(coin => {
                coin.y += coin.speed;
                coin.rotation += coin.rotationSpeed;
                this.drawCoin(coin);
                return coin.y < this.canvas.height + 50;
            });
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
        setTimeout(() => this.stop(), 3000);
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.coins = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

const coinRain = new CoinRain();

// Trigger coin rain on price updates
function triggerCoinRain() {
    coinRain.start();
}