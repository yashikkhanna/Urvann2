import { Order } from "../models/orderSchema.js";
import { Cart } from "../models/cartSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";


export const createOrder = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { address, paymentMethod } = req.body;
  const cart = await Cart.findOne({ user: userId }).populate("items.plant", "price");
  if (!cart || cart.items.length === 0) {
    return next(new ErrorHandler("Cart is empty", 400));
  }
  const orderItems = cart.items.map((item) => ({
    plant: item.plant._id,
    quantity: item.quantity,
    priceAtTime: item.plant.price,
  }));
  const totalPrice = orderItems.reduce(
    (acc, item) => acc + item.quantity * item.priceAtTime,
    0
  );
  const order = await Order.create({
    user: userId,
    items: orderItems,
    totalPrice,
    address,
    paymentMethod,
  });

  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();
  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order,
  });
});

export const getUserOrders = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const orders = await Order.find({ user: userId }).populate("items.plant", "name price image");
  res.status(200).json({
    success: true,
    orders,
  });
});

export const getOrderById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id).populate("items.plant", "name price image");
  if (!order) return next(new ErrorHandler("Order not found", 404));
  res.status(200).json({
    success: true,
    order,
  });
});

export const updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = await Order.findById(id);
  if (!order) return next(new ErrorHandler("Order not found", 404));
  order.status = status;
  await order.save();
  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    order,
  });
});

export const cancelOrder = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const order = await Order.findOne({ _id: id, user: userId });
  if (!order) return next(new ErrorHandler("Order not found", 404));

  if (order.status !== "Pending" && order.status !== "Processing") {
    return next(new ErrorHandler("Order cannot be cancelled at this stage", 400));
  }
  order.status = "Cancelled";
  await order.save();
  res.status(200).json({
    success: true,
    message: "Order cancelled successfully",
    order,
  });
});

export const getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const { status, minPrice, maxPrice, state, city, fromDate, toDate, page = 1 } = req.query;
  let query = {};
  if (status) query.status = status;
  if (minPrice || maxPrice) {
    query.totalPrice = {};
    if (minPrice) query.totalPrice.$gte = Number(minPrice);
    if (maxPrice) query.totalPrice.$lte = Number(maxPrice);
  }
  if (state) query["address.state"] = { $regex: state, $options: "i" };
  if (city) query["address.city"] = { $regex: city, $options: "i" };
  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = new Date(fromDate);
    if (toDate) query.createdAt.$lte = new Date(toDate);
  }
  const resultsPerPage = 25;
  const currentPage = Number(page) || 1;
  const skip = resultsPerPage * (currentPage - 1);
  const totalOrders = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate("user", "name email")
    .populate("items.plant", "name price image")
    .sort({ createdAt: -1 }) 
    .skip(skip)
    .limit(resultsPerPage);

  res.status(200).json({
    success: true,
    totalOrders,
    resultsPerPage,
    currentPage,
    totalPages: Math.ceil(totalOrders / resultsPerPage),
    count: orders.length,
    orders,
  });
});
