import { customPaginate } from "../../utils/customPaginate.js";
import { failure, success } from "../../utils/responseHandler.js";
import Admin from "./admin.model.js";

export const addAdmin = async (req, res) => {
  try {

    const { firstName, lastName, email, password, mobile } = req?.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json(
        failure({
          message: "All required fields must be provided",
          code: "VALIDATION_ERROR",
        })
      );
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json(
        failure({
          message: "Admin with this email already exists",
          code: "ADMIN_EXISTS",
        })
      );
    }

    const admin = await Admin.create({
      firstName,
      lastName,
      email,
      password,
      mobile,
    });

    // Remove sensitive fields before response
    const adminData = admin.toObject();
    delete adminData.password;
    delete adminData.otp;

    return res.status(201).json(
      success({
        data: adminData,
        message: "Admin created successfully",
        code: "ADMIN_CREATED",
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
      })
    );
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { firstName, lastName, email, mobile } = req?.body;

    // Basic validation
    if (!firstName || !lastName || !email) {
      return res.status(400).json(
        failure({
          message: "All required fields must be provided",
          code: "VALIDATION_ERROR",
        })
      );
    }

    const updatedCode = await Admin.findByIdAndUpdate(
      id, { firstName, lastName, email, mobile, },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCode) {
      return res.status(404).json(
        failure({
          message: "Admin not found",
          code: "ADMIN_NOT_FOUND",
        })
      );
    }

    return res.status(200).json(
      success({
        data: updatedCode,
        message: "Admin updated successfully",
        code: "ADMIN_UPDATED",
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

export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id)

    if (!admin) {
      return res.status(404).json(
        failure({
          message: "admin not found",
          admin: "NOT_FOUND",
        })
      );
    }

    return res.status(200).json(
      success({
        data: admin,
        message: "admin fetched successfully",
        admin: "FETCH_SUCCESS",
      })
    );
  } catch (err) {
    return res.status(500).json(
      failure({
        message: "Invalid admin ID",
        admin: "INVALID_ID",
        details: err.message,
      })
    );
  }
}


export const getAllAdmin = async (req, res) => {
  try {
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
    const paginatedData = await customPaginate(Admin, query, { page, limit, sort: sortOption });

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

export const getUserProfile = async (req, res) => {
  try {

    const userId = req.user._id;
    const user = await Admin.findById(userId);

    if (!user) {
      return res.status(404).json(
        failure({
          message: "User not found",
          code: "NOT_FOUND",
          details: "User not found with this token",
        })
      );
    }
    return res.status(200).json(
      success({
        data: user,
        message: "User fetched successfully",
        code: "USER_FETCH_SUCCESS",
      })
    );
  } catch (err) {
    return res.status(500).json(
      failure({
        message: err.message,
        code: "SERVER_ERROR",
        details: err,
      })
    );
  }
};
