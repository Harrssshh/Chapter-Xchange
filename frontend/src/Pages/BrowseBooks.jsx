import React from "react";
import { useState , useEffect} from "react";
import Layout from "../components/Layout";
import axios from "axios";
import AddBook from "./AddBook";
import BookCard from "../components/BookCard";


// Mock data for books
const mockBooks = [
  {
    _id: "1",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    category: "Fiction",
    condition: "Good",
    owner: "Alice Johnson",
    isForDonation: true,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=400"
  },
  {
    _id: "2",
    title: "1984",
    author: "George Orwell",
    category: "Science Fiction",
    condition: "Very Good",
    owner: "Bob Smith",
    isForDonation: false,
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=300&h=400"
  },
  {
    _id: "3",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Fiction",
    condition: "Like New",
    owner: "Charlie Brown",
    isForDonation: false,
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300&h=400"
  },
  {
    _id: "4",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    category: "Non-Fiction",
    condition: "New",
    owner: "Diana Prince",
    isForDonation: true,
    image: "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=300&h=400"
  },
  {
    _id: "5",
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    category: "Fantasy",
    condition: "Good",
    owner: "Ethan Hunt",
    isForDonation: false,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300&h=400"
  },
  {
    _id: "6",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    category: "Fantasy",
    condition: "Acceptable",
    owner: "Frodo Baggins",
    isForDonation: true,
    image: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?auto=format&fit=crop&q=80&w=300&h=400"
  }
];

// Plain SearchFilters component
const SearchFilters = ({ searchTerm, categoryFilter, conditionFilter, donationFilter, onSearchChange, onCategoryChange, onConditionChange, onDonationChange }) => (
  <div className="mb-6 space-y-4">
    <input
      type="text"
      placeholder="Search by title or author"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <select value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)} className="border rounded-md p-2">
        <option value="all-categories">All Categories</option>
        <option value="fiction">Fiction</option>
        <option value="non-fiction">Non-Fiction</option>
        <option value="mystery">Mystery</option>
        <option value="science-fiction">Science Fiction</option>
        <option value="fantasy">Fantasy</option>
        <option value="biography">Biography</option>
        <option value="history">History</option>
        <option value="self-help">Self-Help</option>
        <option value="children">Children's</option>
        <option value="cooking">Cooking</option>
        <option value="travel">Travel</option>
        <option value="other">Other</option>
      </select>
      <select value={conditionFilter} onChange={(e) => onConditionChange(e.target.value)} className="border rounded-md p-2">
        <option value="all-conditions">All Conditions</option>
        <option value="new">New</option>
        <option value="like-new">Like New</option>
        <option value="very-good">Very Good</option>
        <option value="good">Good</option>
        <option value="acceptable">Acceptable</option>
        <option value="poor">Poor</option>
      </select>
      <select value={donationFilter} onChange={(e) => onDonationChange(e.target.value)} className="border rounded-md p-2">
        <option value="all-books">All Books</option>
        <option value="donation">Donation</option>
        <option value="exchange">Exchange</option>
      </select>
    </div>
  </div>
);

// Plain BookGrid component
const BookGrid = ({ books, onClearFilters }) => (
  <div>
    {books.length === 0 && (
      <div className="text-center text-gray-500 mb-4">
        No books found.{" "}
        <button
          onClick={onClearFilters}
          className="text-blue-600 underline"
        >
          Clear filters
        </button>
      </div>
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {books.map((book) => (
        <Link
          to={`/books/${book._id || book.id}`} // ✅ navigate to BookDetails
          key={book._id || book.id}
          className="block"
        >
          <BookCard book={book} />
        </Link>
      ))}
    </div>
  </div>
);

const BrowseBooks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [donationFilter, setDonationFilter] = useState("");
  const [fetchedBooks, setFetchedBooks] = useState([]);

 
    const fetchBooks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/books`);
      const data = await res.json();
      if (res.ok) {
        setFetchedBooks(data.books || []);
      } else {
        console.error("Failed to fetch books:", data.message);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };
    useEffect(() => {
      fetchBooks();
  }, []);
   const handleBookAdded = () => {
    setReload(prev => !prev); // trigger refetch
  };
  const allBooks = [...mockBooks, ...fetchedBooks];

  const filteredBooks = allBooks.filter(book => {
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
      book.condition.toLowerCase().replace(/\s+/g, '-') === conditionFilter.toLowerCase();

    const matchesDonation =
      donationFilter === "" ||
      donationFilter === "all-books" ||
      (donationFilter === "donation" && book.isForDonation) ||
      (donationFilter === "exchange" && !book.isForDonation);

    return matchesSearch && matchesCategory && matchesCondition && matchesDonation;
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
        <SearchFilters
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          conditionFilter={conditionFilter}
          donationFilter={donationFilter}
          onSearchChange={setSearchTerm}
          onCategoryChange={setCategoryFilter}
          onConditionChange={setConditionFilter}
          onDonationChange={setDonationFilter}
        />
        <BookGrid
          books={filteredBooks}
          onClearFilters={clearFilters}
        />
      </div>
    </Layout>
  );
};

export default BrowseBooks;
 