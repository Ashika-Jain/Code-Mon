import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('jwt');
        console.log('ProtectedRoute: Checking token:', token ? 'exists' : 'missing');
        
        if (!token) {
          console.log('ProtectedRoute: No token found, redirecting to login');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        console.log('ProtectedRoute: Verifying token with backend');
        const response = await axiosInstance.get(`${API_BASE_URL}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('ProtectedRoute: Verification response:', response.data);

        if (response.data.valid) {
          console.log('ProtectedRoute: Token valid, allowing access');
          setIsAuthenticated(true);
        } else {
          console.log('ProtectedRoute: Token invalid, redirecting to login');
          setIsAuthenticated(false);
          // Clear auth data
          localStorage.removeItem('jwt');
          localStorage.removeItem('user');
          document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; sameSite=None';
        }
      } catch (error) {
        console.error('ProtectedRoute: Token verification failed:', error);
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        setIsAuthenticated(false);
        // Clear auth data
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; sameSite=None';
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (isLoading) {
    console.log('ProtectedRoute: Still checking authentication');
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: Authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute; 