import { Cart } from "../models/cartSchema.js";
import { Plant } from "../models/plantSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

export const addToCart = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { plantId, quantity } = req.body;
  const plant = await Plant.findById(plantId);
  if (!plant) return next(new ErrorHandler("Plant not found", 404));
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }
  const existingItem = cart.items.find(
    (item) => item.plant.toString() === plantId
  );
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      plant: plantId,
      quantity,
      priceAtTime: plant.price,
    });
  }
  cart.calculateTotal();
  await cart.save();
  res.status(200).json({
    success: true,
    message: "Plant added to cart",
    cart,
  });
});


export const updateCartItem = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { plantId, quantity } = req.body;
  let cart = await Cart.findOne({ user: userId });
  if (!cart) return next(new ErrorHandler("Cart not found", 404));
  const item = cart.items.find((i) => i.plant.toString() === plantId);
  if (!item) return next(new ErrorHandler("Item not in cart", 404));

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.plant.toString() !== plantId);
  } else {
    item.quantity = quantity;
  }
  cart.calculateTotal();
  await cart.save();
  // cart = await cart.populate("items.plant", "name price image category");
  res.status(200).json({
    success: true,
    message: "Cart updated",
    cart,
  });
});

export const removeCartItem = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { plantId } = req.body;

  let cart = await Cart.findOne({ user: userId });
  if (!cart) return next(new ErrorHandler("Cart not found", 404));
  cart.items = cart.items.filter((i) => i.plant.toString() !== plantId);
  cart.calculateTotal();
  await cart.save();
  res.status(200).json({
    success: true,
    message: "Item removed from cart",
    cart,
  });
});


export const getCart = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  let cart = await Cart.findOne({ user: userId }).populate(
    "items.plant",
    "name price image category"
  );
  if (!cart) return res.status(200).json({ success: true, cart: { items: [] } });
  res.status(200).json({
    success: true,
    cart,
  });
});


export const clearCart = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  let cart = await Cart.findOne({ user: userId });
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart cleared",
    cart,
  });
});
