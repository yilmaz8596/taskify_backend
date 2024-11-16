import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
export const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(createHttpError(401, "Unauthorized"));
    }
    req.user = decoded;
  } catch (error) {
    console.error(error);
    return next(createHttpError(401, "Unauthorized"));
  }
};
