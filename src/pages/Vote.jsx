import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Vote() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [customCandidate, setCustomCandidate] = useState('');
  const [voteSuccess, setVoteSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Helper function to handle errors
  const handleApiError = (error, defaultMessage) => {
    if (error.response) {
      // Handle unauthorized access
      if (error.response.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      
      // Use error message from API if available
      if (error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError(defaultMessage);
      }
    } else {
      setError(defaultMessage);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.get('http://localhost:5000/api/vote/exist', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCandidates(response.data.candidates || []);
      setError(null);
    } catch (err) {
      handleApiError(
        err, 
        'Failed to fetch candidates. Please try again.'
      );
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVote = async (e) => {
    e.preventDefault();
    
    // Determine the candidate name to vote for
    const name = selectedCandidate === 'custom' 
      ? customCandidate.trim() 
      : selectedCandidate;
    
    // Validate the input
    if (!name) {
      setError('Please select a candidate or enter a valid name');
      return;
    }
    
    setSubmitting(true);
    setVoteSuccess(false);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/vote',
        { name },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setError(null);
      setVoteSuccess(true);
      setSelectedCandidate('');
      setCustomCandidate('');
      
      // Reset success message after a delay
      setTimeout(() => {
        setVoteSuccess(false);
      }, 5000);
      
    } catch (err) {
      handleApiError(
        err, 
        'Failed to submit vote. Please try again.'
      );
      console.error('Error submitting vote:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Cast Your Vote</h1>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {voteSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Vote submitted successfully!
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-gray-600">Loading candidates...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitVote} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose a candidate:
                  </label>
                  
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={selectedCandidate}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">-- Select a candidate --</option>
                    {candidates.map((candidate, index) => (
                      <option key={index} value={candidate}>
                        {candidate}
                      </option>
                    ))}
                    <option value="custom">Enter custom candidate</option>
                  </select>
                </div>
                
                {selectedCandidate === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom candidate name:
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={customCandidate}
                      onChange={(e) => setCustomCandidate(e.target.value)}
                      placeholder="Enter candidate name"
                      disabled={submitting}
                    />
                  </div>
                )}
                
                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Vote'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Vote;