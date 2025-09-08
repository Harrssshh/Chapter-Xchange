import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { BookOpen, BookPlus, Users } from "lucide-react";

const Index = () => {
  // Check if user is logged in
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      title: "Discover Books",
      description:
        "Browse through a diverse collection of books shared by our community members.",
    },
    {
      icon: <BookPlus className="h-8 w-8 text-blue-600" />,
      title: "Share Your Collection",
      description:
        "List books you'd like to exchange, donate, or make available to others.",
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Connect with Readers",
      description:
        "Find and connect with fellow book enthusiasts in your community.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Share Books, Spread Knowledge
              </h1>
              <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join our community of book lovers where you can exchange,
                donate, or request books. Connect with fellow readers and
                expand your literary horizons.
              </p>

              {/* Show both buttons if NOT logged in */}
              {!isLoggedIn && (
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link to="/signup">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-md text-lg w-full min-[400px]:w-auto hover:bg-blue-700 transition">
                      Get Started
                    </button>
                  </Link>
                  <Link to="/browse">
                    <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md text-lg w-full min-[400px]:w-auto hover:bg-blue-50 transition">
                      Browse Books
                    </button>
                  </Link>
                </div>
              )}

              {/* If logged in, only show Browse Books button */}
              {isLoggedIn && (
                <Link to="/browse">
                  <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md text-lg hover:bg-blue-50 transition">
                    Browse Books
                  </button>
                </Link>
              )}
            </div>

            <div className="flex justify-center">
              <div className="relative h-[350px] w-[350px] rounded-lg overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1507842217343-583bb7270b66"
                  alt="Stack of books"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              Our platform makes it easy to share and discover books within the
              community.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Hidden when logged in */}
      {!isLoggedIn && (
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="bg-gray-50 border border-blue-200 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">
                Ready to join our community?
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto mb-6">
                Start sharing your books and discover new reads from fellow book
                lovers.
              </p>
              <Link to="/signup">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-md text-lg hover:bg-blue-700 transition">
                  Create an Account
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Index;
