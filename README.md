# 💰 Basic Price Tracker

A simple, real-time multi-asset tracking web application with analytics, portfolio management, and clean interface powered by Yahoo Finance APIs.

## ✨ Key Features

### 📊 Multi-Asset Support
- **Cryptocurrencies**: Bitcoin, Ethereum, BNB, Cardano, Solana, XRP, Polkadot, Dogecoin, Avalanche, Polygon
- **Precious Metals**: Gold, Silver, Platinum, Palladium
- **Major Currencies**: EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR
- **Big Mac Index**: Economic indicator across 5 countries

### 🔄 Real-Time Data
- **Yahoo Finance Integration**: Live market data without API keys
- **No Cached Data**: Always fresh, real-time prices
- **Error Handling**: Clean failures with user notifications
- **Auto-Refresh**: Configurable update intervals

### 🎯 Advanced Interface
- **Category Navigation**: Organized tabs for crypto, metals, currencies, economic indicators
- **Asset Selection**: Customizable tracking with setup wizard
- **Portfolio Management**: Separate tracking vs portfolio selection
- **Professional Design**: Inter font, square edges, business-grade appearance

### 📈 Analytics & Charts
- **Custom SVG Charts**: Multi-asset comparison with proper scaling
- **Technical Indicators**: RSI, Moving Averages, Volatility, MACD
- **Market Sentiment**: Trend analysis and predictions
- **Price History**: Comprehensive historical data tracking

### 🚨 Smart Alerts
- **Multiple Alert Types**: Price thresholds, percentage changes
- **Browser Notifications**: Desktop alerts with sound
- **Visual Notifications**: In-app alert system
- **Alert History**: Track triggered alerts

### 🎨 Themes & Customization
- **4 Professional Themes**: Dark, Light, Gold, Blue
- **Theme Switching**: Instant theme changes
- **Custom Animations**: Configurable coin rain animation
- **Responsive Design**: Mobile-optimized interface

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Refresh Prices |
| `H` | Toggle History |
| `S` | Toggle Settings |
| `N` | Toggle News |
| `A` | Toggle Advanced Mode |
| `R` | Refresh Data |
| `T` | Switch Theme |
| `Esc` | Close All Panels |
| `Alt+H` | Show Help |

---

## 🛠️ Technical Architecture

### Frontend Stack
- **Vanilla JavaScript**: Modular ES6+ architecture
- **Custom SVG Charts**: Multi-asset visualization
- **CSS Variables**: Dynamic theming system
- **LocalStorage**: Data persistence and settings
- **Service Worker Ready**: PWA capabilities

### API Integration
- **Yahoo Finance**: Primary data source for all assets
- **Real-Time Quotes**: Live market data
- **Symbol Mapping**: Crypto (BTC-USD), Metals (GC=F), Forex (EURUSD=X)
- **Error Recovery**: Graceful API failure handling

### Core Classes
```javascript
UniversalAPI        // Yahoo Finance integration
DataStorage         // LocalStorage with compression
Analytics           // Technical analysis & indicators
AlertSystem         // Notification management
ThemeManager        // Dynamic theme switching
CustomChart         // SVG-based charting
UniversalTracker    // Main application controller
CoinAnimation       // Background animations
```

---

## 📱 Features Breakdown

### Setup & Onboarding
- **User Registration**: Name input and welcome
- **Asset Selection**: Choose from 40+ assets across 4 categories
- **Guided Setup**: Step-by-step configuration
- **Instant Preview**: Real-time price display during setup

### Main Dashboard
- **Live Price Display**: Current prices with change indicators
- **Category Tabs**: Crypto, Metals, Currencies, Big Mac Index
- **Asset Grid**: Overview of all selected assets
- **Status Bar**: Connection status, update counter, last refresh

### Advanced Analytics
- **Technical Indicators**: RSI, MACD, Bollinger Bands
- **Moving Averages**: 5-day and 10-day calculations
- **Volatility Analysis**: Market risk assessment
- **Trend Detection**: Pattern recognition and predictions

### Portfolio Management
- **Asset Tracking**: Monitor selected assets
- **Portfolio Selection**: Separate investment tracking
- **Performance Metrics**: P&L calculations
- **Historical Analysis**: Price trend visualization

### Data Management
- **Export/Import**: JSON backup system
- **Auto-Backup**: Hourly data preservation
- **Settings Sync**: Cross-session configuration
- **Data Compression**: Efficient storage utilization

---

## 🚀 Getting Started

1. **Open Application**: Launch `nael.openlab.fr/basic-price-tracker` in a modern browser
2. **Complete Setup**: Enter name and select assets to track
3. **Explore Interface**: Navigate categories and view real-time prices
4. **Customize Experience**: Adjust themes, alerts, and settings
5. **Monitor Markets**: Use keyboard shortcuts for quick actions

---

## 📊 Supported Assets

### Cryptocurrencies (10)
- Bitcoin (BTC), Ethereum (ETH), Binance Coin (BNB)
- Cardano (ADA), Solana (SOL), Ripple (XRP)
- Polkadot (DOT), Dogecoin (DOGE), Avalanche (AVAX), Polygon (MATIC)

### Precious Metals (4)
- Gold (XAU), Silver (XAG), Platinum (XPT), Palladium (XPD)

### Major Currencies (8)
- EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR

### Economic Indicators (5)
- Big Mac Index: USA, UK, Japan, EU, Canada

---

## 🔧 Configuration

### Theme Options
- **Dark**: Professional dark mode
- **Light**: Clean light interface
- **Gold**: Luxury gold theme
- **Blue**: Corporate blue design

### Alert Settings
- **Price Thresholds**: Above/below specific values
- **Percentage Changes**: Up/down movement alerts
- **Sound Notifications**: Configurable audio alerts
- **Browser Notifications**: Desktop notification support

### Performance Settings
- **Auto-Refresh**: 1-60 minute intervals
- **Animation Speed**: Coin rain customization
- **Data Retention**: Historical data limits
- **Compression**: Storage optimization

---

## 💡 Advanced Features

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and announcements
- **High Contrast**: Automatic detection and support
- **Reduced Motion**: Animation preferences respected

### Performance Monitoring
- **API Call Tracking**: Request monitoring
- **Success/Failure Rates**: Performance metrics
- **Response Time**: API latency tracking
- **Error Logging**: Comprehensive error handling

### Mobile Optimization
- **Touch Interface**: Mobile-friendly controls
- **Responsive Layout**: Adaptive design
- **Gesture Support**: Touch navigation
- **Offline Indicators**: Connection status

---

## 🎯 Use Cases

- **Personal Investment**: Track crypto and traditional assets
- **Market Research**: Analyze trends and patterns
- **Educational Tool**: Learn about different asset classes
- **Professional Trading**: Monitor multiple markets simultaneously
- **Economic Analysis**: Big Mac Index and currency tracking

---

## 🔒 Privacy & Security

- **No External Accounts**: No registration required
- **Local Data Storage**: All data stored locally
- **No API Keys**: Free Yahoo Finance integration
- **Privacy First**: No user tracking or analytics

---

## 📈 Future Enhancements

- Additional asset classes (commodities, indices)
- Advanced charting tools and indicators
- Portfolio performance analytics
- Social features and market sentiment
- Mobile app development
- API rate limiting optimization

---

## 🏗️ File Structure

```
basic-gold-price-tracker/
├── index.html          # Main application
├── setup.html          # Onboarding wizard
├── static/
│   ├── core.js         # Backend classes (2000+ lines)
│   ├── app.js          # Frontend logic (2000+ lines)
│   └── style.css       # Professional styling
└── README.md           # This file
```

---

**Built with ❤️ using Vanilla JavaScript and Yahoo Finance APIs**
