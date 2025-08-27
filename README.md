# 🏆 "Basic" Price Tracker

A comprehensive, real-time multi-asset tracking web-app with advanced analytics, portfolio management, and professional interface.

## ✨ Features
- **Multi-Asset Support**: Bitcoin, precious metals (gold/silver), 30+ major currencies, Big Mac Index
- **Real-time Updates**: Multiple API fallbacks with proper error handling
- **Category Navigation**: Crypto, metals, currencies, and economic indicators
- **Advanced Analytics**: Moving averages, volatility, trend analysis, RSI calculations
- **Smart Alerts**: Multiple thresholds, percentage-based alerts, sound notifications
- **Portfolio Management**: Separate tracking and portfolio selection with P&L calculations
- **Data Management**: Export/import functionality with compression
- **Professional Themes**: Dark, light, and gold themes with square design
- **Custom Charts**: SVG-based multi-asset comparison charts

---

## ⌨️ Keyboard Shortcuts
- `Space` - Refresh Prices
- `H` - Toggle History
- `S` - Toggle Settings
- `N` - Toggle News
- `A` - Toggle Alerts
- `R` - Toggle Advanced Mode

---

## 🎯 Advanced Features
- **Multi-Asset Tracking**: Bitcoin (3 API fallbacks), precious metals, forex, Big Mac Index
- **Category-Based Navigation**: Organized by crypto, metals, currencies, economic indicators
- **Portfolio Management**: Separate selection for tracking vs portfolio with real P&L
- **Custom SVG Charts**: Multi-asset comparison with proper scaling
- **Market Analytics**: RSI, moving averages, volatility, trend predictions
- **Professional Interface**: Inter font, square design, business-grade appearance
- **Real API Integration**: CoinGecko, Coinbase, Binance for Bitcoin; metals.live for precious metals
- **Currency Support**: 30+ major world currencies with native formatting

---

## 🛠️ Tech Stack
- **Frontend**: Vanilla JavaScript (modular architecture)
- **Charts**: Custom SVG implementation for multi-asset support
- **APIs**: CoinGecko, Coinbase, Binance (Bitcoin), metals.live (precious metals), exchangerate-api (forex)
- **Storage**: LocalStorage with compression and multi-asset history
- **Themes**: CSS custom properties with professional square design
- **Fonts**: Inter font family for professional appearance
- **Notifications**: Browser notifications + sound alerts

---

## 📱 Mobile Features
- Touch-optimized interface
- Responsive breakpoints
- Mobile-friendly charts
- Gesture support

---

## 🔧 Architecture
- `api.js` - UniversalAPI class with multi-asset support and API fallbacks
- `storage.js` - DataStorage class with compression and multi-asset history
- `analytics.js` - Analytics class with RSI, moving averages, predictions
- `alerts.js` - AlertSystem class with multiple alert types
- `themes.js` - ThemeManager with professional themes
- `chart.js` - CustomChart class for SVG-based multi-asset charts
- `script.js` - UniversalTracker main application logic
- `style.css` - Professional CSS with Inter font and square design
