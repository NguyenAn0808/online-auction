import ProductModel from "../models/product.model.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import * as EmailService from "./emailService.js";

export const createQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { questionText } = req.body;
    if (!productId || !questionText) {
      return res
        .status(400)
        .json({ success: false, message: "Missing productId or questionText" });
    }
    const question = await Question.create({ productId, userId, questionText });

    // Send email to seller about new question
    (async () => {
      try {
        const product = await ProductModel.findById(productId);

        if (product) {
          const seller = await User.findById(product.seller_id);

          if (seller?.email) {
            await EmailService.sendQuestionNotification(
              seller.email,
              product.name,
              questionText
            );
          }
        }
      } catch (error) {
        console.error("Failed to send Question email:", error);
      }
    })();

    return res.status(201).json({ success: true, data: question });
  } catch (error) {
    console.error("Error in create question:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionId } = req.params;
    const { questionText } = req.body;

    if (!questionText) {
      return res
        .status(400)
        .json({ success: false, message: "Missing questionText" });
    }

    const updatedQuestion = await Question.update({
      questionId,
      userId,
      questionText,
    });

    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found or you are not authorized to edit it",
      });
    }

    return res.status(200).json({ success: true, data: updatedQuestion });
  } catch (error) {
    console.error("Error in update question:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionId } = req.params;

    const deletedQuestion = await Question.delete({ questionId, userId });

    if (!deletedQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found or you are not authorized to delete it",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getQuestionsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const questions = await Question.findAllByProduct(productId);
    return res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error("Error in get questions by product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
