const axios = require('axios');

const testFetch = async () => {
  try {
    console.log('Testing GET /api/products (127.0.0.1)...');
    const result = await axios.get('http://127.0.0.1:5000/api/products');
    console.log('Success! Status:', result.status);
    console.log('Data length:', Array.isArray(result.data) ? result.data.length : 'Not an array');
  } catch (error) {
    if (error.response) {
      console.log('Server responded with error status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('No response received from server.');
      console.log('Error Code:', error.code);
    } else {
      console.log('Error setting up the request:', error.message);
    }
  }
};

testFetch();
