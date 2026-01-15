import Service from "./service.model.js";
import { success, failure } from "../../utils/responseHandler.js";
import { customPaginate } from "../../utils/customPaginate.js";

export const addService = async (req, res) => {
    try {
        const { name, description, price, duration } = req?.body;

        // Basic validation
        if (!name || !price || !duration) {
            return res.status(400).json(
                failure({
                    message: "Name, price and duration are required",
                    code: "VALIDATION_ERROR",
                })
            );
        }

        // Check if service already exists (same name & not deleted)
        const existingService = await Service.findOne({
            name: name.trim(),
        });

        if (existingService) {
            return res.status(409).json(
                failure({
                    message: "Service with this name already exists",
                    code: "SERVICE_EXISTS",
                })
            );
        }

        const service = await Service.create({
            name,
            description,
            price,
            duration,

        });

        return res.status(201).json(
            success({
                data: service,
                message: "Service created successfully",
                code: "SERVICE_CREATED",
            })
        );
    } catch (err) {
        console.error("Add Service Error:", err);
        return res.status(500).json(
            failure({
                message: "Internal server error",
                code: "SERVER_ERROR",
            })
        );
    }
};

export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if service exists and is NOT deleted
        const service = await Service.findOne({
            _id: id,
            deletedAt: null,
        });

        if (!service) {
            return res.status(404).json(
                failure({
                    message: "Service not found or already deleted",
                    code: "SERVICE_NOT_FOUND",
                })
            );
        }

        // Update fields
        Object.keys(updateData).forEach((key) => {
            service[key] = updateData[key];
        });

        await service.save();

        return res.status(200).json(
            success({
                data: service,
                message: "Service updated successfully",
                code: "SERVICE_UPDATED",
            })
        );
    } catch (error) {
        console.error(error);
        return res.status(500).json(
            failure({
                message: "Internal server error",
                code: "SERVER_ERROR",
            })
        );
    }
};

export const getAllServices = async (req, res) => {
    try {
        const { page, limit, isActive } = req.query;

        // Base query: exclude soft-deleted services
        const query = {
            deletedAt: null,
        };

        // Optional filter: active / inactive
        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }

        const paginationResult = await customPaginate(
            Service,
            query,
            {
                page,
                limit,
                sort: { createdAt: -1 },
            }
        );

        return res.status(200).json(
            success({
                data: paginationResult.results,
                meta: {
                    page: paginationResult.page,
                    limit: paginationResult.limit,
                    total: paginationResult.total,
                    totalPages: paginationResult.totalPages,
                },
                message: "Services fetched successfully",
                code: "SERVICES_FETCHED",
            })
        );
    } catch (err) {
        console.error("Get Services Error:", err);
        return res.status(500).json(
            failure({
                message: "Internal server error",
                code: "SERVER_ERROR",
            })
        );
    }
};

export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findOne({
            _id: id,
            deletedAt: null,
        });

        if (!service) {
            return res.status(404).json(
                failure({
                    message: "Service not found",
                    code: "SERVICE_NOT_FOUND",
                })
            );
        }

        return res.status(200).json(
            success({
                data: service,
                message: "Service fetched successfully",
                code: "SERVICE_FETCHED",
            })
        );
    } catch (err) {
        console.error("Get Service By ID Error:", err);
        return res.status(500).json(
            failure({
                message: "Internal server error",
                code: "SERVER_ERROR",
            })
        );
    }
};

export const getServiceByName = async (req, res) => {
    try {
        const { name } = req.params;

        const service = await Service.findOne({
            name: name.trim(),
            deletedAt: null,
        });

        if (!service) {
            return res.status(404).json(
                failure({
                    message: "Service not found",
                    code: "SERVICE_NOT_FOUND",
                })
            );
        }

        return res.status(200).json(
            success({
                data: service,
                message: "Service fetched successfully",
                code: "SERVICE_FETCHED",
            })
        );
    } catch (err) {
        console.error("Get Service By Name Error:", err);
        return res.status(500).json(
            failure({
                message: "Internal server error",
                code: "SERVER_ERROR",
            })
        );
    }
};

export const trashService = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findOne({
            _id: id,
            deletedAt: null,
        });

        if (!service) {
            return res.status(404).json(
                failure({
                    message: "Service not found or already deleted",
                    code: "SERVICE_NOT_FOUND",
                })
            );
        }

        service.deletedAt = new Date();
        service.isActive = false;

        await service.save();

        return res.status(200).json(
            success({
                data: service,
                message: "Service moved to trash successfully",
                code: "SERVICE_TRASHED",
            })
        );
    } catch (err) {
        console.error("Trash Service Error:", err);
        return res.status(500).json(
            failure({
                message: "Internal server error",
                code: "SERVER_ERROR",
            })
        );
    }
};

export const restoreService = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findOne({
            _id: id,
            deletedAt: { $ne: null },
        });

        if (!service) {
            return res.status(404).json(
                failure({
                    message: "Service not found or already active",
                    code: "SERVICE_NOT_FOUND",
                })
            );
        }

        service.deletedAt = null;
        service.isActive = true; // restore as active
        await service.save();

        return res.status(200).json(
            success({
                data: service,
                message: "Service restored successfully",
                code: "SERVICE_RESTORED",
            })
        );
    } catch (error) {
        console.error("Restore Service Error:", error);
        return res.status(500).json(
            failure({
                message: "Internal server error",
                code: "SERVER_ERROR",
            })
        );
    }
};

export const getTrashedServices = async (req, res) => {
    try {
        const { page, limit } = req.query;

        const query = {
            deletedAt: { $ne: null },
        };

        const paginationResult = await customPaginate(
            Service,
            query,
            {
                page,
                limit,
                sort: { deletedAt: -1 },
            }
        );

        return res.status(200).json(
            success({
                data: paginationResult.results,
                meta: {
                    page: paginationResult.page,
                    limit: paginationResult.limit,
                    total: paginationResult.total,
                    totalPages: paginationResult.totalPages,
                },
                message: "Trashed services fetched successfully",
                code: "TRASHED_SERVICES_FETCHED",
            })
        );
    } catch (err) {
        console.error("Get Trashed Services Error:", err);
        return res.status(500).json(
            failure({
                message: "Internal server error",
                code: "SERVER_ERROR",
            })
        );
    }
};

export const permanentDeleteService = async (req, res) => {
    try {
        const { id } = req.params;

        // Only allow hard delete if already trashed
        const service = await Service.findOne({
            _id: id,
            deletedAt: { $ne: null },
        });

        if (!service) {
            return res.status(404).json(
                failure({
                    message: "Service not found or not in trash",
                    code: "SERVICE_NOT_IN_TRASH",
                })
            );
        }

        await Service.deleteOne({ _id: id });

        return res.status(200).json(
            success({
                message: "Service permanently deleted",
                code: "SERVICE_PERMANENTLY_DELETED",
            })
        );
    } catch (err) {
        console.error("Permanent Delete Service Error:", err);
        return res.status(500).json(
            failure({
                message: "Internal server error",
                code: "SERVER_ERROR",
            })
        );
    }
};
