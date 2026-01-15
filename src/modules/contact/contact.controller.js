import { contactDetailsEmail } from "../../emailtamplate/auth.tamplate.js";
import { customPaginate } from "../../utils/customPaginate.js";
import sendEmail from "../../utils/mailHelper.js";
import { failure, success } from "../../utils/responseHandler.js";
import Contact from "./contact.model.js";

export const createContact = async (req, res) => {
  try {
    const { name, email, mobile, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }
    const contact = await Contact.create({
      name,
      email,
      mobile,
      subject,
      message,
    });

    console.log("-->> contact created ");

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Contact Request",
      html: contactDetailsEmail(contact.toObject()),
    });
    return res.status(200).json(
      success({
        data: contact,
        message: "Contact created successfully",
        code: "CREATED",
      })
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create contact inquiry",
    });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 10 } = req.query;

    const query = status === "all" ? {} : { status };

    // const contacts = await Contact.find(query)
    //   .sort({ createdAt: -1 })
    //   .skip((page - 1) * limit)
    //   .limit(Number(limit));

    const data = await customPaginate(Contact, query, { page, limit })

    // const total = await Contact.countDocuments(query);

    return res.status(200).json(
      success({
        data: data,
        message: "Contact fetched successfully",
        code: "CONTACT_FETCH_SUCCESS",
      })
    );
  } catch (error) {
    return res.status(500).json(
      failure({
        message: error.message,
        code: "SERVER_ERROR",
        details: error,
      })
    );
  }
};

export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }
    return res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact",
    });
  }
};

export const replyToContact = async (req, res) => {
  try {
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    contact.adminReply = {
      replied: true,
      repliedBy: req.user?._id, // admin user
      repliedAt: new Date(),
      replyMessage,
    };

    await contact.save();

    return res.json({
      success: true,
      message: "Reply saved successfully",
      data: contact,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reply to contact",
    });
  }
};



export const deleteById = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json(
        failure({
          message: "inquiry not found",
          code: "NOT_FOUND",
        })
      );
    }
    return res.status(200).json(
      success({
        data: contact,
        message: "Contact deleted successfully",
        code: "CONTACT_DELETE_SUCCESS",
      })
    );
  } catch (error) {
    return res.status(500).json(
      failure({
        message: error.message,
        code: "SERVER_ERROR",
        details: error,
      })
    );
  }
};
