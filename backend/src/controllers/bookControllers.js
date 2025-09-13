    // src/controllers/bookController.js
    import Book from "../models/book.js";

    // =========================
    // Get all books
    // =========================
    export const getBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, books });
    } catch (err) {
        console.error("Get books error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch books" });
    }
    };

    // =========================
    // Get single book
    // =========================
    export const getBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ success: false, message: "Book not found" });
        res.status(200).json({ success: true, book });
    } catch (err) {
        console.error("Get book error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch book" });
    }
    };

// =========================
// Add new book
// =========================
export const addBook = async (req, res) => {
  try {
    const { title,
            author,
            price,
            description,
            category,
            condition,
            isWillingToDonate
          } = req.body;

    // ✅ Validate required fields
    if (!title || !author || !description || !category || !condition) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    // ✅ Determine final price
    const finalPrice = isWillingToDonate === "true" || isWillingToDonate === true ? 0 : Number(price);

    if (!isWillingToDonate && (!finalPrice || finalPrice <= 0)) {
      return res.status(400).json({ success: false, message: "Please provide a valid price unless donating" });
    }

    let imageUrl = "";

    if (req.file) {
      // ✅ Upload to Cloudinary using memory buffer
      const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "chapter-exchange/books" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(fileBuffer);
        });
      };

      const uploadResult = await streamUpload(req.file.buffer);
      imageUrl = uploadResult.secure_url;
    }

    // ✅ Create the book
    const book = await Book.create({
      title,
      author,
      description,
      price: finalPrice,
      category,
      condition,
      isWillingToDonate: finalPrice === 0,
      seller: req.user.userId,
      image: imageUrl,
    });

    res.status(201).json({ success: true, book });
  } catch (err) {
    console.error("Add book error:", err);
    res.status(500).json({ success: false, message: "Failed to add book" });
  }
};
    // =========================
    // Update book
    // =========================
    export const updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ success: false, message: "Book not found" });

        // Ensure only the owner can update
        if (book.userId.toString() !== req.user.userId) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        Object.assign(book, req.body);
        await book.save();

        res.status(200).json({ success: true, book });
    } catch (err) {
        console.error("Update book error:", err);
        res.status(500).json({ success: false, message: "Failed to update book" });
    }
    };

    // =========================
    // Delete book
    // =========================
    export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ success: false, message: "Book not found" });

        // Ensure only the owner can delete
        if (book.userId.toString() !== req.user.userId) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await book.deleteOne();
        res.status(200).json({ success: true, message: "Book deleted" });
    } catch (err) {
        console.error("Delete book error:", err);
        res.status(500).json({ success: false, message: "Failed to delete book" });
    }
    };
    export const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ success: false, message: "Book not found" });
        res.status(200).json({ success: true, book });
    } catch (err) {
        console.error("Get book error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch book" });
  }
};
// Get books added by a specific user
export const getUserBooks = async (req, res) => {
  try {
    const books = await Book.find({ seller: req.params.userId });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user's books" });
  }
};

// Get orders for a specific user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user's orders" });
  }
};
