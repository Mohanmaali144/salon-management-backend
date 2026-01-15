/**
 * paginate - generic pagination helper
 * @param {Object} model - Mongoose model
 * @param {Object} query - filter query (for .find)
 * @param {Object} options - { page, limit, sort }
 * @param {Array} aggregationPipeline - optional aggregation stages
 */
export const customPaginate = async (model, query = {}, options = {}, aggregationPipeline = []) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };

  let results;
  let total;

  if (aggregationPipeline.length > 0) {
    // Aggregation with pagination
    const pipeline = [
      ...aggregationPipeline,
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ];
    results = await model.aggregate(pipeline);
    total = await model.countDocuments(query); // still use query for total count
  } else {
    // Normal find query with pagination
    results = await model.find(query).sort(sort).skip(skip).limit(limit);
    total = await model.countDocuments(query);
  }

  const totalPages = Math.ceil(total / limit);

  return {
    results,
    page,
    limit,
    total,
    totalPages,
  };
};


// USE CASE
// const res = await paginate(User, {}, { page: 1, limit: 10 }, pipeline);