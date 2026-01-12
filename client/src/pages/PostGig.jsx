import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createGig, clearError } from '../store/gigSlice';
import toast from 'react-hot-toast';

const PostGig = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.gigs);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.budget) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.budget <= 0) {
      toast.error('Budget must be greater than 0');
      return;
    }

    try {
      await dispatch(createGig({
        title: formData.title,
        description: formData.description,
        budget: Number(formData.budget)
      })).unwrap();
      
      toast.success('Gig posted successfully!');
      navigate('/');
    } catch (error) {
      // Error is handled by useEffect
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 py-12 px-6 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Post a New Project
          </h2>
          <p className="text-slate-600">
            Share your project details and connect with talented freelancers
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Project Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-base"
                placeholder="e.g., Build a responsive landing page with React"
              />
              <p className="text-sm text-slate-500 mt-2">Be specific and descriptive to attract the right freelancers</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Project Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="8"
                className="input-base resize-none"
                placeholder="Describe your project in detail:
• What needs to be built or accomplished?
• What are the main requirements?
• Are there any specific technologies or tools required?
• What is the expected timeline?
• Any other relevant details..."
              />
              <p className="text-sm text-slate-500 mt-2">
                Tip: Provide clear requirements and expectations to receive better proposals
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Project Budget ($)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-lg">$</span>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="input-base pl-10 text-lg"
                  placeholder="0.00"
                  min="1"
                />
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Set a competitive budget to attract top freelancers
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary py-3 text-base font-semibold"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Post Project
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 btn-secondary py-3 text-base font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-indigo-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>• Your project will be visible to all freelancers on the platform</li>
                <li>• Freelancers will submit proposals with their approach and pricing</li>
                <li>• You can review proposals and hire the best fit for your project</li>
                <li>• You'll be notified via real-time notifications when freelancers submit bids</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostGig;
