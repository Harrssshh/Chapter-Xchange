import React from "react";

const BookSkeleton = () => {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow p-4">
      
      <div className="bg-gray-300 h-48 w-full rounded-md mb-4"></div>

      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>

      <div className="h-4 bg-gray-300 rounded w-1/2"></div>

    </div>
  );
};

export default BookSkeleton;