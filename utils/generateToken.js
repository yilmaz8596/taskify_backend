import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

export const generateToken = async (
  payload,
  secret,
  options = { expiresIn: "1d" }
) => {
  if (!payload) {
    throw new Error("Payload is required");
  }
  if (!secret) {
    throw new Error("Secret is required");
  }

  try {
    const token = await jwt.sign(payload, secret, options);
    return token;
  } catch (error) {
    console.log(error);
    throw createHttpError.InternalServerError(`Problem with generating token. ${error}
`);
  }
};
