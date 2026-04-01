import appError from "../utils/appError.js";
import STATUS from "../constants/httpStatus.constant.js";
import jwt from "jsonwebtoken";
import user from "../modules/users/user.model.js";

export const checkToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer ")) {
    const err = appError.create(
      "Unauthorized - No Token Provided",
      401,
      STATUS.FAIL,
    );
    return next(err);
  }
  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.userId = decoded._id;
    next();
  } catch {
    const err = appError.create(
      "Unauthorized - Token expired",
      401,
      STATUS.FAIL,
    );
    return next(err);
  }
};

export const getUserInfo = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer ")) {
    req.userInfo = null;
    return next();
  }
  let userId = req.userId;
  if (!userId) {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    userId = decoded._id;
  }
  const userInfo = await user.findById(userId);
  req.userInfo = userInfo;
  return next();
};

export const restrictTo = (...roles) => {
  return async (req, res, next) => {
    const requestedUser = await user.findById(req.userId);
    if (!roles.includes(requestedUser?.role)) {
      const err = appError.create(
        "Forbidden - You don't have permission",
        403,
        STATUS.FAIL,
      );
      return next(err);
    }
    req.userRole = requestedUser.role;
    next();
  };
};
