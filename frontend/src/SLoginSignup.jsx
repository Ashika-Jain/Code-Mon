import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import axios from 'axios';
import './LoginSignup.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

function SLoginSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    try {
      console.log('Starting login process...');
      console.log('API URL:', `${API_BASE_URL}/api/auth/login`);
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Login response received:', response.data);

      if (response.data.token) {
        console.log('Token received, storing in localStorage and cookie');
        
        // Store token in localStorage
        localStorage.setItem('jwt', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Set cookie for cross-domain requests
        document.cookie = `jwt=${response.data.token}; path=/; secure; sameSite=None`;
        
        console.log('Stored token in localStorage:', localStorage.getItem('jwt'));
        console.log('Stored user in localStorage:', localStorage.getItem('user'));
        console.log('Current cookies:', document.cookie);
        
        await swal({
          title: 'Success!',
          text: 'Login successful!',
          icon: 'success',
          button: 'OK',
        });
        
        console.log('Attempting navigation to /problems');
        // Use navigate with replace to prevent back button issues
        navigate('/problems', { replace: true });
      } else {
        console.log('No token in response');
        swal({
          title: 'Error!',
          text: 'Login failed. Please try again.',
          icon: 'error',
          button: 'OK',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: error.config
      });
      
      swal({
        title: 'Error!',
        text: error.response?.data?.message || 'Login failed. Please try again.',
        icon: 'error',
        button: 'OK',
      });
    }
  };

  function navigate_to_signup() {
    console.log('Navigating to signup page');
    navigate('/signup');
  }

  return (
    <div className='auth-wrapper2'>
      <h1 className='log_title'>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="container-auth-login">
          <label className='auth-label'>Email Id:</label>
          <input
            className='entry-auth'
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            value={email}
            required
          />
          <div className="email error">{emailError}</div>
          <br />

          <label className='auth-label'>Password:</label>
          <input
            className='entry-auth'
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            value={password}
            required
          />
          <div className="password error">{passwordError}</div>
          <br />
          <input className='sub-btn' type="submit" value="Submit" />
        </div>
      </form>
      <div className='new_user' onClick={navigate_to_signup}>
        New to <span className='new_user_hai_kya'>Crack the Code?</span>
        <span className='go_to_signup'>Signup</span>
      </div>
    </div>
  );
}

export default SLoginSignup;
