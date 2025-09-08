import React from "react";
import { Search } from "lucide-react";
const SearchFilters = ({
  searchTerm,
  categoryFilter,
  conditionFilter,
  donationFilter,
  onSearchChange,
  onCategoryChange,
  onConditionChange,
  onDonationChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Bar */}
        <div className="lg:col-span-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title or author"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all-categories">All Categories</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-Fiction</option>
            <option value="science fiction">Science Fiction</option>
            <option value="fantasy">Fantasy</option>
            <option value="mystery">Mystery</option>
            <option value="biography">Biography</option>
            <option value="history">History</option>
          </select>
        </div>

        {/* Condition Filter */}
        <div>
          <select
            value={conditionFilter}
            onChange={(e) => onConditionChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all-conditions">All Conditions</option>
            <option value="new">New</option>
            <option value="like-new">Like New</option>
            <option value="very-good">Very Good</option>
            <option value="good">Good</option>
            <option value="acceptable">Acceptable</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        {/* Donation/Exchange Filter */}
        <div>
          <select
            value={donationFilter}
            onChange={(e) => onDonationChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all-books">All Books</option>
            <option value="donation">For Donation</option>
            <option value="exchange">For Exchange</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
