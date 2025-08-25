import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./errorMiddleware.js";
import jwt from "jsonwebtoken";

export const isAdminAuthenticated=catchAsyncErrors(async (req,res,next)=>{
    const token=req.cookies.adminToken;
    if(!token){
    return next(new ErrorHandler("Admin Not Authenticated!",400));
    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    req.user=await User.findById(decoded.id);
    if(req.user.role!=="Admin"){
        return next(
            new ErrorHandler(
                `${req.user.role} not autherized for this resources!`,
                403
            )
        );
    }
    next();
});

export const isCustomerAuthenticated=catchAsyncErrors(async (req,res,next)=>{
const token=req.cookies.customerToken;
if(!token){
return next(new ErrorHandler("Customer Not Authenticated!",400));
}
const decoded=jwt.verify(token,process.env.JWT_SECRET);
req.user=await User.findById(decoded.id);
if(req.user.role!=="Customer"){
    return next(
        new ErrorHandler(
            `${req.user.role} not autherized for this resources!`,
            403
        )
    );
}
next();
});

