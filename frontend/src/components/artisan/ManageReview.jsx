import React, { useState } from 'react';
import Spinner from '../common/Spinner';

const ManageReview = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="artisan-manage-review-page">
      <h1>Manage Product Reviews</h1>
      {/* TODO: Add review table and fetch logic here */}
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