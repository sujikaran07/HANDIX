import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// Reusable pagination component with ellipsis for large page counts
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generate page numbers with smart ellipsis handling
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbersToShow = 7;

    // Show all pages if total is within display limit
    if (totalPages <= maxPageNumbersToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Calculate visible page range around current page
      let startPage = Math.max(1, currentPage - 3);
      let endPage = Math.min(totalPages, currentPage + 3);

      // Adjust range for pages near beginning or end
      if (currentPage <= 4) {
        endPage = maxPageNumbersToShow - 2;
      } else if (currentPage + 3 >= totalPages) {
        startPage = totalPages - maxPageNumbersToShow + 3;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis and first/last page when needed
      if (startPage > 2) {
        pageNumbers.unshift('...');
        pageNumbers.unshift(1);
      } else if (startPage === 2) {
        pageNumbers.unshift(1);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (endPage === totalPages - 1) {
        pageNumbers.push(totalPages);
      }
    }

    // Render page number buttons
    return pageNumbers.map((number, index) => (
      <li key={index} className={`page-item ${currentPage === number ? 'active' : ''}`}>
        <button
          className="page-link"
          onClick={() => number !== '...' && onPageChange(number)}
          disabled={number === '...'}
        >
          {number}
        </button>
      </li>
    ));
  };

  return (
    <nav>
      <ul className="pagination justify-content-center">
        {/* Previous button */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>Previous</button>
        </li>
        {renderPageNumbers()}
        {/* Next button */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>Next</button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
