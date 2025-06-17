import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const ProblemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('cpp');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submissionStatus, setSubmissionStatus] = useState('idle');
    const [submissionError, setSubmissionError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    console.log('=== ProblemDetail Component ===');
    console.log('1. Current location:', location.pathname);
    console.log('2. Problem ID:', id);

    // Verify authentication status on component mount and when token changes
    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) {
                console.log('No token found, redirecting to login');
                navigate('/login', { 
                    replace: true,
                    state: { from: location.pathname }
                });
                return;
            }

            try {
                const response = await axiosInstance.get(`${API_BASE_URL}/api/auth/verify`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.data.valid) {
                    console.log('Token invalid, redirecting to login');
                    localStorage.removeItem('jwt');
                    localStorage.removeItem('user');
                    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    navigate('/login', { 
                        replace: true,
                        state: { from: location.pathname }
                    });
                    return;
                }

                setIsAuthenticated(true);
            } catch (error) {
                console.error('Auth verification failed:', error);
                localStorage.removeItem('jwt');
                localStorage.removeItem('user');
                document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                navigate('/login', { 
                    replace: true,
                    state: { from: location.pathname }
                });
            }
        };

        verifyAuth();
    }, [navigate, location]);

    // Fetch problem details only if authenticated
    useEffect(() => {
        const fetchProblem = async () => {
            if (!isAuthenticated) return;

            try {
                const token = localStorage.getItem('jwt');
                const response = await axiosInstance.get(`${API_BASE_URL}/api/problems/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setProblem(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching problem:', error);
                if (error.response?.status === 401) {
                    setIsAuthenticated(false);
                    navigate('/login', { 
                        replace: true,
                        state: { from: location.pathname }
                    });
                } else {
                    setError('Failed to load problem details');
                    setLoading(false);
                }
            }
        };

        if (isAuthenticated) {
            fetchProblem();
        }
    }, [id, isAuthenticated, navigate, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Double-check authentication before submission
        if (!isAuthenticated) {
            console.log('Not authenticated, redirecting to login');
            navigate('/login', { 
                replace: true,
                state: { from: location.pathname }
            });
            return;
        }

        const token = localStorage.getItem('jwt');
        if (!token) {
            console.log('No token found for submission, redirecting to login');
            navigate('/login', { 
                replace: true,
                state: { from: location.pathname }
            });
            return;
        }

        if (!code.trim()) {
            setSubmissionError('Please enter your code');
            setSubmissionStatus('error');
            return;
        }

        setSubmissionStatus('submitting');
        setSubmissionError(null);

        try {
            // Verify token again before submission
            const verifyResponse = await axiosInstance.get(`${API_BASE_URL}/api/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!verifyResponse.data.valid) {
                console.log('Token invalid before submission, redirecting to login');
                setIsAuthenticated(false);
                localStorage.removeItem('jwt');
                localStorage.removeItem('user');
                document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                navigate('/login', { 
                    replace: true,
                    state: { from: location.pathname }
                });
                return;
            }

            const response = await axiosInstance.post(
                `${API_BASE_URL}/api/submissions/submit`,
                {
                    problemId: id,
                    code: code.trim(),
                    language: language.toLowerCase()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setSubmissionStatus('success');
        } catch (err) {
            setSubmissionStatus('error');
            
            if (err.response?.status === 401) {
                console.log('Unauthorized for submission, redirecting to login');
                setIsAuthenticated(false);
                localStorage.removeItem('jwt');
                localStorage.removeItem('user');
                document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                navigate('/login', { 
                    replace: true,
                    state: { from: location.pathname }
                });
            } else {
                setSubmissionError(err.response?.data?.message || 'Failed to submit solution. Please try again.');
            }
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500 text-center">
                    <h2 className="text-2xl font-bold mb-4">Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h1 className="text-3xl font-bold mb-4">{problem?.name}</h1>
                    <div className="prose max-w-none">
                        <p className="text-gray-700">{problem?.description}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Submit Solution</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Language:</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                                <option value="python">Python</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Code:</label>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full h-64 p-2 border rounded font-mono"
                                placeholder="Enter your solution here..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submissionStatus === 'submitting' || !isAuthenticated}
                            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                                submissionStatus === 'submitting' || !isAuthenticated
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit'}
                        </button>
                    </form>
                    {submissionStatus === 'success' && (
                        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
                            Solution submitted successfully!
                        </div>
                    )}
                    {submissionError && (
                        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                            {submissionError}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProblemDetail; 