import { newsletterEmailTemplate } from "../../emailtamplate/admin.template.js";
import { customPaginate } from "../../utils/customPaginate.js";
import sendEmail from "../../utils/mailHelper.js";
import { failure, success } from "../../utils/responseHandler.js";
import Newsletter from "./newsletter.model.js";


export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    const existing = await Newsletter.findOne({ email });

    if (existing) {
      return res.status(409).json({ message: "Already subscribed" });
    }
    const data = await Newsletter.create({ email });
    return res.status(200).json(
      success({
        data: data,
        message: "Subscribed",
        code: "CREATED_SUCCESS",
      })
    );

  } catch (err) {
    return res.status(500).json(
      failure({
        message: "internal server error",
        code: "SERVER_ERROR",
        detaisl: err,
      })
    );
  }
};

export const moveToTrash = async (req, res) => {
  try {
    const { id } = req.params;
    await Newsletter.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });

    return res.status(200).json(
      success({
        data: data,
        message: "Moved to trash",
        code: "MOVED",
      })
    );
  } catch (err) {
    return res.status(500).json(
      failure({
        message: "internal server error",
        code: "SERVER_ERROR",
        detaisl: err,
      })
    );
  }
};

export const restoreFromTrash = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Newsletter.findByIdAndUpdate(id, {
      deletedAt: null,
    });
    return res.status(200).json(
      success({
        data: data,
        message: "Restored successfully",
        code: "RESTORED",
      })
    );
  } catch (err) {
    return res.status(500).json(
      failure({
        message: "internal server error",
        code: "SERVER_ERROR",
        detaisl: err,
      })
    );
  }
};

export const permanentDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Newsletter.findByIdAndDelete(id);
    return res.status(200).json(
      success({
        data: data,
        message: "Permanently deleted",
        code: "SUCCESS",
      })
    );
  } catch (err) {
    return res.status(500).json(
      failure({
        message: "internal server error",
        code: "SERVER_ERROR",
        detaisl: err,
      })
    );
  }
};

export const getAllSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const data = await customPaginate(Newsletter, { isBlocked: false }, { page: 1, limit: 10 }, []);
    return res.status(200).json(
      success({
        data: data,
        message: "Fetched Success",
        code: "SUCCESS",
      })
    );
  } catch (error) {
    return res.status(500).json(
      failure({
        message: "internal server error",
        code: "SERVER_ERROR",
        detaisl: error,
      })
    );
  }
};

export const getTrashSubscribers = async (req, res) => {
  try {
    const data = await Newsletter.find({ deletedAt: { $in: null } });
    return res.status(200).json(
      success({
        data: data,
        message: "Fetched Success",
        code: "SUCCESS",
      })
    );
  } catch (error) {
    return res.status(500).json(
      failure({
        message: "Trashed not found",
        code: "NOT_FOUND",
        details: error,
      })
    );
  }
};

export const sendNewsLetterMail = async (req, res) => {
  try {
    const { emails = [], useTemplate, sendToAll = false, subject, message } = req.body
    if ((emails.length < 1 && !sendToAll)) {
      return res.status(404).json(
        failure({
          message: "emails required ",
          code: "NOT_FOUND",
        })
      );
    }
    //!!!!!!!!!!! this is not for production ,
    let recipients = [];
    if (sendToAll) {
      const users = await Newsletter.find(
        { isBlocked: false, deletedAt: null },
        { email: 1 }
      );
      recipients = users.map(u => u.email);
    } else {
      recipients = emails;
    }
    await Promise.all(
      recipients.map(to =>
        sendEmail({
          to,
          subject,
          ...(useTemplate
            ? { html: newsletterEmailTemplate({ message }) }
            : { text: message }),
        })
      )
    );
    return res.status(200).json(
      success({
        message: "Email send succesfully",
        code: "SUCCESS",
      })
    );

  } catch (error) {
    return res.status(500).json(
      failure({
        message: "internal server error",
        code: "SERVER_ERROR",
        details: error,
      })
    );
  }
}