# Exness Trading Platform
Demo Video : https://github.com/anand9125/exness/issues/1#issue-3853114365

A high-performance cryptocurrency trading platform with real-time price feeds, WebSocket streaming, and multi-timeframe candlestick data aggregation.

## 🏗️ Architecture Overview

![App Screenshot](docs/images/Screenshot_2025-08-29_at_1.31.26_AM.png)


## 🔧 Components

### 1. Price Poller
- Fetches real-time cryptocurrency prices from Binance API
- Continuously polls price data at configured intervals
- Publishes updates to WebSocket service for real-time distribution

### 2. WebSocket Service (WS)
- Pub/Sub architecture for real-time price broadcasting
- Subscribes to price updates from the Price Poller
- Publishes live data to connected frontend clients
- Maintains active WebSocket connections for low-latency updates

### 3. Batch Uploader
- Processes incoming price data in batches
- Aggregates data into multiple timeframe buckets
- Efficiently writes to time-series databases
- Handles data normalization and validation

### 4. Database Layer
Multi-instance time-series database architecture:
- **db_1m**: 1-minute candlestick data
- **db_2m**: 2-minute candlestick data
- **db_3m**: 3-minute candlestick data
- **db_*n**: Additional configurable timeframes

### 5. Backend (BE)
- RESTful API endpoints for historical data queries
- WebSocket connection management
- Authentication and authorization
- Rate limiting and request validation

### 6. Frontend (FE)
- Real-time price charts and trading interface
- WebSocket client for live price feeds
- Historical candlestick data visualization
- Asset selection and timeframe controls

## 🚀 Features

- ✅ Real-time price streaming via WebSocket
- ✅ Multi-asset support
- ✅ Multiple timeframe candlestick aggregation (1m, 2m, 3m, etc.)
- ✅ Historical OHLCV data API
- ✅ Efficient batch processing and storage
- ✅ Scalable pub/sub architecture
- ✅ Low-latency price updates from Binance

## 📡 API Endpoints

### Get Candlestick Data
```
GET /candles?asset={symbol}&timeframe={interval}&limit={count}
```

**Parameters:**
- `asset` (required): Trading pair symbol (e.g., `SOL`, `BTC`, `ETH`)
- `timeframe` (optional): Candle interval - `1m`, `2m`, `3m`, etc. (default: `1m`)
- `limit` (optional): Number of candles to return (default: `100`, max: `1000`)

**Example Request:**
```bash
curl "https://api.exness.com/candles?asset=sol&timeframe=1m&limit=500"
```

**Response:**
```json
{
  "asset": "SOL",
  "timeframe": "1m",
  "candles": [
    {
      "timestamp": 1704067200000,
      "open": 101.23,
      "high": 101.89,
      "low": 101.15,
      "close": 101.76,
      "volume": 15234.56
    }
  ]
}
```

### WebSocket Connection

**Endpoint:**
```
wss://api.exness.com/ws
```

**Subscribe to Price Updates:**
```json
{
  "action": "subscribe",
  "assets": ["SOL", "BTC", "ETH"]
}
```

**Incoming Price Updates:**
```json
{
  "type": "price_update",
  "asset": "SOL",
  "price": 101.76,
  "timestamp": 1704067200000,
  "volume": 1234.56
}
```

## 🛠️ Technology Stack

- **Backend**: Node.js / Rust (specify your choice)
- **Database**: TimescaleDB / InfluxDB (specify your choice)
- **WebSocket**: Socket.io / ws library
- **Message Queue**: Redis / RabbitMQ (specify if used)
- **Frontend**: React / Next.js (specify your choice)
- **External API**: Binance REST & WebSocket APIs

## 📦 Installation

### Prerequisites
- Node.js 18+ or Rust 1.70+
- PostgreSQL 14+ (with TimescaleDB extension) or InfluxDB 2.0+
- Redis 7+ (optional, for caching)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/exness.git
cd exness
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install  # or cargo build

# Frontend
cd ../frontend
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/exness
TIMESCALE_ENABLED=true

# Binance API
BINANCE_API_URL=https://api.binance.com
BINANCE_WS_URL=wss://stream.binance.com:9443

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
WS_PORT=3001

# Assets to track
TRACKED_ASSETS=BTC,ETH,SOL,AVAX,MATIC
```

4. **Initialize database**
```bash
# Run migrations
npm run migrate

# Or with TimescaleDB
psql -U postgres -d exness -f migrations/init_timescale.sql
```

5. **Start services**

**Development:**
```bash
# Terminal 1: Start price poller
npm run poller

# Terminal 2: Start WebSocket service
npm run ws-service

# Terminal 3: Start backend API
npm run backend

# Terminal 4: Start frontend
cd frontend && npm run dev
```

**Production:**
```bash
# Using Docker Compose
docker-compose up -d

# Or with PM2
pm2 start ecosystem.config.js
```

## 🔄 Data Flow

1. **Price Ingestion**
   - Price Poller connects to Binance WebSocket
   - Receives real-time tick data for configured assets
   - Validates and normalizes price data

2. **Real-time Distribution**
   - Publishes to WebSocket service via pub/sub
   - WS service broadcasts to all subscribed clients
   - Frontend updates charts in real-time

3. **Data Aggregation**
   - Batch Uploader collects ticks in memory buffers
   - Aggregates into OHLCV candles at multiple intervals
   - Flushes batches to respective database instances

4. **Historical Queries**
   - Frontend requests historical data via REST API
   - Backend queries appropriate timeframe database
   - Returns paginated candlestick data

## 📊 Database Schema

### Candlestick Tables (per timeframe)

```sql
CREATE TABLE candles_1m (
    timestamp TIMESTAMPTZ NOT NULL,
    asset VARCHAR(20) NOT NULL,
    open DECIMAL(20, 8) NOT NULL,
    high DECIMAL(20, 8) NOT NULL,
    low DECIMAL(20, 8) NOT NULL,
    close DECIMAL(20, 8) NOT NULL,
    volume DECIMAL(20, 8) NOT NULL,
    PRIMARY KEY (timestamp, asset)
);

-- TimescaleDB hypertable conversion
SELECT create_hypertable('candles_1m', 'timestamp');

-- Create indexes
CREATE INDEX idx_candles_1m_asset ON candles_1m (asset, timestamp DESC);
```

## ⚙️ Configuration

### Timeframe Configuration

Edit `config/timeframes.json`:
```json
{
  "timeframes": [
    { "interval": "1m", "seconds": 60, "retention_days": 7 },
    { "interval": "2m", "seconds": 120, "retention_days": 14 },
    { "interval": "3m", "seconds": 180, "retention_days": 30 },
    { "interval": "5m", "seconds": 300, "retention_days": 60 },
    { "interval": "15m", "seconds": 900, "retention_days": 90 },
    { "interval": "1h", "seconds": 3600, "retention_days": 365 }
  ]
}
```

### Asset Configuration

Edit `config/assets.json`:
```json
{
  "assets": [
    { "symbol": "SOL", "binance_pair": "SOLUSDT", "precision": 8 },
    { "symbol": "BTC", "binance_pair": "BTCUSDT", "precision": 8 },
    { "symbol": "ETH", "binance_pair": "ETHUSDT", "precision": 8 }
  ]
}
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run load tests
npm run test:load
```

## 📈 Performance Optimization

- **Database Indexing**: Compound indexes on (asset, timestamp)
- **TimescaleDB Compression**: Automatic compression for older data
- **Connection Pooling**: Reuse database connections
- **Batch Processing**: Aggregate writes to reduce database load
- **Redis Caching**: Cache frequently accessed candlestick data
- **WebSocket Throttling**: Rate-limit price updates to prevent client overload

## 🔒 Security

- Rate limiting on API endpoints
- WebSocket connection authentication
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- CORS configuration for frontend access

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read CONTRIBUTING.md for guidelines.

## 📧 Contact

For questions or support, reach out to [your-email@example.com]

---

**Built with ❤️ for high-frequency trading**
