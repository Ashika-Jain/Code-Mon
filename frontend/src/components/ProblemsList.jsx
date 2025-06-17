import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../utils/axiosConfig";
import ShowSingleP from "../ShowSingleP";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const ProblemsList = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                console.log('ProblemsList: Starting to fetch problems');
                console.log('Current token:', localStorage.getItem('jwt'));
                console.log('Current cookies:', document.cookie);

                // Check if JWT token exists
                const jwtToken = localStorage.getItem('jwt');
                if (!jwtToken) {
                    console.log('ProblemsList: No token found, redirecting to login');
                    navigate('/login');
                    return;
                }

                console.log('ProblemsList: Making API request to fetch problems');
                const response = await axios.get(`${API_BASE_URL}/api/problems`, {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`
                    }
                });

                console.log('ProblemsList: Received problems data:', response.data);
                setProblems(response.data);
                setIsAuthenticated(true);
                setLoading(false);
            } catch (err) {
                console.error('ProblemsList: Error fetching problems:', err);
                console.error('Error details:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message
                });
                setError('Failed to fetch problems. Please try again later.');
                setLoading(false);
                if (err.response?.status === 401) {
                    console.log('ProblemsList: Unauthorized, redirecting to login');
                    navigate('/login');
                }
            }
        };

        fetchProblems();
    }, [navigate]);

    const handleProblemClick = (problemId) => {
        console.log('ProblemsList: Navigating to problem:', problemId);
        navigate(`/problems/${problemId}`);
    };

    if (!isAuthenticated) {
        console.log('ProblemsList: Not authenticated, showing redirect message');
        return <div>Redirecting to login...</div>;
    }

    if (loading) {
        console.log('ProblemsList: Loading state');
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        console.log('ProblemsList: Error state:', error);
        return <div className="text-red-500 text-center mt-4">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Problems</h1>
            <div className="grid gap-4">
                {problems.map((problem) => (
                    <div
                        key={problem._id}
                        onClick={() => handleProblemClick(problem._id)}
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    >
                        <h2 className="text-xl font-semibold mb-2">{problem.title}</h2>
                        <p className="text-gray-600 mb-2">Difficulty: {problem.difficulty}</p>
                        <p className="text-gray-600">Category: {problem.category}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProblemsList; 