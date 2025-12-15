import api from "./api";

const QA_API = {
  // Get all questions (and nested answers) for a product
  getQuestions: async (productId) => {
    return await api.get(`/products/${productId}/questions`);
  },

  // Ask a question
  askQuestion: async (productId, questionText) => {
    return await api.post(`/products/${productId}/questions`, { questionText });
  },

  // Reply to a question (Seller only)
  replyToQuestion: async (questionId, answerText) => {
    // Note: Matches your answerRoute.js path
    return await api.post(`/questions/${questionId}/answer`, { answerText });
  },
};

export default QA_API;
