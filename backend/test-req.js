const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      fullName: 'Anmol Kumar',
      email: 'anmolkj006@gmai.com',
      phone: '6203913851',
      password: 'Password123',
      confirmPassword: 'Password123'
    });
    console.log(res.data);
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
