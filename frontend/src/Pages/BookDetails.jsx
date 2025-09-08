  import React, { useEffect, useState } from "react";
  import { useParams, Link, useNavigate } from "react-router-dom";
  import Layout from "../components/Layout";
  import { useAuth } from "../contexts/AuthContext";

  const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch book details
    useEffect(() => {
      const fetchBook = async () => {
        try {
          const res = await fetch(`http://localhost:5001/api/books/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to fetch book");

          setBook(data.book);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchBook();
    }, [id, token]);


    // Add to Cart
    const handleAddToCart = () => {
      if (!user) {
        alert("Please log in to add items to your cart.");
        navigate("/login");
        return;
      }

      const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
      const updatedCart = [...existingCart, book];

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      alert(`${book.title} added to cart!`);
      navigate("/cart");
    };

    // Buy Now
// const handleBuyNow = async () => {
//   if (!user) {
//     alert("Please log in to purchase books.");
//     navigate("/login");
//     return;
//   }

//   try {
//     const res = await fetch("http://localhost:5001/api/orders", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         items: [
//           {
//             bookId: book._id,
//             quantity: 1,
//             price: book.price,
//             title: book.title,
//           },
//         ],
//         totalAmount: book.price,
//       }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.message || "Checkout failed");
//       return;
//     }

//     // Redirect user to Stripe checkout
//     window.location.href = data.checkoutUrl;
//   } catch (err) {
//     console.error("Checkout error:", err);
//     alert("An error occurred while processing your payment.");
//   }
// };

    if (error || !book) {
      return (
        <Layout>
          <div className="text-center py-12">
            <p className="text-red-500">{error || "Book not found."}</p>
            <Link
              to="/browse"
              className="text-blue-500 hover:underline mt-4 inline-block"
            >
              Return to Browse
            </Link>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <div className="max-w-5xl mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Book Image */}
            <div className="flex-shrink-0 w-full md:w-1/3">
            <img
              src={
                book.image?.startsWith("http")
                ? book.image
                : `http://localhost:5001${book.image}`
              }
              alt={book.title}
              className="w-100 h-100 object-cover rounded shadow"
            />  
            </div>

            {/* Book Details */}
            <div className="flex-grow">
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <p className="text-gray-600 text-lg mb-4">by {book.author}</p>

              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Category:</strong> {book.category}
                </p>
                <p>
                  <strong>Condition:</strong> {book.condition}
                </p>
                <p>
                  <strong>Owner:</strong> {book.owner?.name || "Anonymous"}
                </p>
                {book.isForDonation ? (
                  <p className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded">
                    Available for Donation
                  </p>
                ) : (
                  <p>
                    <strong>Price:</strong> ₹{book.price}
                  </p>
                )}
              </div>

              {/* Book Description */}
              {book.description && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="text-gray-600 leading-relaxed">{book.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                {!book.isForDonation && (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="px-5 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition"
                    >
                      Add to Cart
                    </button>
                    {/* <button
                      onClick={handleBuyNow}
                      className="px-5 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
                    >
                      Buy Now
                    </button> */}
                  </>
                )}
                <Link
                  to="/browse"
                  className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Back to Browse
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  };

  export default BookDetails;
