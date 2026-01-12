import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchGigs, clearError } from '../store/gigSlice';
import toast from 'react-hot-toast';

const GigFeed = () => {
  const [search, setSearch] = useState('');
  const dispatch = useDispatch();
  const { gigs, loading, error } = useSelector((state) => state.gigs);

  useEffect(() => {
    dispatch(fetchGigs(''));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchGigs(search));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Find Your Perfect Project
            </h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Browse thousands of open gigs and start earning today
            </p>
          </div>

          {/* Search */}
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, skills, or keywords..."
                className="flex-1 px-6 py-4 border-0 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200 shadow-lg"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Gigs Section */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Open Projects
            </h2>
            <p className="text-slate-600 mt-1">
              {gigs.length} {gigs.length === 1 ? 'opportunity' : 'opportunities'} available
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
            <p className="text-slate-600 text-lg">Loading projects...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && gigs.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No projects found</h3>
            <p className="text-slate-600">
              Try adjusting your search or be the first to post a project!
            </p>
          </div>
        )}

        {/* Gigs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <Link
              key={gig._id}
              to={`/gig/${gig._id}`}
              className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                    Open
                  </span>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs">Just posted</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {gig.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {gig.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Budget</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      ₹{gig.budget.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Client</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {gig.ownerId?.name?.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        {gig.ownerId?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover CTA */}
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 group-hover:bg-indigo-50 transition-colors">
                <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 flex items-center">
                  View Details & Bid
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GigFeed;
