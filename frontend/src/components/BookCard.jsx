import React from "react";
import { useNavigate } from "react-router-dom";

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/books/${book._id || book.id}`); // ✅ navigate to Book Detail
  };

  return (
    <div
      className="bg-white rounded-xl border shadow hover:shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
      onClick={handleViewDetails} // ✅ make entire card clickable
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={
            book.image
              ? book.image.startsWith("/uploads")
                ? `${import.meta.env.VITE_API_URL}{book.image}`
                : book.image
              : "/default-book.jpg"
          }
          alt={book.title}
          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
        />

        {/* Badge */}
        {book.isForDonation ? (
          <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
            Free / Donation
          </span>
        ) : (
          <span className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
            For Exchange
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{book.title}</h3>
        <p className="text-gray-600 text-sm mb-2">{book.author}</p>

        <div className="flex justify-between text-xs text-gray-500 mb-3">
          <span>{book.category}</span>
          <span>{book.condition}</span>
        </div>

        {/* View Details Button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent triggering parent card click
            handleViewDetails();
          }}
          className="w-full border rounded-lg py-2 text-sm font-medium hover:bg-gray-100 transition"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default BookCard;
