import React, { useState } from 'react';
import Spinner from '../common/Spinner';

// Placeholder component for artisan review management functionality
const ManageReview = () => {
  // Loading state for future API calls
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="artisan-manage-review-page">
      <h1>Manage Product Reviews</h1>
      {isLoading ? (
        <div className="text-center my-5">
          <Spinner />
        </div>
      ) : (
        <div className="review-table-placeholder">
          <p>Review management table will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default ManageReview;