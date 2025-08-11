#!/usr/bin/env tsx
/**
 * Simple test to verify FedEx API integration
 */

async function testFedExAPI() {
  console.log('🧪 Testing FedEx API Integration...');
  
  try {
    // Test the connection endpoint
    console.log('Checking FedEx API connection...');
    const response = await fetch('http://localhost:5000/api/shipping/services');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ FedEx services endpoint working');
      console.log('Available services:', data.services?.length || 0);
    } else {
      console.log('❌ FedEx services endpoint returned status:', response.status);
    }
  } catch (error) {
    console.error('❌ FedEx API test failed:', error);
  }
  
  // Test environment variables
  console.log('\n📋 Environment Variables Check:');
  console.log('FEDEX_API_KEY:', process.env.FEDEX_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('FEDEX_SECRET_KEY:', process.env.FEDEX_SECRET_KEY ? '✅ Set' : '❌ Missing');
  console.log('FEDEX_ACCOUNT_NUMBER:', process.env.FEDEX_ACCOUNT_NUMBER ? '✅ Set' : '❌ Missing');
  
  console.log('\n🎯 Integration Summary:');
  console.log('- FedEx service created in server/fedexService.ts');
  console.log('- API endpoints added to server/routes.ts');
  console.log('- Frontend components created for shipping rates and tracking');
  console.log('- Shipping page available at /shipping');
  
  console.log('\n📝 Next steps:');
  console.log('1. Test checkout with shipping rate calculation');
  console.log('2. Verify tracking functionality with a real tracking number');
  console.log('3. Integrate shipping rates into the checkout process');
}

testFedExAPI();