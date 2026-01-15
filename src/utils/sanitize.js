// Basic HTML sanitizer
const stripHtml = (str = "") => {
  return str.replace(/<[^>]*>?/gm, "").trim();
};

// Remove Mongo operator keys ($, .)
const cleanObjectKeys = (obj = {}) => {
  const cleanObj = {};
  for (let key in obj) {
    const cleanKey = key.replace(/\$/g, "").replace(/\./g, "");
    cleanObj[cleanKey] = obj[key];
  }
  return cleanObj;
};

// Main sanitizer
export const sanitizeInput = (data) => {
  if (!data) return data;

  // Handle strings
  if (typeof data === "string") {
    return stripHtml(data).trim();
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeInput(item));
  }

  // Handle objects
  if (typeof data === "object") {
    const cleanedObj = cleanObjectKeys(data);
    for (let key in cleanedObj) {
      cleanedObj[key] = sanitizeInput(cleanedObj[key]);
    }
    return cleanedObj;
  }

  return data; // for numbers/booleans
};



// USE CASE 
// req.body = sanitizeInput(req.body);
// req.query = sanitizeInput(req.query);
// req.params = sanitizeInput(req.params);
