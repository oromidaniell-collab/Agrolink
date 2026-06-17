import api from './api';

export const authService = {
    // Login
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.accessToken) {
            localStorage.setItem('token', response.data.accessToken);
        }
        return response.data;
    },


    // Register
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.accessToken) {
            localStorage.setItem('token', response.data.accessToken);
        }
        return response.data;
    },


    // Logout
    logout: () => {
        localStorage.removeItem('token');
    },


    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Update profile
    updateProfile: async (userData) => {
        const config = userData instanceof FormData 
            ? { headers: { 'Content-Type': undefined } } 
            : {};
        const response = await api.put('/users/profile', userData, config);
        return response.data;
    },

    // Change password
    changePassword: async (passwords) => {
        const response = await api.put('/users/password', passwords);
        return response.data;
    }
};

export default authService;
