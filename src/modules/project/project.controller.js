import { failure, success } from "../../utils/responseHandler.js";
import { generateSlug } from "../../utils/slugGenerator.js";
import Project from "./project.model.js";

export const addProject = async (req, res) => {

  try {
    const {
      title,
      shortDescription,
      description,
      coverImage,
      images,
      techStack,
      projectType,
      liveUrl,
      githubUrl,
      isFeatured,
      status,
    } = req.body;


    // Required field validation
    // if (!title || !shortDescription || !description || !coverImage || !techStack) {
    //   return res.status(400).json(
    //     failure({
    //       message: "Missing required fields",
    //       code: "VALIDATION_ERROR",
    //     })
    //   );
    // }

    const slug = await generateSlug(title);
    const featured_image = req.file.uploaded;

    const project = await Project.create({
      title,
      slug,
      shortDescription,
      description,
      coverImage,
      images,
      techStack,
      projectType,
      liveUrl,
      githubUrl,
      isFeatured,
      status,
      featured_image,
      createdBy: req?.user?._id, // required by schema
    });

    return res.status(201).json(
      success({
        data: project,
        message: "Project created successfully",
        code: "PROJECT_CREATED",
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

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(
      success({
        data: projects,
        message: "Projects fetched successfully",
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

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)

    if (!project) {
      return res.status(404).json(
        failure({
          message: "Project not found",
          code: "NOT_FOUND",
        })
      );
    }

    return res.status(200).json(
      success({
        data: project,
        message: "Project fetched successfully",
        code: "FETCH_SUCCESS",
      })
    );
  } catch (err) {
    return res.status(500).json(
      failure({
        message: "Invalid project ID",
        code: "INVALID_ID",
        details: err.message,
      })
    );
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    let featured_image = null;

    if (req?.file?.uploaded) {
      featured_image = req.file.uploaded;
    } else if (req?.body?.featured_image) {
      try {
        featured_image =
          typeof req.body.featured_image === "string"
            ? JSON.parse(req.body.featured_image)
            : req.body.featured_image;
      } catch (err) {
        console.error("Invalid featured_image JSON:", err);
        featured_image = null;
      }
    } else {
      featured_image = null;
    }


    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { ...req.body, featured_image },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProject) {
      return res.status(404).json(
        failure({
          message: "Project not found",
          code: "NOT_FOUND",
        })
      );
    }

    return res.status(200).json(
      success({
        data: updatedProject,
        message: "Project updated successfully",
        code: "UPDATE_SUCCESS",
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


export const deleteProject = async (req, res) => {
  try {
    const { ids } = req?.body; // expect an array of tag _id's

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json(
        failure({
          message: "At least one tag ID is required to delete",
          project: "ID_REQUIRED",
        })
      );
    }

    const deletedId = [];
    const notFoundId = [];

    for (let id of ids) {
      const deleted = await Project.findByIdAndDelete(id);

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