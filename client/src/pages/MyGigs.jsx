import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchGigs, clearError } from '../store/gigSlice';
import toast from 'react-hot-toast';

const MyGigs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { gigs, loading, error } = useSelector((state) => state.gigs);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch all gigs
    dispatch(fetchGigs(''));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Filter gigs to show only those posted by current user
  const myGigs = gigs.filter((gig) => gig.ownerId._id === user?._id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 py-6 sm:py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-1 sm:mb-2">
                My Gigs
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                Manage all your posted projects
              </p>
            </div>
            <Link
              to="/post-gig"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Post New Gig</span>
            </Link>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
            <p className="text-slate-600 text-lg">Loading your gigs...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && myGigs.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No gigs posted yet</h3>
            <p className="text-slate-600 mb-6">
              Start by posting your first gig to connect with freelancers
            </p>
            <Link
              to="/post-gig"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200"
            >
              Post Your First Gig
            </Link>
          </div>
        )}

        {/* Gigs Grid */}
        {!loading && myGigs.length > 0 && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Open Gigs</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {myGigs.filter((g) => g.status === 'open').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Assigned</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {myGigs.filter((g) => g.status === 'assigned').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Budget</p>
                    <p className="text-3xl font-bold text-slate-900">
                      ₹{myGigs.reduce((sum, g) => sum + (g.budget || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gigs List */}
            <div className="space-y-3 sm:space-y-4">
              {myGigs.map((gig) => (
                <Link
                  key={gig._id}
                  to={`/gig/${gig._id}`}
                  className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md hover:border-indigo-200 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {gig.title}
                        </h3>
                        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          gig.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${gig.status === 'open' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                          {gig.status === 'open' ? 'Open' : 'Assigned'}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm line-clamp-2 mb-3">{gig.description}</p>
                      <div className="flex items-center space-x-6 text-sm">
                        <div>
                          <p className="text-slate-500">Budget</p>
                          <p className="font-bold text-slate-900">₹{(gig.budget || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Posted</p>
                          <p className="font-bold text-slate-900">
                            {new Date(gig.createdAt).toLocaleDateString('en-IN', { day: 'short', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center ml-4">
                      <p className="hidden sm:block text-xs text-slate-500 mb-2">View Details</p>
                      <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGigs;
