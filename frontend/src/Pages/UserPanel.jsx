import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { Link } from "react-router-dom";

const UserPanel = () => {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("profile");
  const [myBooks, setMyBooks] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => {
    if (user?._id) {
      fetch(`/api/books/user/${user._id}`)
        .then(res => res.json())
        .then(data => setMyBooks(data));

      fetch(`/api/orders/user/${user._id}`)
        .then(res => res.json())
        .then(data => setMyOrders(data));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold">You are not logged in</h2>
        <p className="mt-2">Please login to view your profile and books.</p>
        <Link to="/login" className="text-primary underline mt-4 block">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-2 px-4 ${activeTab === "profile" ? "border-b-2 border-primary text-primary" : ""}`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("books")}
          className={`pb-2 px-4 ${activeTab === "books" ? "border-b-2 border-primary text-primary" : ""}`}
        >
          My Books
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-2 px-4 ${activeTab === "orders" ? "border-b-2 border-primary text-primary" : ""}`}
        >
          My Orders
        </button>
      </div>

      {/* Profile Section */}
      {activeTab === "profile" && (
        <div className="space-y-4">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      )}

      {/* My Books Section */}
      {activeTab === "books" && (
        <div>
          {myBooks.length === 0 ? (
            <p>You have not added any books yet.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myBooks.map(book => (
                <li key={book._id} className="p-4 border rounded-lg shadow-sm">
                  <h3 className="font-bold">{book.title}</h3>
                  <p>{book.author}</p>
                  <p className="text-sm text-gray-500">${book.price}</p>
                  <Link
                    to={`/book/${book._id}`}
                    className="text-primary underline text-sm"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* My Orders Section */}
      {activeTab === "orders" && (
        <div>
          {myOrders.length === 0 ? (
            <p>You have not placed any orders yet.</p>
          ) : (
            <ul className="space-y-4">
              {myOrders.map(order => (
                <li key={order._id} className="p-4 border rounded-lg shadow-sm">
                  <h3 className="font-bold">Order #{order._id}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-2">Total: ${order.totalAmount}</p>
                  <ul className="mt-2 list-disc list-inside">
                    {order.items.map(item => (
                      <li key={item.bookId}>{item.title} - ${item.price}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default UserPanel;
