// Frontend/src/api/userApi.js - ENHANCED
import api from "./apiClient";


export const userApi = {
  // Send registration OTP
  sendOtp: async (userData) => {
    const res = await api.post('/auth/send-otp', userData);
    return res.data;
  },

  // Verify registration OTP
  verifyOtp: async (userData) => {
    const res = await api.post('/auth/verify-otp', userData);
    return res.data;
  },

  // Registration
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  // Login
  login: async (credentials) => {
    
    const res = await api.post("/user/login", credentials);
   
    return res.data;
  },

  // Get profile
  getProfile: async () => {
    
    try {
      const res = await api.get("/user/profile");
     
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Get bookings
  getBookings: async (params = {}) => {
     
    try {
      const res = await api.get("/user/bookings", { params });
       
      return res.data;
    } catch (error) {
      
      throw error;
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    const res = await api.put("/user/profile", profileData);
    return res.data;
  },

  // Get single booking by ID
  getBookingById: async (bookingId) => {
    const res = await api.get(`/user/bookings/${bookingId}`);
    return res.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    
    const res = await api.put(`/user/bookings/${bookingId}/cancel`);
    return res.data;
  }
};