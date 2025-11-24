import express from "express";
import {
  createAnswer,
  deleteAnswer,
  getAnswersByQuestion,
  updateAnswer,
} from "../controllers/answerController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/questions/{questionId}/answer:
 *   post:
 *     summary: Create an answer for a specific question
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: questionId
 *       schema:
 *        type: string
 *        format: uuid
 *        required: true
 *        description: ID of question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnswerRequest'
 *     responses:
 *       201:
 *          description: Answer created successfully
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnswerResponse'
 *       400:
 *          description: Missing questionId or answerText`
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *          description: Question not found
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *        description: Internal server error
 */
router.post(
  "/questions/:questionId/answer",
  authenticate,
  authorize("seller"),
  createAnswer
);

/**
 * @openapi
 * /api/answers/{answerId}:
 *   patch:
 *     summary: Update an answer
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: answerId
 *       schema:
 *        type: string
 *        format: uuid
 *        required: true
 *        description: ID of answer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                answerText:
 *                  type: string
 *     responses:
 *       200:
 *          description: Answer updated successfully
 *       400:
 *          description: Missing answer text
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *          description: Answer not found or you are not authorized to delete it
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *        description: Internal server error
 */
router.patch(
  "/answers/:answerId",
  authenticate,
  authorize("seller"),
  updateAnswer
);

/**
 * @openapi
 * /api/answers/{answerId}:
 *   delete:
 *     summary: delete an answer
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: answerId
 *       schema:
 *       type: string
 *       format: uuid
 *       required: true
 *       description: ID of answer
 *     responses:
 *       200:
 *          description: Answer updated successfully
 *       404:
 *          description: Answer not found or you are not authorized to delete it
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *        description: Internal server error
 */
router.delete(
  "/answers/:answerId",
  authenticate,
  authorize("seller"),
  deleteAnswer
);

/**
 * @openapi
 * /api/questions/{questionId}/answers:
 *   get:
 *    summary: Get all answers for a specific question
 *    tags: [Q&A]
 *    parameters:
 *    - in: path
 *      name: questionId
 *      required: true
 *      schema:
 *      type: string
 *      format: uuid
 *      description: The unique ID of the question
 *    responses:
 *      200:
 *          description: List of answers retrieved successfully
 *          content:
 *          application/json:
 *           schema:
 *            type: object
 *            properties:
 *             success:
 *              type: boolean
 *              data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AnswerResponse'
 *      500:
 *           description: Internal server error
 *           content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/Error'
 */

router.get("/questions/:questionId/answers", getAnswersByQuestion);

export default router;
