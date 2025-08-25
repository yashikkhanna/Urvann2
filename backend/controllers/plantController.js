import { Plant } from "../models/plantSchema.js";
import cloudinary from "cloudinary";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

export const addPlant = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || !req.files.image) {
    return next(new ErrorHandler("Plant Image Required!", 400));
  }

  const { image } = req.files;

  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(image.mimetype)) {
    return next(new ErrorHandler("File Format Not Supported!", 400));
  }

  let { name, price, categories, description, inStock } = req.body;

  if (!name || !price || !categories) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  // ✅ Convert price to number
  price = Number(price);

  // ✅ Handle inStock (string → boolean)
  inStock = inStock === "true" || inStock === true;

  // ✅ Handle categories
  // - If frontend sends multiple values, req.body.categories will be array already
  // - If it sends comma separated, split them
  if (typeof categories === "string") {
    categories = categories.split(",").map((c) => c.trim());
  }

  // ✅ Upload to Cloudinary
  const cloudinaryResponse = await cloudinary.v2.uploader.upload(
    image.tempFilePath,
    { folder: "plants" }
  );

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown error");
    return next(new ErrorHandler("Failed to upload plant image", 500));
  }

  const newPlant = await Plant.create({
    name,
    price,
    categories,
    description,
    inStock,
    image: cloudinaryResponse.secure_url,
  });

  res.status(201).json({
    success: true,
    message: "Plant added successfully!",
    plant: newPlant,
  });
});

export const updatePlantStock = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { inStock } = req.body;
  if (typeof inStock !== "boolean") {
    return next(new ErrorHandler("Please provide a valid inStock value (true/false)", 400));
  }
  const plant = await Plant.findById(id);
  if (!plant) {
    return next(new ErrorHandler("Plant not found", 404));
  }
  plant.inStock = inStock;
  await plant.save();
  res.status(200).json({
    success: true,
    message: `Plant "${plant.name}" stock status updated successfully`,
    plant,
  });
});

export const updatePlant = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const updates = { ...req.body };
  if (updates.name) {
    delete updates.name;
  }
  if (req.files && req.files.image) {
    const { image } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(image.mimetype)) {
      return next(new ErrorHandler("File Format Not Supported!", 400));
    }
    const cloudinaryResponse = await cloudinary.v2.uploader.upload(image.tempFilePath, {
      folder: "plants",
    });
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown error");
      return next(new ErrorHandler("Failed to upload plant image", 500));
    }
    updates.image = cloudinaryResponse.secure_url;
  }
  const plant = await Plant.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!plant) {
    return next(new ErrorHandler("Plant not found", 404));
  }
  res.status(200).json({
    success: true,
    message: `Plant "${plant.name}" updated successfully`,
    plant,
  });
});

export const getPlants = catchAsyncErrors(async (req, res, next) => {
  let { search, category, minPrice, maxPrice, inStock, sort, page } = req.query;
  page = Number(page) || 1;
  const limit = 10; 
  const skip = (page - 1) * limit;
  let query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (category) {
    query.categories = category;
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (inStock !== undefined) {
    query.inStock = inStock === "true";
  }
  let sortOption = {};
  if (sort === "priceAsc") sortOption.price = 1;
  else if (sort === "priceDesc") sortOption.price = -1;
  else if (sort === "newest") sortOption.createdAt = -1;
  else if (sort === "oldest") sortOption.createdAt = 1;
  const plants = await Plant.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);
  const totalPlants = await Plant.countDocuments(query);
  res.status(200).json({
    success: true,
    total: totalPlants,
    page,
    pages: Math.ceil(totalPlants / limit),
    results: plants.length,
    plants,
  });
});

export const deletePlant = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const plant = await Plant.findById(id);
  if (!plant) {
    return next(new ErrorHandler("Plant not found", 404));
  }
  if (plant.image) {
    try {
      const publicId = plant.image.split("/").pop().split(".")[0]; 
      await cloudinary.v2.uploader.destroy(`plants/${publicId}`);
    } catch (error) {
      console.error("Cloudinary deletion error:", error.message);
    }
  }
  await Plant.findByIdAndDelete(id);
  res.status(200).json({
    success: true,
    message: `Plant "${plant.name}" has been deleted successfully`,
  });
});