import mongoose from "mongoose";

const plantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide plant name"],
      unique: true,
      trim: true,
      maxlength: [100, "Plant name cannot exceed 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide plant price"],
      min: [1, "Price must be at least 1"],
    },
    categories: {
      type: [String], // array of strings
      required: [true, "Please provide at least one category"],
      enum: [
        "Indoor",
        "Outdoor",
        "Succulent",
        "Air Purifying",
        "Home Decor",
        "Flowering",
        "Herbs",
        "Medicinal",
        "Other",
      ],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    image: {
      type: String,
      default: "", // fallback image
    },
  },
  { timestamps: true }
);

export const Plant = mongoose.model("Plant", plantSchema);
