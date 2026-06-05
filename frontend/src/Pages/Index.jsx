import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import BookCard from "../components/BookCard";
import BookSkeleton, { BookCardSkeleton } from "../components/BookSkeleton";
import { 
  BookOpen, 
  BookPlus, 
  Users, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  HeartHandshake 
} from "lucide-react";

const Index = () => {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/books`);
        const data = await res.json();
        if (res.ok) {
          // Fetch latest 3 available books for featured showcase
          const availableOnly = (data.books || []).filter(book => book.isAvailable !== false);
          setFeaturedBooks(availableOnly.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching featured books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedBooks();
  }, []);

  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      title: "Discover Books",
      description:
        "Browse a diverse collection of books shared by fellow community members. Trade, buy, or pick up free items.",
    },
    {
      icon: <BookPlus className="h-6 w-6 text-indigo-600" />,
      title: "Share Your Collection",
      description:
        "Easily list books you'd like to exchange, donate, or sell to make space on your shelves.",
    },
    {
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: "Connect with Readers",
      description:
        "Connect directly with other book lovers in your neighborhood to swap titles and exchange knowledge.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white rounded-3xl py-20 px-6 sm:px-12 md:px-16 mb-16 shadow-2xl border border-slate-900">
        {/* Glow Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,#1e3a8a,transparent_60%)] opacity-35"></div>
        <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-blue-600/10 blur-[100px]"></div>
        <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-purple-600/10 blur-[100px]"></div>

        <div className="relative max-w-6xl mx-auto grid gap-12 lg:grid-cols-12 items-center">
          {/* Hero Content (left) */}
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-bold tracking-wider uppercase text-blue-400">
              <Sparkles className="h-3.5 w-3.5" /> Empowering Book Enthusiasts
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Share Books, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                Spread Knowledge
              </span>
            </h1>
            
            <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed">
              Join a vibrant community of book lovers where you can swap, donate, or list books. Connect with local readers and expand your literary horizons sustainably.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {!isLoggedIn ? (
                <>
                  <Link to="/signup" className="w-full sm:w-auto">
                    <button className="w-full px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:-translate-y-0.5">
                      Get Started Free
                    </button>
                  </Link>
                  <Link to="/browse" className="w-full sm:w-auto">
                    <button className="w-full px-8 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-2xl font-bold transition-all duration-300 hover:-translate-y-0.5">
                      Browse Catalog
                    </button>
                  </Link>
                </>
              ) : (
                <Link to="/browse" className="w-full sm:w-auto">
                  <button className="w-full px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-blue-900/30 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    Explore Marketplace <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Hero Image / Visual Stack (right) */}
          <div className="hidden lg:col-span-5 lg:flex justify-center">
            <div className="relative group w-80 h-96 rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 transform hover:-rotate-1 hover:scale-102 transition-all duration-500">
              <img
                src="https://images.unsplash.com/photo-1507842217343-583bb7270b66"
                alt="Beautiful community bookshelf"
                className="object-cover w-full h-full filter brightness-90 group-hover:brightness-100 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              
              {/* Overlay Stat Pill */}
              <div className="absolute bottom-5 left-5 right-5 p-4 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Active Library</p>
                  <p className="text-white text-sm font-extrabold">100+ Free Donations</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500 bg-blue-500/10 p-1.5 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Shelf Section (Dynamic backend books!) */}
      <section className="py-8 mb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              <TrendingUp className="h-3.5 w-3.5" /> Dynamic Arrivals
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800">Fresh Books on the Shelf</h2>
          </div>
          <Link to="/browse" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
            Browse All Books <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : featuredBooks.length === 0 ? (
          <div className="bg-gray-50 border border-dashed rounded-3xl p-12 text-center text-gray-500 font-medium">
            No books have been listed yet. Be the first to share one!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredBooks.map((book) => (
              <BookCard key={book._id || book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* How it works Section */}
      <section className="py-12 px-6 sm:px-12 bg-gray-50 rounded-3xl mb-16 border border-gray-100/50">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-gray-800">How It Works</h2>
          <p className="text-gray-500 mt-3 text-sm sm:text-base">
            Our platform makes it frictionless to exchange, acquire, and recycle books within your community.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="mb-5 w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-gray-100">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Guarantee stats */}
      <section className="grid gap-6 sm:grid-cols-3 py-6 mb-16 text-center">
        <div className="p-6 bg-white border border-gray-100 rounded-2xl flex flex-col items-center">
          <ShieldCheck className="h-8 w-8 text-emerald-500 mb-3" />
          <h4 className="font-bold text-gray-800 text-sm">Secure Swaps</h4>
          <p className="text-slate-400 text-xs mt-1">Verified community listings only</p>
        </div>
        <div className="p-6 bg-white border border-gray-100 rounded-2xl flex flex-col items-center">
          <HeartHandshake className="h-8 w-8 text-indigo-500 mb-3" />
          <h4 className="font-bold text-gray-800 text-sm">Eco Friendly</h4>
          <p className="text-slate-400 text-xs mt-1">Reduce waste, recirculate books</p>
        </div>
        <div className="p-6 bg-white border border-gray-100 rounded-2xl flex flex-col items-center">
          <Sparkles className="h-8 w-8 text-purple-500 mb-3" />
          <h4 className="font-bold text-gray-800 text-sm">Always Free Option</h4>
          <p className="text-slate-400 text-xs mt-1">Dozens of donations available daily</p>
        </div>
      </section>

      {/* Bottom Call to Action banner */}
      {!isLoggedIn && (
        <section className="py-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(255,255,255,0.1),transparent_50%)]"></div>
            <div className="relative max-w-xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to clear your shelves?</h2>
              <p className="text-blue-100 text-sm max-w-md mx-auto leading-relaxed">
                Join our network of book lovers today. List your first book or browse what others are donating!
              </p>
              <div className="pt-4">
                <Link to="/signup">
                  <button className="px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 transition font-bold rounded-2xl text-sm shadow-md hover:-translate-y-0.5 transition-all">
                    Register an Account
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Index;
