const axios = require('axios');
const io = require('socket.io-client');

const API_URL = 'http://localhost:4001';
let authToken = '';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(level, message) {
  const timestamp = new Date().toLocaleTimeString();
  const color = colors[level] || colors.reset;
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

async function testLogin() {
  log('blue', '🔐 Testing Login...');
  
  try {
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@user.com',
      password: 'test123'
    });
    
    if (loginResponse.data.accessToken) {
      authToken = loginResponse.data.accessToken;
      log('green', '✅ Login successful - Token acquired');
      return true;
    } else {
      log('red', '❌ Login failed - No token returned');
      return false;
    }
  } catch (error) {
    log('red', `❌ Login error: ${error.message}`);
    return false;
  }
}

async function testProfileLoading() {
  log('blue', '👤 Testing Profile Loading...');
  
  try {
    log('cyan', `   → Making request to: ${API_URL}/profile`);
    log('cyan', `   → With token: ${authToken.substring(0, 20)}...`);
    
    const profileResponse = await axios.get(`${API_URL}/profile`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (profileResponse.data.success && profileResponse.data.data) {
      const profile = profileResponse.data.data;
      log('green', '✅ Profile loaded successfully');
      log('green', `   → Name: ${profile.name}`);
      log('green', `   → Email: ${profile.email}`);
      log('green', `   → Role: ${profile.role}`);
      return true;
    } else {
      log('red', '❌ Profile response format incorrect');
      log('red', `   → Response: ${JSON.stringify(profileResponse.data)}`);
      return false;
    }
  } catch (error) {
    log('red', `❌ Profile loading error: ${error.message}`);
    if (error.response) {
      log('red', `   → Status: ${error.response.status}`);
      log('red', `   → Response: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

async function testChatConnection() {
  log('blue', '💬 Testing Chat Connection...');
  
  return new Promise((resolve) => {
    const socket = io(API_URL, {
      auth: {
        token: authToken,
        userId: 'test-user-id'
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
    });

    let connectionTimeout = setTimeout(() => {
      log('red', '❌ Chat connection timeout after 10 seconds');
      socket.disconnect();
      resolve(false);
    }, 10000);

    socket.on('connect', () => {
      clearTimeout(connectionTimeout);
      log('green', `✅ Chat connected successfully - Socket ID: ${socket.id}`);
      
      // Test room joining
      socket.emit('joinRoom', 'test-room');
      log('cyan', '   → Joined test room');
      
      // Test message sending
      socket.emit('message', {
        roomId: 'test-room',
        senderId: 'test-user',
        message: 'Test message from debug script'
      });
      log('cyan', '   → Sent test message');
      
      socket.disconnect();
      resolve(true);
    });

    socket.on('connected', (data) => {
      log('green', `🎉 Chat connection confirmed by server`);
      log('green', `   → Server confirmation: ${JSON.stringify(data)}`);
    });

    socket.on('connect_error', (error) => {
      clearTimeout(connectionTimeout);
      log('red', `❌ Chat connection error: ${error.message}`);
      socket.disconnect();
      resolve(false);
    });

    socket.on('disconnect', (reason) => {
      log('yellow', `⚠️  Chat disconnected: ${reason}`);
    });

    socket.on('message', (data) => {
      log('cyan', `   → Received message: ${JSON.stringify(data)}`);
    });

    socket.on('joinedRoom', (data) => {
      log('cyan', `   → Room joined confirmation: ${JSON.stringify(data)}`);
    });
  });
}

async function runDebugTests() {
  log('blue', '🔍 Debug Tests for Profile & Chat Issues');
  log('blue', '=========================================');
  
  // Test 1: Login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    log('red', '❌ Cannot proceed without login');
    return;
  }
  
  // Test 2: Profile Loading
  const profileSuccess = await testProfileLoading();
  
  // Test 3: Chat Connection
  const chatSuccess = await testChatConnection();
  
  // Summary
  log('blue', '=========================================');
  log('blue', '📊 Debug Results Summary:');
  log(loginSuccess ? 'green' : 'red', `🔐 Login: ${loginSuccess ? 'WORKING' : 'FAILED'}`);
  log(profileSuccess ? 'green' : 'red', `👤 Profile: ${profileSuccess ? 'WORKING' : 'FAILED'}`);
  log(chatSuccess ? 'green' : 'red', `💬 Chat: ${chatSuccess ? 'WORKING' : 'FAILED'}`);
  
  if (profileSuccess && chatSuccess) {
    log('green', '🎉 All issues resolved! Both profile and chat are working.');
  } else {
    if (!profileSuccess) {
      log('yellow', '⚠️  Profile still has issues - check backend logs');
    }
    if (!chatSuccess) {
      log('yellow', '⚠️  Chat still has issues - check WebSocket server');
    }
  }
}

// Run the debug tests
runDebugTests().catch(error => {
  log('red', `Fatal error: ${error.message}`);
  process.exit(1);
}); 