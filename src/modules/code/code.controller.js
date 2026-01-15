import { failure, success } from "../../utils/responseHandler.js";
import Code from "./code.model.js";
import { customPaginate } from "../../utils/customPaginate.js";

export const addCode = async (req, res) => {
  try {

    const { type } = req.body;

    // Validate type
    if (!type || !["snippets", "repository", "resources"].includes(type)) {
      return res.status(400).json(
        failure({
          message: "Invalid or missing type",
          code: "VALIDATION_ERROR",
        })
      );
    }

    // Validate data exists for the given type
    if (!req.body[type]) {
      return res.status(400).json(
        failure({
          message: `Missing data for ${type}`,
          code: "VALIDATION_ERROR",
        })
      );
    }

    // Build document dynamically
    const newCode = new Code({
      [type]: req.body[type],
      type
    });

    const savedCode = await newCode.save();


    return res.status(201).json(
      success({
        data: savedCode,
        message: "Code created successfully",
        code: "CODE_CREATED",
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
        details: err.message,
      })
    );
  }

};


export const updateCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    // Validate type
    if (!type || !["snippets", "repository", "resources"].includes(type)) {
      return res.status(400).json(
        failure({
          message: "Invalid or missing type",
          code: "VALIDATION_ERROR",
        })
      );
    }

    // Validate data for the given type
    if (!req.body[type]) {
      return res.status(400).json(
        failure({
          message: `Missing data for ${type}`,
          code: "VALIDATION_ERROR",
        })
      );
    }

    // Build update object dynamically
    const updateData = {
      [type]: req.body[type],
      type,
    };

    const updatedCode = await Code.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCode) {
      return res.status(404).json(
        failure({
          message: "Code not found",
          code: "CODE_NOT_FOUND",
        })
      );
    }

    return res.status(200).json(
      success({
        data: updatedCode,
        message: "Code updated successfully",
        code: "CODE_UPDATED",
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
        details: err.message,
      })
    );
  }
};


export const getAllCode = async (req, res) => {
  try {
    console.log("sdjkfbskjbvsfjk");
    
    const { page, limit, search, sort, type } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" }; // case-insensitive search
    }
    if (type)
      query.type = type

    // Build sort
    const sortOption = sort ? JSON.parse(sort) : { createdAt: -1 };

    // Fetch paginated data
    const paginatedData = await customPaginate(Code, query, { page, limit, sort: sortOption });

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

export const getCodeById = async (req, res) => {
  try {
    const { id } = req.params;

    const code = await Code.findById(id)

    if (!code) {
      return res.status(404).json(
        failure({
          message: "code not found",
          code: "NOT_FOUND",
        })
      );
    }

    return res.status(200).json(
      success({
        data: code,
        message: "Code fetched successfully",
        code: "FETCH_SUCCESS",
      })
    );
  } catch (err) {
    return res.status(500).json(
      failure({
        message: "Invalid code ID",
        code: "INVALID_ID",
        details: err.message,
      })
    );
  }
}

/**
 * Delete one or multiple tags by _id
 */
export const deleteCode = async (req, res) => {
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

    const deletedId = [];
    const notFoundId = [];

    for (let id of ids) {
      const deleted = await Code.findByIdAndDelete(id);

      if (deleted) {
        deletedId.push(id);
      } else {
        notFoundId.push(id);
      }
    }

    if (deletedId.length === 0) {
      return res.status(404).json(
        failure({
          message: "No tags were deleted. ids not found",
          code: "NOT_FOUND",
          notFoundId,
        })
      );
    }

    return res.status(200).json(
      success({
        data: deletedId,
        message: "Tags deleted successfully",
        code: "DELETED",
        notFoundId,
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
