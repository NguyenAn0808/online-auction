import Answer from "../models/Answer.js";
import ProductModel from "../models/product.model.js";
import Question from "../models/Question.js";
import * as EmailService from "../services/emailService.js";
import User from "../models/User.js";

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

    // Send email to all interested parties about the answer
    (async () => {
      try {
        const product = await ProductModel.findById(question.productId);
        
        // Collect all unique user IDs to notify
        const userIdsToNotify = new Set();
        
        // 1. Add the person who asked this specific question
        userIdsToNotify.add(question.userId);
        
        // 2. Get all bidders on this product
        const Bid = (await import("../models/Bid.js")).default;
        const allBids = await Bid.getByProduct(question.productId);
        allBids.forEach(bid => {
          if (bid.bidder_id) userIdsToNotify.add(bid.bidder_id);
        });
        
        // 3. Get all users who asked questions on this product
        const allQuestions = await Question.findAllByProduct(question.productId);
        allQuestions.forEach(q => {
          if (q.userId) userIdsToNotify.add(q.userId);
        });
        
        // Remove the seller from the list
        userIdsToNotify.delete(userId);
        
        // Send email to each unique user
        for (const recipientUserId of userIdsToNotify) {
          const recipient = await User.findById(recipientUserId);
          
          if (recipient?.email) {
            await EmailService.sendAnswerNotification(
              recipient.email,
              product.name,
              question.questionText,
              answerText,
              question.productId
            );
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
