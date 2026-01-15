import redis from "../config/redis.js";

/**
 * Set cache
 * @param {String} key 
 * @param {Any} value 
 * @param {Number} ttl - time to live in seconds
 */
export const setCache = async (key, value, ttl = 3600) => {
  await redis.set(key, JSON.stringify(value), "EX", ttl);
};

/**
 * Get cache
 * @param {String} key
 * @returns parsed value or null
 */
export const getCache = async (key) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Delete cache
 * @param {String} key
 */
export const deleteCache = async (key) => {
  await redis.del(key);
};















//  Usage Example
// import { setCache, getCache, deleteCache } from "./utils/cache.js";

// const key = "users_page_1";

// // Try to get from cache first
// let users = await getCache(key);
// if (!users) {
//   // fetch from DB
//   users = await User.find().limit(10);
//   // store in cache for 1 hour
//   await setCache(key, users, 3600);
// }

// console.log(users);

 // Delete cache example
// await deleteCache(key);