# 🏆 "Basic" Gold Price Tracker

A comprehensive, real-time gold price tracking web-app with advanced analytics, multiple alerts, and portfolio management.

## ✨ Features
- **Real-time Updates**: Multiple API fallbacks with exponential backoff
- **Advanced Analytics**: Moving averages, volatility, trend analysis, price predictions
- **Smart Alerts**: Multiple thresholds, percentage-based alerts, sound notifications
- **Portfolio Tracker**: Profit/loss calculator with real-time updates
- **Data Management**: Export/import functionality with compression
- **Themes**: Dark, light, and gold themes with CSS custom properties
- **Social Sharing**: Share prices on Twitter and Facebook
- **Mobile Optimized**: Responsive design with touch gestures

---

## ⌨️ Keyboard Shortcuts
- `R` - Toggle Advanced Mode
- `Space` - Refresh Price
- `H` - Toggle History
- `S` - Toggle Settings
- `T` - Toggle Theme

---

## 🎯 Advanced Features
- **Market Sentiment Analysis**: AI-powered sentiment with confidence scores
- **Price Predictions**: Next price prediction based on trend analysis
- **Mini Charts**: Sparkline charts in main view
- **Multiple Alert Types**: Above/below price, percentage changes
- **Data Compression**: Efficient storage of large price histories
- **Trend Indicators**: Visual bullish/bearish/neutral indicators
- **Moving Averages**: 7-day and 30-day moving averages
- **Volatility Tracking**: Real-time volatility calculations

---

## Tech Stack
- JavaScript
- Chart.js for visualizations in advanced mode
- CoinDesk API (CORS-friendly)
- Local storage for persistence with price history

---

## 🛠️ Tech Stack
- **Frontend**: Vanilla JavaScript (modular architecture)
- **Charts**: Chart.js with custom themes
- **APIs**: Multiple gold price APIs with fallbacks
- **Storage**: LocalStorage with compression
- **Themes**: CSS custom properties
- **Notifications**: Browser notifications + sound alerts

---

## 📱 Mobile Features
- Touch-optimized interface
- Responsive breakpoints
- Mobile-friendly charts
- Gesture support

---

## 🔧 Architecture
- `api.js` - API management with fallbacks
- `storage.js` - Data persistence and compression
- `analytics.js` - Price analysis and predictions
- `alerts.js` - Alert system with multiple types
- `themes.js` - Theme management
- `script.js` - Main application logic
- `coin.js` - Visual effects
