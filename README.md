# 🔗 URL Shortener

A modern, full-stack URL shortener with Redis caching, MongoDB storage, and a beautiful dark theme UI.

## ✨ Features

- **🚀 Fast URL Shortening** - Convert long URLs to short, memorable links
- **📊 Real-time Analytics** - Track clicks and performance with Redis caching
- **🎨 Dark Theme UI** - Beautiful, responsive design
- **⚡ High Performance** - Redis caching for lightning-fast redirects
- **🔒 Secure** - Rate limiting, input validation, and CORS protection
- **📱 Responsive** - Works perfectly on all devices

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose
- Redis Cloud for caching
- Rate limiting & security middleware

**Frontend:**
- React + Vite
- Dark theme with Tailwind CSS
- React Router for navigation
- Axios for API calls

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd URL_Shortner_Project
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env file with your MongoDB and Redis credentials
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Or Use the Startup Script
```bash
# Windows
./start-servers.ps1
```

## ⚙️ Environment Setup

Create `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urlshortener
REDIS_HOST=redis-14389.c305.ap-south-1-1.ec2.redns.redis-cloud.com
REDIS_PORT=14389
REDIS_PASSWORD=your_redis_password
REDIS_USERNAME=default
PORT=5000
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

## 📁 Project Structure

```
URL_Shortner_Project/
├── backend/
│   ├── controllers/     # API controllers
│   ├── models/         # MongoDB schemas
│   ├── routes/        # API routes
│   ├── services/      # Redis & caching
│   ├── middlewares/   # Security & logging
│   └── server.js      # Main server
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/     # Page components
│   │   └── services/  # API services
│   └── index.html
└── start-servers.ps1  # Startup script
```

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/data/shorten` | Create short URL |
| `GET` | `/:shortId` | Redirect to original URL |
| `GET` | `/api/v1/data/urls` | Get all URLs with hit counts |
| `GET` | `/cache/stats` | Redis cache statistics |
| `GET` | `/health` | Server health check |

## 🎨 UI Features

- **Dark Theme** - Professional dark interface
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - Elegant transitions
- **Real-time Feedback** - Instant URL shortening
- **Analytics Dashboard** - Click tracking and statistics

## 🔧 Key Features

### Redis Caching
- **Cache Hit/Miss** - Intelligent caching strategy
- **Hit Tracking** - Real-time analytics in Redis
- **Performance** - Lightning-fast redirects
- **Popular URLs** - Track trending links

### Security
- **Rate Limiting** - Prevent abuse
- **Input Validation** - URL sanitization
- **CORS Protection** - Secure cross-origin requests
- **XSS Protection** - Input sanitization

### Analytics
- **Click Tracking** - Monitor URL performance
- **Hit Counters** - Real-time statistics
- **Cache Statistics** - Redis performance metrics
- **Database Updates** - Persistent analytics

## 🚀 Performance

- **Redis Caching** - Sub-millisecond response times
- **MongoDB Indexing** - Optimized database queries
- **Base62 Encoding** - Efficient short ID generation
- **Compression** - Gzip compression enabled
- **Rate Limiting** - Prevents system overload

## 📊 Monitoring

- **Health Checks** - Server status monitoring
- **Cache Stats** - Redis performance metrics
- **Hit Tracking** - Real-time analytics
- **Error Logging** - Comprehensive error tracking

## 🎯 Usage

1. **Shorten URLs** - Paste long URLs to get short links
2. **Track Analytics** - Monitor click counts and performance
3. **Fast Redirects** - Lightning-fast URL redirection
4. **Cache Benefits** - Redis-powered performance

## 🔗 Live Demo

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Cache Stats**: http://localhost:5000/cache/stats

## 🛠️ Development

```bash
# Start both servers
./start-servers.ps1

# Or start individually
cd backend && npm start
cd frontend && npm run dev
```

## 📝 License

MIT License - Feel free to use this project for your own purposes.

---

**Built with ❤️ using Node.js, React, MongoDB, and Redis**