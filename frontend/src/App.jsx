import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './utils/axiosConfig'; // Import axios configuration
import LoginSignup from './LoginSignup';
import SLoginSignup from './SLoginSignup';
import HeaderLogin from './HeaderLogin';
import SubmissionHistory from './SubmissionHistory'
import Home from './Home';
import ProblemsList from './components/ProblemsList';
import Contribute from './Contribute';
import ProblemDetail from './components/ProblemDetail';
import Myaccount from './Myaccount';
import UserAccount from './components/UserAccount';
import Upload from './Upload';
import ProtectedRoute from './components/ProtectedRoute';
import axiosInstance from './utils/axiosConfig';

function App() {
  const testCORS = async () => {
    try {
      const response = await axiosInstance.get('/test-cors', {
        withCredentials: true
      });
      console.log('CORS Test Response:', response.data);
      alert('CORS is working! Check console for details.');
    } catch (error) {
      console.error('CORS Test Error:', error);
      alert('CORS Error! Check console for details.');
    }
  };

  return (
    <Router>
      <div className="App">
        <button 
          onClick={testCORS}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test CORS
        </button>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<SLoginSignup/>} />
          <Route path="/signup" element={<LoginSignup/>} />
          
          {/* Protected Routes */}
          <Route path="/myaccount" element={
            <ProtectedRoute>
              <Myaccount/>
            </ProtectedRoute>
          } />
          <Route path='/problems' element={
            <ProtectedRoute>
              <ProblemsList/>
            </ProtectedRoute>
          } />
          <Route path="/problems_post" element={
            <ProtectedRoute>
              <Contribute/>
            </ProtectedRoute>
          } />
          <Route path="/submission_history/:id" element={
            <ProtectedRoute>
              <SubmissionHistory/>
            </ProtectedRoute>
          } />
          <Route path="/problems/:id" element={
            <ProtectedRoute>
              <ProblemDetail/>
            </ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute>
              <UserAccount />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
