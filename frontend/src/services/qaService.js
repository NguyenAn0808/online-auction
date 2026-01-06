import api from "./api";

const QA_API = {
  // Get all questions (and nested answers) for a product
  getQuestions: async (productId) => {
    return await api.get(`/api/products/${productId}/questions`);
  },

  // Ask a question
  askQuestion: async (productId, questionText) => {
    return await api.post(`/api/products/${productId}/questions`, {
      questionText,
    });
  },

  // Reply to a question (Seller only)
  replyToQuestion: async (questionId, answerText) => {
    // Note: Matches your answerRoute.js path
    return await api.post(`/api/questions/${questionId}/answer`, {
      answerText,
    });
  },

  updateQuestion: async (questionId, questionText) => {
    return await api.patch(`/api/questions/${questionId}`, { questionText });
  },

  updateAnswer: async (answerId, answerText) => {
    return await api.patch(`/api/answers/${answerId}`, { answerText });
  },

  deleteQuestion: async (questionId) => {
    return await api.delete(`/api/questions/${questionId}`);
  },

  deleteAnswer: async (answerId) => {
    return await api.delete(`/api/answers/${answerId}`);
  },
};

export default QA_API;
