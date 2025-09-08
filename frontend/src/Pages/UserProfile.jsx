import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login"); // redirect if not logged in
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>

      <div className="bg-white p-6 shadow rounded-lg space-y-4">
        <div>
          <p className="text-gray-600">
            <strong>Name:</strong> {user.name}
          </p>
        </div>
        <div>
          <p className="text-gray-600">
            <strong>Email:</strong> {user.email}
          </p>
        </div>
        <div>
          <p className="text-gray-600">
            <strong>Role:</strong> {user.role || "User"}
          </p>
        </div>
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={() => navigate("/my-books")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          My Books
        </button>
        <button
          onClick={() => navigate("/orders")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          My Orders
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
