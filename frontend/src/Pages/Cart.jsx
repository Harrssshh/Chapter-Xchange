import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const Cart = () => {
  const navigate = useNavigate();

  // Load cart items from localStorage
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
  }, []);

  // Remove item from cart
  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0
  );

  // Proceed to checkout with Stripe
  const handleCheckout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to proceed.");
      navigate("/login");
      return;
    }

    if (!cartItems?.length) {
      alert("Your cart is empty.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems.map((b) => ({
            bookId: b._id,
            quantity: b.quantity || 1,
            price: b.price,
            title: b.title,
          })),
          totalAmount: totalPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Checkout failed");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("An error occurred while processing your payment.");
    }
  };

  // Empty cart screen
  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link to="/browse" className="text-blue-500 hover:underline">
            Browse Books
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between bg-white p-4 rounded shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image?.startsWith("http") ? item.image : `http://localhost:5001${item.image}`}
                  alt={item.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-gray-600 text-sm">{item.author}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {item.price && <p className="font-medium">{item.price} ₹</p>}
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => removeFromCart(item._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total and Clear Cart */}
        <div className="mt-6 flex justify-between items-center">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={clearCart}
          >
            Clear Cart
          </button>
          <div className="text-lg font-semibold">Total: {totalPrice} ₹</div>
        </div>

        {/* Proceed to Checkout */}
        <div className="mt-6">
          <button
            onClick={handleCheckout}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
