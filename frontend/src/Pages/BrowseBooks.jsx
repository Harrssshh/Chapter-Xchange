import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import BookCard from "../components/BookCard";
import BookSkeleton, { BookCardSkeleton, BookListSkeleton } from "../components/BookSkeleton";
import { 
  Search, 
  SlidersHorizontal, 
  Grid, 
  List, 
  RotateCcw, 
  Sparkles, 
  BookMarked, 
  ArrowUpDown,
  BookOpen,
  X,
  Gift,
  User
} from "lucide-react";

const BrowseBooks = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'donation' | 'exchange'
  const [categoryFilter, setCategoryFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Sort & Layout states
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'price-low' | 'price-high' | 'title-az'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Categories list matching backend choices
  const categories = [
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Romance",
    "Thriller",
    "Science Fiction",
    "Fantasy",
    "Manga",
    "Comic",
    "Biography",
    "History",
    "Self-Help",
    "Poetry",
    "Business & Finance",
    "Children",
    "Cooking",
    "Travel",
    "Other"
  ];

  const conditions = [
    { label: "New", value: "new" },
    { label: "Like New", value: "like-new" },
    { label: "Very Good", value: "very-good" },
    { label: "Good", value: "good" },
    { label: "Acceptable", value: "acceptable" },
    { label: "Poor", value: "poor" }
  ];

  const fetchBooks = async () => {
    try {
      setLoading(true);
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

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setCategoryFilter("");
    setConditionFilter("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

  // Active filter count logic
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (typeFilter !== "all") count++;
    if (categoryFilter) count++;
    if (conditionFilter) count++;
    if (minPrice || maxPrice) count++;
    return count;
  };

  // Multi-criteria client-side filter
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const isDonation = book.isWillingToDonate || book.price === 0;
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "donation" && isDonation) ||
      (typeFilter === "exchange" && !isDonation);

    const matchesCategory =
      categoryFilter === "" ||
      book.category?.toLowerCase() === categoryFilter.toLowerCase();

    // Normalizing and checking condition
    const normBookCond = book.condition?.toLowerCase().replace(/\s+/g, "-") || "";
    const matchesCondition =
      conditionFilter === "" ||
      normBookCond === conditionFilter;

    // Price filters (Donations are treated as 0 price)
    const bookPrice = isDonation ? 0 : book.price || 0;
    const matchesMinPrice = minPrice === "" || bookPrice >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === "" || bookPrice <= parseFloat(maxPrice);

    return (
      matchesSearch &&
      matchesType &&
      matchesCategory &&
      matchesCondition &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  // Client-side sorting
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    // Put sold out books at the end
    const aAvailable = a.isAvailable !== false;
    const bAvailable = b.isAvailable !== false;
    if (aAvailable && !bAvailable) return -1;
    if (!aAvailable && bAvailable) return 1;

    if (sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === "price-low") {
      const pA = a.isWillingToDonate || a.price === 0 ? 0 : a.price || 0;
      const pB = b.isWillingToDonate || b.price === 0 ? 0 : b.price || 0;
      return pA - pB;
    }
    if (sortBy === "price-high") {
      const pA = a.isWillingToDonate || a.price === 0 ? 0 : a.price || 0;
      const pB = b.isWillingToDonate || b.price === 0 ? 0 : b.price || 0;
      return pB - pA;
    }
    if (sortBy === "title-az") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Filter content subcomponent for reusability (desktop sidebar & mobile drawer)
  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search Input Filter */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Search</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Title, author, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all focus:bg-white"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Listing Type Filter */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Listing Type</h3>
        <div className="grid grid-cols-3 gap-2">
          {["all", "exchange", "donation"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center capitalize ${
                typeFilter === type
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {type === "all" ? "All" : type === "donation" ? "Free" : "Exchange"}
            </button>
          ))}
        </div>
      </div>

      {/* Category Accordion */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Category</h3>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-3.5 text-sm transition-all"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Condition Pills */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Book Condition</h3>
        <div className="flex flex-wrap gap-2">
          {conditions.map((cond) => (
            <button
              key={cond.value}
              onClick={() => setConditionFilter(conditionFilter === cond.value ? "" : cond.value)}
              className={`py-1.5 px-3 text-xs font-medium rounded-lg border transition-all ${
                conditionFilter === cond.value
                  ? "bg-blue-50 border-blue-200 text-blue-700 font-semibold"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cond.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      {typeFilter !== "donation" && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Price Range (₹)</h3>
          
          {/* Quick Price Buckets */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {[
              { label: "Under ₹200", min: "", max: "200" },
              { label: "₹200 - ₹500", min: "200", max: "500" },
              { label: "Over ₹500", min: "500", max: "" }
            ].map((bucket) => {
              const isSelected = minPrice === bucket.min && maxPrice === bucket.max;
              return (
                <button
                  key={bucket.label}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setMinPrice("");
                      setMaxPrice("");
                    } else {
                      setMinPrice(bucket.min);
                      setMaxPrice(bucket.max);
                    }
                  }}
                  className={`py-1.5 px-2.5 text-[10px] font-bold rounded-lg border transition-all ${
                    isSelected
                      ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {bucket.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-sm transition-all text-center"
            />
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-sm transition-all text-center"
            />
          </div>
        </div>
      )}

      {/* Reset Filter Button */}
      {getActiveFilterCount() > 0 && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl text-xs tracking-wider uppercase transition-colors"
        >
          <RotateCcw className="h-4 w-4" /> Clear Filters ({getActiveFilterCount()})
        </button>
      )}
    </div>
  );

  return (
    <Layout>
      {/* 1. Header & Hero search banner */}
      <div className="relative overflow-hidden bg-slate-900 text-white rounded-3xl py-12 px-6 sm:px-12 mb-10 shadow-xl border border-slate-800">
        {/* Dynamic visual gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1e3a8a,transparent_60%)] opacity-40"></div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl"></div>

        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/25 rounded-full text-xs font-semibold tracking-wide text-blue-400">
            <Sparkles className="h-3 w-3" /> Explore Community Shelf
          </div>
          <h1 className="text-4xl font-extrabold sm:text-5xl tracking-tight leading-tight">
            Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">Literary Journey</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl">
            Browse through hundreds of titles curated by fellow readers. Borrow, trade, buy, or claim free donation items.
          </p>

          {/* Quick search input */}
          <div className="pt-4 max-w-lg space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Title, Author, or Keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 rounded-2xl py-3.5 pl-12 pr-4 text-sm shadow-lg border border-slate-700/50"
              />
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
            
            {/* Quick search recommendation tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-300 font-medium">Try:</span>
              <button 
                type="button"
                onClick={() => { setSearchTerm(""); setTypeFilter("donation"); }} 
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-slate-200 transition font-medium flex items-center gap-1"
              >
                <Gift className="h-3.5 w-3.5 text-emerald-400" /> Free Books
              </button>
              <button 
                type="button"
                onClick={() => { setSearchTerm("Harry Potter"); }} 
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-slate-200 transition font-medium flex items-center gap-1"
              >
                <Sparkles className="h-3.5 w-3.5 text-yellow-400" /> Harry Potter
              </button>
              <button 
                type="button"
                onClick={() => { setCategoryFilter("Fiction"); }} 
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-slate-200 transition font-medium flex items-center gap-1"
              >
                <BookOpen className="h-3.5 w-3.5 text-sky-400" /> Fiction
              </button>
              <button 
                type="button"
                onClick={() => { setCategoryFilter("Biography"); }} 
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-slate-200 transition font-medium flex items-center gap-1"
              >
                <User className="h-3.5 w-3.5 text-purple-400" /> Biographies
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* 2. Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-72 flex-shrink-0 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm sticky top-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2 font-bold text-gray-800">
                <SlidersHorizontal className="h-4.5 w-4.5" /> Filters
              </div>
              {getActiveFilterCount() > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            <FilterPanel />
          </aside>

          {/* 3. Catalog content area */}
          <main className="flex-grow w-full">
            
            {/* Scrollable Categories Tag Bar */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setCategoryFilter("")}
                className={`flex-shrink-0 px-4 py-2 text-xs font-bold rounded-full border transition-all ${
                  categoryFilter === ""
                    ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-650 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`flex-shrink-0 px-4 py-2 text-xs font-bold rounded-full border transition-all ${
                    categoryFilter === cat
                      ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-650 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Active Filters list */}
            {getActiveFilterCount() > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mr-1">Active Filters:</span>
                
                {searchTerm && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-100 rounded-full text-xs font-bold text-blue-600 shadow-sm">
                    Search: "{searchTerm}"
                    <button type="button" onClick={() => setSearchTerm("")} className="hover:text-blue-800 text-[10px]">✕</button>
                  </span>
                )}

                {typeFilter !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-purple-100 rounded-full text-xs font-bold text-purple-600 shadow-sm">
                    Type: {typeFilter === "donation" ? "Free" : "Exchange"}
                    <button type="button" onClick={() => setTypeFilter("all")} className="hover:text-purple-800 text-[10px]">✕</button>
                  </span>
                )}

                {categoryFilter && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-100 rounded-full text-xs font-bold text-emerald-600 shadow-sm">
                    Category: {categoryFilter}
                    <button type="button" onClick={() => setCategoryFilter("")} className="hover:text-emerald-800 text-[10px]">✕</button>
                  </span>
                )}

                {conditionFilter && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-orange-100 rounded-full text-xs font-bold text-orange-600 shadow-sm">
                    Condition: {conditions.find(c => c.value === conditionFilter)?.label || conditionFilter}
                    <button type="button" onClick={() => setConditionFilter("")} className="hover:text-orange-800 text-[10px]">✕</button>
                  </span>
                )}

                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-100 rounded-full text-xs font-bold text-amber-600 shadow-sm">
                    Price: {minPrice ? `₹${minPrice}` : "0"} - {maxPrice ? `₹${maxPrice}` : "Any"}
                    <button type="button" onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="hover:text-amber-800 text-[10px]">✕</button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-red-600 hover:text-red-700 font-extrabold underline ml-2 transition"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Catalog Toolbar Controls */}
            <div className="bg-white border border-gray-100 px-5 py-3 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left: Result count */}
              <div className="text-gray-500 text-sm font-medium">
                {loading ? (
                  <span>Loading catalog...</span>
                ) : (
                  <span>
                    Showing <strong className="text-gray-800">{sortedBooks.length}</strong> of{" "}
                    <strong className="text-gray-800">{books.length}</strong> books
                  </span>
                )}
              </div>

              {/* Right: Actions (Sort, Mobile Filter toggle, Layout Switcher) */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Mobile filter button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 py-2 px-3 border border-gray-200 hover:border-slate-800 rounded-xl text-xs font-semibold text-gray-700 hover:text-slate-800 transition bg-white"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-200 hover:border-gray-300 focus:border-blue-500 rounded-xl py-2 pl-3 pr-8 text-xs font-medium bg-white text-gray-700 transition"
                  >
                    <option value="newest">Newest Listed</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="title-az">Title: A-Z</option>
                  </select>
                </div>

                {/* Grid vs List Toggles */}
                <div className="hidden sm:flex items-center gap-1 border border-gray-200 p-1 rounded-xl bg-gray-50">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    title="Grid View"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === "list"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    title="List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Catalog Grid/List Container */}
            {loading ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <BookCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <BookListSkeleton key={i} />
                  ))}
                </div>
              )
            ) : sortedBooks.length === 0 ? (
              
              /* Breathtaking Empty State */
              <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm max-w-xl mx-auto my-12 space-y-5">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full text-blue-600 mb-2">
                  <BookMarked className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No books found</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
                  We couldn't find any books matching your current filters. Try refining your keyword, adjusting the price, or resetting filters.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md"
                  >
                    <RotateCcw className="h-4 w-4" /> Reset Filters
                  </button>
                  <Link
                    to="/add-book"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors"
                  >
                    Add a New Book
                  </Link>
                </div>
              </div>

            ) : (
              
              /* Actual Catalog Listings */
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    : "space-y-4"
                }
              >
                {sortedBooks.map((book) => {
                  if (viewMode === "grid") {
                    return <BookCard key={book._id || book.id} book={book} />;
                  } else {
                    
                    // Horizontal premium list item layout
                    const isDon = book.isWillingToDonate || book.price === 0;
                    return (
                      <div
                        key={book._id || book.id}
                        className="group flex flex-col sm:flex-row bg-white border border-gray-100 hover:border-blue-100 rounded-2xl shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300 cursor-pointer"
                        onClick={() => navigate(`/books/${book._id || book.id}`)}
                      >
                        <div className="relative w-full sm:w-48 aspect-[3/4] sm:aspect-[4/5] bg-gray-50 flex-shrink-0">
                          <img
                            src={
                              book.image
                                ? book.image.startsWith("/uploads")
                                  ? `${import.meta.env.VITE_API_URL}${book.image}`
                                  : book.image
                                : "/default-book.jpg"
                            }
                            alt={book.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {book.isAvailable === false && (
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all duration-300">
                              <span className="bg-red-600 text-white text-[11px] font-black tracking-widest px-4 py-2 rounded-xl border border-red-500 shadow-lg uppercase">
                                SOLD
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex flex-col justify-between flex-grow">
                          <div>
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <div>
                                <h3 className="font-extrabold text-lg text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                                  {book.title}
                                </h3>
                                <p className="text-gray-500 text-sm font-medium">by {book.author}</p>
                              </div>
                              {isDon ? (
                                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
                                  FREE
                                </span>
                              ) : (
                                <span className="bg-blue-50 text-blue-700 text-sm font-extrabold px-3 py-1 rounded-full border border-blue-200">
                                  ₹{book.price}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs line-clamp-2 mt-2 leading-relaxed">
                              {book.description || "No description provided."}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-50">
                            <div className="flex gap-2">
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 font-bold rounded-lg text-[10px] tracking-wide uppercase">
                                {book.category}
                              </span>
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-[10px] tracking-wide uppercase">
                                {book.condition}
                              </span>
                            </div>
                            {book.isAvailable === false ? (
                              <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                                SOLD / OUT OF STOCK
                              </span>
                            ) : (
                              <Link
                                to={`/books/${book._id || book.id}`}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                              >
                                Learn More &rarr;
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 4. Mobile Sliding Filter Drawer overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" aria-modal="true" role="dialog">
          {/* Backdrop blur overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          ></div>

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md transform transition bg-white shadow-2xl flex flex-col">
              {/* Header drawer */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" /> Filter Catalog
                </h2>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Drawer Filter Panel Scroll */}
              <div className="flex-1 py-6 px-6 overflow-y-auto">
                <FilterPanel />
              </div>

              {/* Drawer Apply footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-grow py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md text-center"
                >
                  Apply Filters
                </button>
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={() => {
                      clearFilters();
                      setIsMobileFilterOpen(false);
                    }}
                    className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs uppercase transition-colors"
                    title="Clear All"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BrowseBooks;
