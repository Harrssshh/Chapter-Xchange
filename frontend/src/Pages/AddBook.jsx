import React, { useState, useContext } from "react";
import Layout from "../components/Layout";
import { toast } from "react-hot-toast"; // ✅ Toast notifications
import { UserContext } from "../contexts/UserContext";

const AddBook = ({ onBookAdded }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [isWillingToDonate, setIsWillingToDonate] = useState(false);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState("");
  const { user, token } = useContext(UserContext); // ✅ get logged-in user & token

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Frontend validation
    if (!title || !author || !category || !condition) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isWillingToDonate && (!price || price <= 0)) {
    toast.error("Please enter a valid price or mark the book as donation.");
    return;
   }

    if (!token) {
      toast.error("You must be logged in to add a book.");
      return;
    }
    

    setIsLoading(true);

    try {
      
      // ✅ Prepare form data to send as multipart/form-data
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("category", category);
      formData.append("condition", condition);
      formData.append("description", description);
      formData.append("isWillingToDonate", isWillingToDonate);
      formData.append("price", isWillingToDonate ? 0 : price);

      if (image) {
        formData.append("image", image); // ✅ Attach image file
      }

      // ✅ Send data to backend
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/books`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ JWT authentication
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add book");
      }

      // ✅ Success
      toast.success("Book added successfully!");

      // ✅ Reset form fields
      setTitle("");
      setAuthor("");
      setCategory("");
      setCondition("");
      setDescription("");
      setIsWillingToDonate(false);
      setImage(null);
      setPrice("");

       if (onBookAdded) {
        onBookAdded();
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto py-6">
        <div className="bg-white rounded-xl shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-1">Add a Book</h2>
            <p className="text-gray-600">Share a book from your collection with the community</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Book Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Book Title <span className="text-red-500">*</span></label>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter the book title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Author */}
              <div className="space-y-2">
                <label htmlFor="author" className="text-sm font-medium">Author <span className="text-red-500">*</span></label>
                <input
                  id="author"
                  type="text"
                  placeholder="Enter the author's name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Category <span className="text-red-500">*</span></label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
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
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <label htmlFor="condition" className="text-sm font-medium">Condition <span className="text-red-500">*</span></label>
                  <select
                    id="condition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a condition</option>
                    <option value="new">New</option>
                    <option value="like-new">Like New</option>
                    <option value="very-good">Very Good</option>
                    <option value="good">Good</option>
                    <option value="acceptable">Acceptable</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Add a description or notes about the book"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Willing to Donate */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  id="donate"
                  type="checkbox"
                  checked={isWillingToDonate}
                  onChange={(e) => setIsWillingToDonate(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="donate" className="text-sm font-medium">I am willing to donate this book (no exchange required)</label>
              </div>
              {/* Price (if not donating) */}
              {!isWillingToDonate && (
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">Price <span className="text-red-500">*</span></label>
                 <input
                  id="price"
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter book price"
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
              </div>
              )}

              {/* Book Cover Image */}
              <div className="space-y-2">
                <label htmlFor="image" className="text-sm font-medium">Book Cover Image (Optional)</label>
                <input id="image" type="file" accept="image/*" className="w-full" onChange={(e) => setImage(e.target.files[0])} />
                <p className="text-xs text-gray-500">Max file size: 5MB. Supported formats: JPG, PNG</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full p-3 rounded-md text-white font-medium ${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {isLoading ? "Adding Book..." : "Add Book"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddBook;
