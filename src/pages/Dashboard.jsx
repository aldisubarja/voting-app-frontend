import { useState, useEffect, useCallback } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const [voteData, setVoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Helper function to handle errors
  const handleApiError = async (response, defaultMessage) => {
    // Handle unauthorized access
    if (response.status === 401) {
      logout();
      navigate('/login');
      return;
    }
    
    // Try to get the error message from the response
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        return errorData.message;
      }
    } catch {
      // Ignore JSON parsing errors
    }
    
    // Fall back to default message
    return defaultMessage;
  };

  const fetchVoteResults = useCallback(async () => {
    try {
      // Don't show loading indicator on refresh
      if (!voteData) setLoading(true);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/admin/results', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(
          response, 
          'Failed to fetch voting results'
        );
        
        // If we're still here (not redirected), set the error
        if (errorMessage) {
          setError(errorMessage);
        }
        return;
      }
      
      const data = await response.json();
      
      // Only update if data has changed
      if (!voteData || JSON.stringify(data) !== JSON.stringify(voteData)) {
        setVoteData(data);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch voting results. Please try again.');
      console.error('Error fetching vote results:', err);
    } finally {
      setLoading(false);
    }
  }, [voteData, navigate, logout, handleApiError]);

  useEffect(() => {
    // Initial fetch
    fetchVoteResults();
    
    // Set up auto-refresh every 5 seconds
    const intervalId = setInterval(() => {
      fetchVoteResults();
    }, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchVoteResults]); // fetchVoteResults is memoized with useCallback

  const chartData = voteData ? {
    labels: voteData.results.map(result => result._id),
    datasets: [
      {
        data: voteData.results.map(result => result.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Voting Dashboard</h1>
        </div>

        {loading && (
          <div className="text-center py-10">
            <div className="spinner">Loading...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {voteData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vote Summary Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Vote Summary</h2>
                <div className="text-4xl font-bold text-indigo-600">{voteData.totalVotes}</div>
                <p className="mt-1 text-gray-500">Total Votes</p>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Results Breakdown</h3>
                  <ul className="space-y-2">
                    {voteData.results.map((result) => (
                      <li key={result._id} className="flex justify-between">
                        <span className="text-gray-600">{result._id}</span>
                        <span className="font-medium">{result.count} votes</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Chart Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg md:col-span-2">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Vote Distribution</h2>
                <div className="h-64 flex justify-center items-center">
                  {chartData && (
                    <Doughnut 
                      data={chartData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          }
                        }
                      }} 
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;