import React, { useState, useEffect } from "react";
import BookSkeleton from "../components/BookSkeleton";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import BookCard from "../components/BookCard";

const BrowseBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [donationFilter, setDonationFilter] = useState("");

  const fetchBooks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/books`);
      const data = await res.json();

      if (res.ok) {
        setBooks(data.books || []);
      } else {
        console.error("Failed to fetch books:", data.message);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      searchTerm === "" ||
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "" ||
      categoryFilter === "all-categories" ||
      book.category.toLowerCase() === categoryFilter.toLowerCase();

    const matchesCondition =
      conditionFilter === "" ||
      conditionFilter === "all-conditions" ||
      book.condition.toLowerCase().replace(/\s+/g, "-") === conditionFilter;

    const matchesDonation =
      donationFilter === "" ||
      donationFilter === "all-books" ||
      (donationFilter === "donation" && book.isForDonation) ||
      (donationFilter === "exchange" && !book.isForDonation);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesCondition &&
      matchesDonation
    );
  });

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setConditionFilter("");
    setDonationFilter("");
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">

        <h1 className="text-3xl font-bold mb-6">Browse Books</h1>

        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
           {[...Array(6)].map((_, i) => (
           <BookSkeleton key={i} />
           ))}
           </div>
          ) : (
          <>
            {filteredBooks.length === 0 && (
              <div className="text-center text-gray-500 mb-4">
                No books found.
                <button
                  onClick={clearFilters}
                  className="text-blue-600 underline ml-2"
                >
                  Clear filters
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <Link
                  key={book._id}
                  to={`/books/${book._id}`}
                >
                  <BookCard book={book} />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default BrowseBooks;
