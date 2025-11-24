import express from "express";
import {
  createQuestion,
  deleteQuestion,
  getQuestionsByProduct,
  updateQuestion,
} from "../controllers/questionController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * @openapi
 * /api/products/{productId}/questions:
 *   post:
 *     summary: Create a question for a specific product
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: productId
 *       schema:
 *       type: string
 *       format: uuid
 *       required: true
 *       description: ID of product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestionRequest'
 *     responses:
 *       201:
 *          description: Question created successfully
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionResponse'
 *       400:
 *          description: Missing productId or questionText
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *        description: Internal server error
 */

router.post(
  "/products/:productId/questions",
  authenticate,
  authorize("bidder"),
  createQuestion
);

/**
 * @openapi
 * /api/questions/{questionId}:
 *   patch:
 *     summary: Update a question
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: questionId
 *       schema:
 *       type: string
 *       format: uuid
 *       required: true
 *       description: ID of question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText:
 *                type: string
 *     responses:
 *       200:
 *          description: Question updated successfully
 *       400:
 *          description: Missing question text
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *          description: Question not found or you are not authorized to edit it
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *        description: Internal server error
 */
router.patch(
  "/questions/:questionId",
  authenticate,
  authorize("bidder"),
  updateQuestion
);

/**
 * @openapi
 * /api/questions/{questionId}:
 *   delete:
 *     summary: delete a question
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: questionId
 *       schema:
 *       type: string
 *       format: uuid
 *       required: true
 *       description: ID of question
 *     responses:
 *       200:
 *          description: Question updated successfully
 *       404:
 *          description: Question not found or you are not authorized to delete it
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *        description: Internal server error
 */
router.delete(
  "/questions/:questionId",
  authenticate,
  authorize("bidder"),
  deleteQuestion
);

/**
 * @openapi
 * /api/products/{productId}/questions:
 *   get:
 *      summary: Get all questions for a specific product
 *      tags: [Q&A]
 *      parameters:
 *      - in: path
 *        name: productId
 *        required: true
 *        schema:
 *        type: string
 *        format: uuid
 *        description: The unique ID of the product
 *      responses:
 *        200:
 *            description: List of questions retrieved successfully
 *            content:
 *             application/json:
 *              schema:
 *               type: object
 *               properties:
 *                 success:
 *                  type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                      $ref: '#/components/schemas/QuestionResponse'
 *        500:
 *             description: Internal server error
 *             content:
 *             application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/products/:productId/questions", getQuestionsByProduct);

export default router;
