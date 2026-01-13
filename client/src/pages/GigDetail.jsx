import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGigById, clearCurrentGig } from '../store/gigSlice';
import { createBid, fetchBidsForGig, hireBid, clearBids, clearError } from '../store/bidSlice';
import { getSocket } from '../utils/socket';
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
  // Normalize owner id/name to guard against unpopulated ownerId (string vs populated object)
  const ownerIdNormalized = currentGig?.ownerId?._id ?? currentGig?.ownerId;
  const ownerName = currentGig?.ownerId?.name ?? (typeof currentGig?.ownerId === 'string' ? currentGig.ownerId : '');

  const isOwner = Boolean(currentGig && user && ownerIdNormalized && String(ownerIdNormalized) === String(user._id));
  const canBid = Boolean(currentGig && user && ownerIdNormalized && String(ownerIdNormalized) !== String(user._id) && currentGig.status === 'open');

  useEffect(() => {
    dispatch(fetchGigById(id));
    
    return () => {
      dispatch(clearCurrentGig());
      dispatch(clearBids());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (currentGig && user && String(ownerIdNormalized) === String(user._id)) {
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

  // Real-time socket listener for new bids
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !currentGig || !isOwner) return;

    const handleNewBid = (data) => {
      console.log('New bid received in real-time:', data);
      // Refresh bids list when new bid comes in
      if (String(data.gigId) === String(currentGig._id)) {
        dispatch(fetchBidsForGig(id));
      }
    };

    socket.on('new_bid', handleNewBid);

    return () => {
      socket.off('new_bid', handleNewBid);
    };
  }, [currentGig, isOwner, id, dispatch]);

  // Real-time socket listener for gig updates (when someone gets hired)
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !currentGig) return;

    const handleGigUpdate = () => {
      console.log('Gig status updated, refreshing...');
      // Refresh gig details
      dispatch(fetchGigById(id));
      if (isOwner) {
        dispatch(fetchBidsForGig(id));
      }
    };

    socket.on('gig_updated', handleGigUpdate);

    return () => {
      socket.off('gig_updated', handleGigUpdate);
    };
  }, [currentGig, isOwner, id, dispatch]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
        <p className="text-slate-600 text-lg">Loading project details...</p>
      </div>
    );
  }

  if (!currentGig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Project Not Found</h2>
        <p className="text-slate-600 mb-6">The project you're looking for doesn't exist</p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 py-6 sm:py-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="mb-4 sm:mb-6 flex items-center space-x-2 text-slate-600 hover:text-indigo-600 transition-colors font-medium text-sm sm:text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Projects</span>
        </button>

        {/* Gig Details */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                {currentGig.title}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {ownerName ? ownerName.charAt(0).toUpperCase() : ''}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Posted by</p>
                    <p className="font-semibold text-slate-700">
                      {ownerName || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
              currentGig.status === 'open' 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-slate-100 text-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                currentGig.status === 'open' ? 'bg-emerald-500' : 'bg-slate-500'
              }`}></span>
              {currentGig.status === 'open' ? 'Open for Bids' : 'Assigned'}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Project Description</h2>
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
              {currentGig.description}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Project Budget</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ₹{currentGig.budget ? Number(currentGig.budget).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bid Form for Non-owners */}
        {canBid && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Submit Your Proposal
                </h2>
                <p className="text-slate-600">Show the client why you're the best fit</p>
              </div>
            </div>

            {!showBidForm ? (
              <button
                onClick={() => setShowBidForm(true)}
                className="btn-primary px-8 py-3 text-base font-semibold"
              >
                Place a Bid
              </button>
            ) : (
              <form onSubmit={handleBidSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Proposal
                  </label>
                  <textarea
                    value={bidForm.message}
                    onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                    rows="5"
                    className="input-base resize-none"
                    placeholder="Explain your approach, relevant experience, and why you're the perfect match for this project..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Bid Amount (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={bidForm.price}
                      onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                      className="input-base"
                      placeholder="0.00"
                      min="1"
                    />
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Project budget: ₹{currentGig.budget ? Number(currentGig.budget).toLocaleString() : '0'}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={bidLoading}
                    className="flex-1 btn-primary py-3 text-base font-semibold"
                  >
                    {bidLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : 'Submit Proposal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBidForm(false);
                      setBidForm({ message: '', price: '' });
                    }}
                    className="flex-1 btn-secondary py-3 text-base font-semibold"
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
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 flex items-start space-x-3">
            <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Project Assigned</h3>
              <p className="text-amber-800">
                This project has already been assigned to a freelancer and is no longer accepting bids.
              </p>
            </div>
          </div>
        )}

        {/* Bids List for Owner */}
        {isOwner && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Proposals Received
                  </h2>
                  <p className="text-slate-600">{(bids || []).length} freelancer{(bids || []).length !== 1 ? 's' : ''} interested</p>
                </div>
              </div>
            </div>

            {bidLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
                <p className="text-slate-600">Loading proposals...</p>
              </div>
            )}

            {!bidLoading && (bids || []).length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No proposals yet</h3>
                <p className="text-slate-600">
                  Freelancers will see your project and submit their proposals soon.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {(bids || []).map((bid) => (
                <div
                  key={bid._id}
                  className={`border-2 rounded-xl p-6 transition-all ${
                    bid.status === 'hired' 
                      ? 'border-emerald-300 bg-emerald-50' 
                      : bid.status === 'rejected'
                      ? 'border-slate-200 bg-slate-50 opacity-60'
                      : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {((bid.freelancerId && bid.freelancerId.name) ? bid.freelancerId.name.charAt(0).toUpperCase() : (typeof bid.freelancerId === 'string' ? bid.freelancerId.charAt(0).toUpperCase() : ''))}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900">
                          {bid.freelancerId?.name ?? (typeof bid.freelancerId === 'string' ? bid.freelancerId : 'Unknown')}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {bid.freelancerId?.email ?? ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-start sm:items-end gap-3">
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-slate-500 mb-1">Bid Amount</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          ₹{bid.price.toLocaleString()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        bid.status === 'hired' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : bid.status === 'rejected'
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {bid.status === 'hired' && '✓ '}
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Proposal</h4>
                    <p className="text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-lg p-4 border border-slate-100">
                      {bid.message}
                    </p>
                  </div>

                  {bid.status === 'pending' && currentGig.status === 'open' && (
                    <button
                      onClick={() => handleHire(bid._id)}
                      disabled={bidLoading}
                      className="btn-primary px-6 py-2.5 font-semibold w-full sm:w-auto"
                    >
                      {bidLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Hiring...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Hire This Freelancer
                        </span>
                      )}
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
