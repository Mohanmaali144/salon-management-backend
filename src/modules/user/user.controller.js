import { customPaginate } from "../../utils/customPaginate.js";
import { failure, success } from "../../utils/responseHandler.js";
import User from "./user.model.js";

import { generateUniqueSlug } from "../../utils/slugGenerator.js";
import mongoose from "mongoose";



async function dropCollection() {
  try {
    await mongoose.connect("mongodb+srv://aaradhya_db_user:Xmv02488!!@cluster0.vgtd1rh.mongodb.net/MY_DB");
    
    // Replace 'users' with your collection name
    await mongoose.connection.db.dropCollection('users');
    
    console.log("Collection 'users' deleted successfully!");
    process.exit(0);
  } catch (err) {
    if (err.codeName === 'NamespaceNotFound') {
        console.log("Collection doesn't exist or was already deleted.");
    } else {
        console.error("Error:", err);
    }
    process.exit(1);
  }
}

export const addUser = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password, role, image } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json(
        failure({
          message: "All required fields must be provided",
          code: "VALIDATION_ERROR",
        })
      );
    }

    // Check if email already exists (and not deleted)
    const existingUser = await User.findOne({ email, deletedAt: null });
    if (existingUser) {
      return res.status(409).json(
        failure({
          message: "User with this email already exists",
          code: "USER_EXISTS",
        })
      );
    }

    // Generate slug
    const slug = await generateUniqueSlug(User,firstName)

    const user = await User.create({
      slug,
      firstName,
      lastName,
      email,
      mobile,
      password,
      role,
      image,
    });

    // Remove sensitive fields
    const userData = user.toObject();
    delete userData.password;
    delete userData.otp;

    return res.status(201).json(
      success({
        data: userData,
        message: "User created successfully",
        code: "USER_CREATED",
      })
    );
  } catch (err) {
    console.error("Add User Error:", err);
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
      })
    );
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find active user only
    const user = await User.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!user) {
      return res.status(404).json(
        failure({
          message: "User not found or already deleted",
          code: "USER_NOT_FOUND",
        })
      );
    }

    // Update allowed fields
    const allowedFields = ["firstName", "lastName", "mobile", "email", "role", "image", "password"];
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    await user.save();

    // Remove sensitive fields
    const userData = user.toObject();
    delete userData.password;
    delete userData.otp;

    return res.status(200).json(
      success({
        data: userData,
        message: "User updated successfully",
        code: "USER_UPDATED",
      })
    );
  } catch (err) {
    console.error("Update User Error:", err);
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
      })
    );
  }
};



export const getAllUsers = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const query = { deletedAt: null };

    const paginationResult = await customPaginate(User, query, { page, limit, sort: { createdAt: -1 } });

    return res.status(200).json(
      success({
        data: paginationResult.results,
        meta: {
          page: paginationResult.page,
          limit: paginationResult.limit,
          total: paginationResult.total,
          totalPages: paginationResult.totalPages,
        },
        message: "Users fetched successfully",
        code: "USERS_FETCHED",
      })
    );
  } catch (err) {
    console.error("Get All Users Error:", err);
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
      })
    );
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, deletedAt: null });

    if (!user) {
      return res.status(404).json(
        failure({
          message: "User not found",
          code: "USER_NOT_FOUND",
        })
      );
    }

    const userData = user.toObject();
    delete userData.password;
    delete userData.otp;

    return res.status(200).json(
      success({
        data: userData,
        message: "User fetched successfully",
        code: "USER_FETCHED",
      })
    );
  } catch (err) {
    console.error("Get User By ID Error:", err);
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
      })
    );
  }
};


export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email, deletedAt: null });

    if (!user) {
      return res.status(404).json(
        failure({
          message: "User not found",
          code: "USER_NOT_FOUND",
        })
      );
    }

    const userData = user.toObject();
    delete userData.password;
    delete userData.otp;

    return res.status(200).json(
      success({
        data: userData,
        message: "User fetched successfully",
        code: "USER_FETCHED",
      })
    );
  } catch (err) {
    console.error("Get User By Email Error:", err);
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
      })
    );
  }
};

export const getUsersByRole = async (req, res) => {
  try {
    const { role, page, limit } = req.query;

    if (!role) {
      return res.status(400).json(
        failure({
          message: "Role is required",
          code: "VALIDATION_ERROR",
        })
      );
    }

    const query = { role, deletedAt: null };

    const paginationResult = await customPaginate(User, query, { page, limit, sort: { createdAt: -1 } });

    return res.status(200).json(
      success({
        data: paginationResult.results,
        meta: {
          page: paginationResult.page,
          limit: paginationResult.limit,
          total: paginationResult.total,
          totalPages: paginationResult.totalPages,
        },
        message: `Users with role "${role}" fetched successfully`,
        code: "USERS_FETCHED_BY_ROLE",
      })
    );
  } catch (err) {
    console.error("Get Users By Role Error:", err);
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
      })
    );
  }
};

export const getTrashedUsers = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const query = { deletedAt: { $ne: null } };

    const paginationResult = await customPaginate(User, query, { page, limit, sort: { deletedAt: -1 } });

    return res.status(200).json(
      success({
        data: paginationResult.results,
        meta: {
          page: paginationResult.page,
          limit: paginationResult.limit,
          total: paginationResult.total,
          totalPages: paginationResult.totalPages,
        },
        message: "Trashed users fetched successfully",
        code: "TRASHED_USERS_FETCHED",
      })
    );
  } catch (err) {
    console.error("Get Trashed Users Error:", err);
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
      })
    );
  }
};


export const trashUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, deletedAt: null });

    if (!user) {
      return res.status(404).json(
        failure({
          message: "User not found or already trashed",
          code: "USER_NOT_FOUND",
        })
      );
    }

    user.deletedAt = new Date();
    await user.save();

    return res.status(200).json(
      success({
        data: user,
        message: "User trashed successfully",
        code: "USER_TRASHED",
      })
    );
  } catch (err) {
    console.error("Trash User Error:", err);
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
      })
    );
  }
};

export const restoreUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, deletedAt: { $ne: null } });

    if (!user) {
      return res.status(404).json(
        failure({
          message: "User not found or already active",
          code: "USER_NOT_FOUND",
        })
      );
    }

    user.deletedAt = null;
    await user.save();

    return res.status(200).json(
      success({
        data: user,
        message: "User restored successfully",
        code: "USER_RESTORED",
      })
    );
  } catch (err) {
    console.error("Restore User Error:", err);
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
      })
    );
  }
};

export const permanentDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow permanent delete if user is trashed
    const user = await User.findOne({ _id: id, deletedAt: { $ne: null } });

    if (!user) {
      return res.status(404).json(
        failure({
          message: "User not found or not trashed",
          code: "USER_NOT_IN_TRASH",
        })
      );
    }

    await User.deleteOne({ _id: id });

    return res.status(200).json(
      success({
        message: "User permanently deleted",
        code: "USER_PERMANENTLY_DELETED",
      })
    );
  } catch (err) {
    console.error("Permanent Delete User Error:", err);
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
      })
    );
  }
};
