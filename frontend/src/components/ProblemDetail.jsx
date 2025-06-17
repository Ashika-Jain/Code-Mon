import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const ProblemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('cpp');
    const [submissionStatus, setSubmissionStatus] = useState(null);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                // Check if JWT token exists
                const jwtToken = document.cookie.includes('jwt=');
                if (!jwtToken) {
                    navigate('/login');
                    return;
                }

                console.log('Fetching problem with ID:', id);
                const response = await axiosInstance.get(`${API_BASE_URL}/api/problems/${id}`, {
                    withCredentials: true
                });
                console.log('Problem response:', response.data);
                setProblem(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching problem:', err);
                console.error('Error details:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message
                });
                setError('Failed to fetch problem details. Please try again later.');
                setLoading(false);
                // Redirect to login if unauthorized
                if (err.response?.status === 401) {
                    navigate('/login');
                }
                // Redirect to problems list if problem not found
                else if (err.response?.status === 404) {
                    navigate('/problems');
                }
            }
        };

        if (id) {
            fetchProblem();
        }
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionStatus('submitting');

        if (!code.trim()) {
            setError('Please enter your code');
            setSubmissionStatus('error');
            return;
        }

        try {
            const response = await axiosInstance.post(
                `${API_BASE_URL}/api/submissions/submit`,
                {
                    problemId: id,
                    code: code.trim(),
                    language: language.toLowerCase()
                }
            );
            setSubmissionStatus('success');
            console.log('Submission successful:', response.data);
            // Optionally redirect to submission history
            // navigate(`/submission_history/${response.data._id}`);
        } catch (err) {
            setSubmissionStatus('error');
            console.error('Error submitting solution:', err);
            console.error('Error details:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });
            setError(err.response?.data?.message || 'Failed to submit solution. Please try again.');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-4">{error}</div>;
    }

    if (!problem) {
        return <div className="text-center mt-4">Problem not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="problem-header">
                <h1>{problem.name || problem.title}</h1>
                <div className="problem-meta">
                    <span className={`difficulty ${problem.difficulty?.toLowerCase()}`}>
                        {problem.difficulty}
                    </span>
                    <span className="tags">{problem.tags}</span>
                </div>
            </div>

            <div className="problem-content">
                <div className="description">
                    <h2>Description</h2>
                    <p>{problem.description}</p>
                </div>

                {problem.showtc && (
                    <div className="test-cases">
                        <h2>Example Test Cases</h2>
                        <pre>{problem.showtc}</pre>
                        <h3>Expected Output:</h3>
                        <pre>{problem.showoutput}</pre>
                    </div>
                )}

                {problem.constraints && (
                    <div className="constraints">
                        <h2>Constraints</h2>
                        <p>{problem.constraints}</p>
                    </div>
                )}

                {problem.hints && (
                    <div className="hints">
                        <h2>Hints</h2>
                        <p>{problem.hints}</p>
                    </div>
                )}
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
                        disabled={submissionStatus === 'submitting'}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
                {submissionStatus === 'success' && (
                    <div className="mt-4 text-green-500">Solution submitted successfully!</div>
                )}
                {submissionStatus === 'error' && (
                    <div className="mt-4 text-red-500">Failed to submit solution. Please try again.</div>
                )}
            </div>
        </div>
    );
};

export default ProblemDetail; 