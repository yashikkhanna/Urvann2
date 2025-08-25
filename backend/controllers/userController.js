import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import  sendEmail  from "../utils/sendEmail.js"; // utility to send emails
import crypto from "crypto";
import {generateToken} from "../utils/jwtToken.js";

// ✅ Register User (Send OTP)
export const register = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, role } = req.body;

  if (!firstName || !lastName || !email || !phone || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser && existingUser.accountVerified) {
    return next(new ErrorHandler("User already registered", 400));
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    role,
  });

  const otp = user.generateVerificationCode();
  await user.save();

  await sendEmail({
    email: user.email,
    subject: "Verify your account - Plant Store",
    message: `Hello ${user.firstName},\n\nYour OTP is: ${otp}\nIt will expire in 10 minutes.`,
  });

  res.status(200).json({
    success: true,
    message: "User registered. OTP sent to email.",
  });
});

// ✅ Verify OTP
export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email, accountVerified: false });
  if (!user) return next(new ErrorHandler("User not found or already verified", 404));

  if (user.verificationCode !== Number(otp)) {
    return next(new ErrorHandler("Invalid OTP", 400));
  }

  if (Date.now() > user.verificationCodeExpire) {
    return next(new ErrorHandler("OTP expired", 400));
  }

  user.accountVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpire = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Account verified successfully. You can now log in.",
    token: user.generateJsonWebToken(),
  });
});

// ✅ Resend OTP
export const resendOtp = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email, accountVerified: false });
  if (!user) return next(new ErrorHandler("User not found or already verified", 404));

  const otp = user.generateVerificationCode();
  await user.save();

  await sendEmail({
    email: user.email,
    subject: "Resend OTP - Plant Store",
    message: `Hello ${user.firstName},\n\nYour new OTP is: ${otp}\nIt will expire in 10 minutes.`,
  });

  res.status(200).json({
    success: true,
    message: "New OTP sent successfully.",
  });
});

// ✅ Login User
export const login=catchAsyncErrors( async(req,res,next)=>{
    const { email,password,role }=req.body;
    if(!email || !password || !role){
        return next(new ErrorHandler("Please Provide All Details!",400));
    }
    // if(password!=confirmPassword){
    //     return next(new ErrorHandler("Password And Confirm Password Do Not Match!",400))
    // }
    const user=await User.findOne({email}).select("+password");
    if(!user){
        const user = await User.findOne({ email, role });
        return next(new ErrorHandler("Invalid password Or Email!",400));
    }
    const isPasswordMatched=await user.comparePassword(password);
    if(!isPasswordMatched){
        
        return next(new ErrorHandler("Invalid password Or Email!",400));
    }
    if(role!==user.role){
        return next(new ErrorHandler("User With This Role Not Found!",400));
    }
    generateToken(user,"User Login Successful!",200,res);
});
export const logoutAdmin=catchAsyncErrors(async (req,res,next)=>{
    res.status(200)
    .cookie("adminToken","",{
        httpOnly:true,
        expires:new Date(Date.now()),
    })
    .json({
        success:true,
        messsage:"Admin Logged Out Successfully!",
    });
});

export const logoutCustomer=catchAsyncErrors(async (req,res,next)=>{
    res.status(200)
    .cookie("customerToken","",{
        httpOnly:true,
        expires:new Date(Date.now()),
    })
    .json({
        success:true,
        messsage:"Customer Logged Out Successfully!",
    });
});
export const getUserDetails=catchAsyncErrors(async (req,res,next)=>{
    const user= req.user;
    res.status(200).json({
        success:true,
        user,
    })
});