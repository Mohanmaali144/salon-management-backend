/**
 * Slug Utility
 * - generateSlug: converts text to URL-friendly slug
 * - generateUniqueSlug: ensures uniqueness in DB
 */

import mongoose from "mongoose";

/**
 * generateSlug - converts a string to URL-friendly slug
 * @param {String} text - input string
 * @param {String} separator - optional, default "-"
 * @returns {String} slug
 */
export const generateSlug = (text, separator = "-") => {
  if (!text) return "";

  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")   // remove special characters
    .replace(/\s+/g, separator) // replace spaces with separator
    .replace(/-+/g, separator); // replace multiple separators
};

/**
 * generateUniqueSlug - ensures slug is unique in DB
 * @param {mongoose.Model} model - Mongoose model to check
 * @param {String} text - input string
 * @param {String} field - DB field for slug, default "slug"
 * @param {String} separator - optional, default "-"
 * @returns {String} unique slug
 */
export const generateUniqueSlug = async (model, text, field = "slug", separator = "-") => {
  const baseSlug = generateSlug(text, separator);
  let slug = baseSlug;
  let count = 1;

  while (await model.exists({ [field]: slug })) {
    slug = `${baseSlug}${separator}${count}`;
    count++;
  }
  return slug;
};


// Unique slug in DB
// const slug2 = await generateUniqueSlug(Product, title);
// console.log(slug2); // "new-product-2025" or "new-product-2025-1" if exists