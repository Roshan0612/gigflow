import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyBids, clearError } from '../store/bidSlice';
import toast from 'react-hot-toast';

const MyBids = () => {
  const dispatch = useDispatch();
  const { myBids, loading, error } = useSelector((state) => state.bids);

  useEffect(() => {
    dispatch(fetchMyBids());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 py-6 sm:py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[1000px] mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900">My Bids</h1>
            <p className="text-sm text-slate-600">Proposals you've submitted</p>
          </div>
          <Link to="/" className="text-indigo-600 font-medium">Browse gigs</Link>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
            <p className="text-slate-600">Loading your bids...</p>
          </div>
        )}

        {!loading && (!myBids || myBids.length === 0) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No bids yet</h3>
            <p className="text-slate-600 mb-6">You haven't submitted any proposals yet.</p>
            <Link to="/" className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg">Browse Gigs</Link>
          </div>
        )}

        {!loading && myBids && myBids.length > 0 && (
          <div className="space-y-4">
            {myBids.map((b) => (
              <div key={b._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link to={`/gig/${b.gigId?._id ?? b.gigId}`} className="text-lg font-bold text-slate-900 hover:text-indigo-600">{b.gigId?.title ?? 'Project'}</Link>
                    <p className="text-sm text-slate-600 mt-2">{b.message}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                      <div>Bid: <span className="font-semibold text-slate-900">₹{Number(b.price).toLocaleString()}</span></div>
                      <div>Submitted: <span className="text-slate-700">{b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      b.status === 'hired' ? 'bg-emerald-100 text-emerald-700' : b.status === 'rejected' ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBids;
