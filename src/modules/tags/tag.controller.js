import { failure, success } from "../../utils/responseHandler.js";
import Tags from "./tag.model.js";
import { customPaginate } from "../../utils/customPaginate.js";
import { generateSlug } from "../../utils/slugGenerator.js";

export const addTag = async (req, res) => {
  try {
    const { tags } = req?.body; // expect an array of tags

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json(
        failure({
          message: "At least one tag is required",
          code: "TAG_REQUIRED",
        })
      );
    }

    const createdTags = [];
    const skippedTags = [];

    for (let rawTag of tags) {
      const tag = rawTag.toLowerCase().trim();

      if (!tag) continue; // skip empty tags

      const existingTag = await Tags.findOne({ tag });

      if (existingTag) {
        skippedTags.push(tag); // already exists, skip
        continue;
      }

      const slug = await generateSlug(tag);

      const newTag = await Tags.create({ tag, slug });
      createdTags.push(newTag);
    }

    if (createdTags.length === 0) {
      return res.status(409).json(
        failure({
          message: "All tags already exist",
          code: "TAG_EXISTS",
          skippedTags,
        })
      );
    }

    return res.status(201).json(
      success({
        data: createdTags,
        message: "Tags created successfully",
        code: "TAG_CREATED",
        skippedTags, // return which tags were skipped
      })
    );
  } catch (err) {
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
        details: err.message,
      })
    );
  }
};


export const getAllTags = async (req, res) => {
  try {
    const { page, limit, search, sort } = req.query;

    console.log(req.query);

    // Build query
    const query = {};
    if (search) {
      query.tag = { $regex: search, $options: "i" }; // case-insensitive search
    }

    // Build sort
    const sortOption = sort ? JSON.parse(sort) : { createdAt: -1 };

    // Fetch paginated data
    const paginatedData = await customPaginate(Tags, query, { page, limit, sort: sortOption });

    return res.status(200).json(
      success({
        data: paginatedData.results,
        pagination: {
          page: paginatedData.page,
          limit: paginatedData.limit,
          total: paginatedData.total,
          totalPages: paginatedData.totalPages,
        },
        message: "Tags fetched successfully",
        code: "FETCH_SUCCESS",
      })
    );
  } catch (err) {
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
        details: err.message,
      })
    );
  }
};


/**
 * Delete one or multiple tags by _id
 */
export const deleteTag = async (req, res) => {
  try {
    const { ids } = req?.body; // expect an array of tag _id's

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json(
        failure({
          message: "At least one tag ID is required to delete",
          code: "TAG_ID_REQUIRED",
        })
      );
    }

    const deletedTags = [];
    const notFoundTags = [];

    for (let id of ids) {
      const deleted = await Tags.findByIdAndDelete(id);

      if (deleted) {
        deletedTags.push(id);
      } else {
        notFoundTags.push(id);
      }
    }

    if (deletedTags.length === 0) {
      return res.status(404).json(
        failure({
          message: "No tags were deleted. ids not found",
          code: "TAG_NOT_FOUND",
          notFoundTags,
        })
      );
    }

    return res.status(200).json(
      success({
        data: deletedTags,
        message: "Tags deleted successfully",
        code: "TAG_DELETED",
        notFoundTags,
      })
    );
  } catch (err) {
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
        details: err.message,
      })
    );
  }
};
