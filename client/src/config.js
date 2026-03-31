const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? 'https://parfum-d-elie.herokuapp.com' : 'http://localhost:5000');

export default API_BASE_URL;
