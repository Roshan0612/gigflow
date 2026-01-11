import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGigById, clearCurrentGig } from '../store/gigSlice';
import { createBid, fetchBidsForGig, hireBid, clearBids, clearError } from '../store/bidSlice';
import toast from 'react-hot-toast';

const GigDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentGig, loading: gigLoading } = useSelector((state) => state.gigs);
  const { bids, loading: bidLoading, error: bidError } = useSelector((state) => state.bids);
  const { user } = useSelector((state) => state.auth);

  const [bidForm, setBidForm] = useState({
    message: '',
    price: ''
  });

  const [showBidForm, setShowBidForm] = useState(false);

  useEffect(() => {
    dispatch(fetchGigById(id));
    
    return () => {
      dispatch(clearCurrentGig());
      dispatch(clearBids());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (currentGig && user && currentGig.ownerId._id === user._id) {
      // Owner can see bids
      dispatch(fetchBidsForGig(id));
    }
  }, [currentGig, user, id, dispatch]);

  useEffect(() => {
    if (bidError) {
      toast.error(bidError);
      dispatch(clearError());
    }
  }, [bidError, dispatch]);

  const isOwner = currentGig && user && currentGig.ownerId._id === user._id;
  const canBid = currentGig && user && currentGig.ownerId._id !== user._id && currentGig.status === 'open';

  const handleBidSubmit = async (e) => {
    e.preventDefault();

    if (!bidForm.message || !bidForm.price) {
      toast.error('Please fill in all fields');
      return;
    }

    if (bidForm.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    try {
      await dispatch(createBid({
        gigId: id,
        message: bidForm.message,
        price: Number(bidForm.price)
      })).unwrap();
      
      toast.success('Bid submitted successfully!');
      setBidForm({ message: '', price: '' });
      setShowBidForm(false);
    } catch (error) {
      // Error is handled by useEffect
    }
  };

  const handleHire = async (bidId) => {
    if (!window.confirm('Are you sure you want to hire this freelancer? This action cannot be undone.')) {
      return;
    }

    try {
      await dispatch(hireBid(bidId)).unwrap();
      toast.success('Freelancer hired successfully!');
      // Refresh gig data
      dispatch(fetchGigById(id));
    } catch (error) {
      // Error is handled by useEffect
    }
  };

  if (gigLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading gig details...</div>
      </div>
    );
  }

  if (!currentGig) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Gig not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to Gigs
        </button>

        {/* Gig Details */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              {currentGig.title}
            </h1>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              currentGig.status === 'open' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {currentGig.status === 'open' ? 'Open' : 'Assigned'}
            </span>
          </div>

          <p className="text-gray-600 mb-6 whitespace-pre-wrap">
            {currentGig.description}
          </p>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div>
              <span className="text-3xl font-bold text-blue-600">
                ${currentGig.budget}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Posted by</p>
              <p className="font-semibold text-gray-800">
                {currentGig.ownerId.name}
              </p>
            </div>
          </div>
        </div>

        {/* Bid Form for Non-owners */}
        {canBid && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Place Your Bid
            </h2>

            {!showBidForm ? (
              <button
                onClick={() => setShowBidForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Submit a Bid
              </button>
            ) : (
              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Proposal
                  </label>
                  <textarea
                    value={bidForm.message}
                    onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Explain why you're the best fit for this project..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Price ($)
                  </label>
                  <input
                    type="number"
                    value={bidForm.price}
                    onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 450"
                    min="1"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={bidLoading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {bidLoading ? 'Submitting...' : 'Submit Bid'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBidForm(false);
                      setBidForm({ message: '', price: '' });
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Cannot bid message */}
        {currentGig.status === 'assigned' && !isOwner && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              This gig has already been assigned to a freelancer.
            </p>
          </div>
        )}

        {/* Bids List for Owner */}
        {isOwner && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Received Bids ({bids.length})
            </h2>

            {bidLoading && (
              <div className="text-center text-gray-600">Loading bids...</div>
            )}

            {!bidLoading && bids.length === 0 && (
              <div className="text-center text-gray-600">
                No bids received yet.
              </div>
            )}

            <div className="space-y-4">
              {bids.map((bid) => (
                <div
                  key={bid._id}
                  className={`border rounded-lg p-6 ${
                    bid.status === 'hired' 
                      ? 'border-green-500 bg-green-50' 
                      : bid.status === 'rejected'
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {bid.freelancerId.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {bid.freelancerId.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        ${bid.price}
                      </p>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        bid.status === 'hired' 
                          ? 'bg-green-200 text-green-800' 
                          : bid.status === 'rejected'
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {bid.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {bid.message}
                  </p>

                  {bid.status === 'pending' && currentGig.status === 'open' && (
                    <button
                      onClick={() => handleHire(bid._id)}
                      disabled={bidLoading}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {bidLoading ? 'Hiring...' : 'Hire This Freelancer'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GigDetail;
