import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title for the book"],
    },
    author: {
      type: String,
      required: [true, "Please provide the author's name"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    price: {
     type: Number,
     min: [0, "Price cannot be negative"],
     validate: {
       validator: function (value) {
        if (!this.isWillingToDonate) {
         return value > 0;
        }
         return true; 
        },
      message: "Please provide a valid price unless donating",
     },
    },
      isWillingToDonate: {
       type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: "General",
    },
    condition: {
      type: String,
      required: [true, "Please specify the condition of the book"],
    },
    isWillingToDonate: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String, 
      default: "",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);