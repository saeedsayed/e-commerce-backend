import jwt from "jsonwebtoken";

export default (payload) => {
  const expireIn = 7; // days count of expire token
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expireIn + "d",
  });
  return token;
};
