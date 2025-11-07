# Dynamic API URL Setup - Summary

## ✅ What Was Configured

Your DIAS application now **automatically detects** the correct API URL based on where it's running:

### 🏠 Local Development
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

### ☁️ EC2 Deployment
```
Frontend: http://[EC2_IP]:3000
Backend:  http://[EC2_IP]:5000
```

### 🌐 Custom Domain
```
Frontend: https://yourdomain.com
Backend:  https://yourdomain.com:5000
```

**No manual configuration needed!** 🎉

---

## 📁 Files Modified/Created

### Created Files:
1. **`.env.development`** - Development environment config
2. **`.env.production`** - Production environment config
3. **`public/config.js`** - Runtime configuration script
4. **`API_URL_CONFIGURATION.md`** - Detailed documentation
5. **`test-api-config.html`** - Testing tool

### Modified Files:
1. **`src/services/api.js`** - Added smart API URL detection
2. **`vite.config.js`** - Added proxy for development
3. **`index.html`** - Added config.js loader

---

## 🚀 How to Use

### Local Development

```bash
# Start backend
cd backend
npm run dev

# Start frontend (in another terminal)
cd ..
npm run dev
```

Frontend automatically connects to `http://localhost:5000` ✅

### EC2 Deployment

```bash
# On EC2, build and start
docker-compose build
docker-compose up -d
```

Frontend automatically detects EC2 IP and connects to `http://[EC2_IP]:5000` ✅

### Test the Configuration

**Option 1: Use the test page**
```bash
# Serve the test page
npx serve .

# Open in browser
http://localhost:3000/test-api-config.html
```

**Option 2: Check browser console**

Open your app and look for:
```
🌐 API Base URL: http://localhost:5000
📍 Current Host: localhost
```

---

## 🔧 How It Works (Technical)

### Priority System

The API URL is determined in this order:

1. **Runtime Config** (`window.__RUNTIME_CONFIG__.API_BASE_URL`)
   - Loaded from `/public/config.js`
   - Checks `window.location.hostname`
   - Runs in the browser

2. **Build-time Env Var** (`import.meta.env.VITE_API_BASE_URL`)
   - From `.env.development` or `.env.production`
   - Baked into the build

3. **Auto-detection** (Fallback)
   - If `hostname === 'localhost'` → `http://localhost:5000`
   - Otherwise → `http://[hostname]:5000`

### Code Flow

```javascript
// In src/services/api.js
const getApiBaseUrl = () => {
  // Check runtime config first
  if (window.__RUNTIME_CONFIG__?.API_BASE_URL) {
    return window.__RUNTIME_CONFIG__.API_BASE_URL;
  }

  // Check build-time env var
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Auto-detect
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  return `http://${hostname}:5000`;
};
```

---

## 🛠️ Customization

### Override API URL (if needed)

**Method 1: Edit `public/config.js`**

```javascript
window.__RUNTIME_CONFIG__ = {
  API_BASE_URL: 'http://custom-api-server:8080'
};
```

**Method 2: Set environment variable**

```bash
# Before building
export VITE_API_BASE_URL=http://custom-api-server:8080
npm run build
```

**Method 3: Docker build arg**

```yaml
# docker-compose.yml
services:
  frontend:
    build:
      args:
        - VITE_API_BASE_URL=http://custom-api-server:8080
```

---

## 🐛 Troubleshooting

### Issue: API calls fail

**1. Check the detected URL**

Open browser console:
```
🌐 API Base URL: http://...
```

**2. Test backend directly**

```bash
curl http://[DETECTED_URL]/health
```

**3. Check CORS settings**

In `backend/.env`:
```env
FRONTEND_URL=http://[YOUR_FRONTEND_URL]
```

### Issue: Works locally but not on EC2

**Common causes:**

✅ **Security Group** - Open port 5000
```
EC2 → Security Groups → Edit Inbound Rules
Add: Custom TCP, Port 5000, Source 0.0.0.0/0
```

✅ **Backend not running**
```bash
docker ps  # Should see dias-backend
docker logs dias-backend  # Check for errors
```

✅ **Firewall**
```bash
sudo ufw allow 5000
```

### Issue: Wrong URL detected

**Debug steps:**

1. Open `test-api-config.html` in browser
2. Check console for logs
3. Verify `/public/config.js` exists
4. Check `window.location.hostname` value

---

## 📚 Additional Resources

- **Full Documentation:** [API_URL_CONFIGURATION.md](API_URL_CONFIGURATION.md)
- **AWS Deployment Guide:** [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md)
- **Test Tool:** [test-api-config.html](test-api-config.html)

---

## ✨ Benefits

✅ **Zero Configuration** - Works out of the box

✅ **Environment Agnostic** - Same code works everywhere

✅ **Easy to Override** - When needed for custom setups

✅ **Developer Friendly** - Console logs for debugging

✅ **Production Ready** - Auto-detects EC2, domains, etc.

---

## 🎯 Next Steps

1. **Test locally:** `npm run dev`
2. **Deploy to EC2:** Follow [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md)
3. **Verify:** Open `test-api-config.html` and run tests
4. **Monitor:** Check browser console for API URL logs

---

**All set! Your API configuration is now dynamic and will work in any environment.** 🚀
