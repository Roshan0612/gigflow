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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Available Gigs
        </h1>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gigs by title..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-xl text-gray-600">Loading gigs...</div>
        )}

        {/* Gigs Grid */}
        {!loading && gigs.length === 0 && (
          <div className="text-center text-xl text-gray-600">
            No open gigs found. Be the first to post one!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <Link
              key={gig._id}
              to={`/gig/${gig._id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {gig.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {gig.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-600">
                  ${gig.budget}
                </span>
                <span className="text-sm text-gray-500">
                  by {gig.ownerId?.name}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                  Open
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
