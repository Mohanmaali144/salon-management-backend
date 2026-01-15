/**
 * Unified API response helper
 * Keeps controller responses consistent and easy to parse on client side.
 *
 * Usage examples:
 *  res.status(200).json(success({ data, message: 'OK' }));
 *  res.status(400).json(failure({ message: 'Bad request', code: 'INVALID_INPUT', details }));
 */

/**
 * success: build a uniform success payload
 * @param {Object} opts
 *    - data: any (payload)
 *    - message: string (short message)
 *    - meta: object (pagination or additional metadata)
 *    - code: string (optional business code)
 */
export const success = ({ data = null, message = "Success", meta = null, code = null, pagination = null } = {}) => {
  const payload = {
    success: true,
    message,
    code: code || null,
    data,
    pagination,
  };
  if (meta) payload.meta = meta;
  return payload;
};

/**
 * failure: build a uniform error payload
 * @param {Object} opts
 *    - message: string
 *    - code: string (business error code)
 *    - details: any (field errors)
 */
export const failure = ({ message = "Something went wrong", code = "ERR_INTERNAL", details = null } = {}) => {
  return {
    success: false,
    message,
    code,
    details: details || null,
  };
};




// USE CASE
// import { success, failure } from "../utils/responseHandler.js";

// export const createUser = async (req, res) => {
//   try {
//     const user = await User.create(req.body);
//     return res.status(201).json(success({ data: { id: user._id, name: user.name }, message: "User created" }));
//   } catch (err) {
//     // log internally, return machine-friendly code to client
//     console.error("createUser failed:", err);
//     return res.status(400).json(failure({ message: "User creation failed", code: "USER_CREATE_FAILED", details: err.message }));
//   }
// };
