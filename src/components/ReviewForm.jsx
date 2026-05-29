import { useState } from 'react';
import { useForm } from 'react-hook-form';
import client from '../api/client';

export default function ReviewForm({ onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (rating < 1) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await client.post('/api/reviews', {
        full_name: data.full_name,
        phone: data.phone,
        rating,
        comment: data.comment,
      });
      reset();
      setRating(0);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 6000);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to submit review. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-text-main mb-1">Share Your Experience</h3>
      <p className="text-text-muted text-sm mb-6">Tell us about your visit — your feedback helps others.</p>

      {submitted && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Thank you! Your review has been submitted.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Star rating */}
        <div>
          <label className="block text-sm font-medium text-text-main mb-2">Your Rating *</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="focus:outline-none"
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
              >
                <svg
                  className={`w-8 h-8 transition-colors ${(hover || rating) >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5">Full Name *</label>
            <input
              {...register('full_name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
              className="input-field text-sm"
              placeholder="Your name"
            />
            {errors.full_name && <p className="text-accent text-xs mt-1">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5">Phone *</label>
            <input
              {...register('phone', {
                required: 'Phone is required',
                pattern: { value: /^(\+92|0)[0-9]{10}$/, message: 'Enter valid Pakistani number' },
              })}
              className="input-field text-sm"
              placeholder="03XXXXXXXXX"
            />
            {errors.phone && <p className="text-accent text-xs mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1.5">Your Review</label>
          <textarea
            {...register('comment', { minLength: { value: 5, message: 'Min 5 characters' }, maxLength: { value: 1000, message: 'Max 1000 characters' } })}
            rows={4}
            className="input-field text-sm"
            placeholder="Tell us about your experience..."
          />
          {errors.comment && <p className="text-accent text-xs mt-1">{errors.comment.message}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-accent hover:bg-red-400 text-white font-semibold text-sm py-3 px-8 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
