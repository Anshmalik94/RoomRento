// Simple test script to validate notification functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testNotificationSystem() {
  try {
    console.log('🧪 Testing Notification System...\n');
    
    // Test 1: Login with demo credentials
    console.log('1. Testing login with demo credentials...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'demo@renter.com',
      password: 'demo123'
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Login successful');
      console.log('Token:', loginResponse.data.token.substring(0, 20) + '...');
      
      const token = loginResponse.data.token;
      
      // Test 2: Get notifications
      console.log('\n2. Testing get notifications...');
      const notificationsResponse = await axios.get(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Notifications fetched successfully');
      console.log('Response:', JSON.stringify(notificationsResponse.data, null, 2));
      
      // Test 3: Test mark all as read
      console.log('\n3. Testing mark all as read...');
      const markReadResponse = await axios.patch(`${BASE_URL}/api/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Mark all as read successful');
      console.log('Response:', JSON.stringify(markReadResponse.data, null, 2));
      
    } else {
      console.log('❌ Login failed - no token received');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testNotificationSystem();
