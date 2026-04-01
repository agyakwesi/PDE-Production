const axios = require('axios');
async function test() {
  try {
    await axios.get('http://example.com', { headers: { Authorization: 'Bearer ' } });
    console.log("Success with trailing space");
  } catch (err) {
    console.log("Error:", err.message);
  }
}
test();
