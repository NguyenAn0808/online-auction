import Answer from "../models/Answer.js";
import ProductModel from "../models/product.model.js";
import Question from "../models/Question.js";
import * as EmailService from "../services/emailService.js";

export const createAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionId } = req.params;
    const { answerText } = req.body;
    if (!questionId || !answerText) {
      return res
        .status(400)
        .json({ success: false, message: "Missing questionId or answerText" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    const productData = await Question.getProductOwner(questionId);

    if (productData.seller_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to answer this question",
      });
    }

    const answer = await Answer.create({
      productId: question.productId,
      userId,
      answerText,
      questionId,
    });

    // Send email to question asker about the answer
    (async () => {
      try {
        const product = await ProductModel.findById(question.productId);

        // Get all questions on this product
        const allQuestionsOnProduct = await Question.findAllByProduct(
          question.productId
        );

        const allAsker = new Set(allQuestionsOnProduct.map((q) => q.userId));

        for (const askerId of allAsker) {
          if (askerId !== userId) {
            // Avoid sending email to self
            const asker = await User.findById(askerId);

            if (asker?.email) {
              await EmailService.sendAnswerNotification(
                asker.email,
                product.name,
                answerText
              );
            }
          }
        }
      } catch (error) {
        console.error("Failed to send Answer emails:", error);
      }
    })();

    return res.status(201).json({ success: true, data: answer });
  } catch (error) {
    console.error("Error in create answer:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { answerId } = req.params;
    const { answerText } = req.body;

    if (!answerText) {
      return res
        .status(400)
        .json({ success: false, message: "Missing answerText" });
    }

    const updatedAnswer = await Answer.update({ answerId, userId, answerText });

    if (!updatedAnswer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found or permission denied",
      });
    }

    return res.status(200).json({ success: true, data: updatedAnswer });
  } catch (error) {
    console.error("Error updating answer:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { answerId } = req.params;

    const deletedAnswer = await Answer.delete({ answerId, userId });

    if (!deletedAnswer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found or permission denied",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Answer deleted successfully" });
  } catch (error) {
    console.error("Error deleting answer:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getAnswersByQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const answers = await Answer.findAllByQuestion(questionId);
    return res.status(200).json({ success: true, data: answers });
  } catch (error) {
    console.error("Error in get answer by question:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
