import { Sign } from "crypto";
import { format } from "path";
import swaggerJsdoc from "swagger-jsdoc";
import config from "./settings.js";
import { type } from "os";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Online Auction API",
      version: "1.0.0",
      description: "API documentation for Online Auction backend",
      contact: {
        name: "API Support",
        email: "support@onlineauction.com",
      },
    },
    servers: [
      {
        url: config.CLIENT_URL,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        Category: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            parent_id: { type: "string", nullable: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
          required: ["name"],
        },
        CategoryResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: { $ref: "#/components/schemas/Category" },
            message: { type: "string" },
          },
        },
        CategoryListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Category" },
            },
            count: { type: "integer" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            error: { type: "string" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            seller_id: { type: "string", format: "uuid" },
            category_id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string" },
            start_price: { type: "number" },
            step_price: { type: "number" },
            buy_now_price: { type: "number" },
            start_time: { type: "string", format: "date-time" },
            end_time: { type: "string", format: "date-time" },
            status: { type: "string", enum: ["active", "ended", "deleted"] },
            allow_unrated_bidder: { type: "boolean" },
            auto_extend: { type: "boolean" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            category_name: { type: "string" },
          },
          required: [
            "seller_id",
            "category_id",
            "name",
            "description",
            "start_price",
            "step_price",
            "end_time",
            "auto_extend",
          ],
        },
        ProductResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: { $ref: "#/components/schemas/Product" },
            message: { type: "string" },
          },
        },
        ProductListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/Product" },
            },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer" },
                limit: { type: "integer" },
                total: { type: "integer" },
              },
            },
          },
        },
        ProductImage: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            product_id: { type: "string", format: "uuid" },
            image_url: { type: "string" },
            is_thumbnail: { type: "boolean" },
            position: { type: "integer" },
            created_at: { type: "string", format: "date-time" },
          },
          required: ["product_id", "image_url"],
        },
        // Request schemas
        SignupRequest: {
          type: "object",
          required: ["username", "password", "email", "fullName", "address"],
          properties: {
            username: {
              type: "string",
              example: "john_doe",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 6,
            },
            email: {
              type: "string",
              format: "email",
            },
            fullName: {
              type: "string",
            },
            phone: {
              type: "string",
            },
            address: {
              type: "string",
            },
            birthdate: {
              type: "string",
              format: "date",
            },
            recaptchaToken: {
              type: "string",
              description:
                "reCAPTCHA token from frontend (required if reCAPTCHA is enabled)",
              example: "03AGdBq24PBCd...",
            },
          },
        },
        SignInRequest: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string", format: "password" },
          },
        },
        SignOutRequest: {
          type: "object",
          properties: {
            refreshToken: { type: "string" },
          },
          required: ["refreshToken"],
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string", format: "password" },
            newPassword: { type: "string", format: "password", minLength: 6 },
          },
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
        RefreshRequest: {
          type: "object",
          properties: {
            refreshToken: { type: "string" },
          },
          required: ["refreshToken"],
        },
        VerifyOTPRequest: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            otp: {
              type: "string",
            },
          },
        },
        ResendOTPRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            purpose: {
              type: "string",
              enum: ["signup", "password-reset"],
              default: "signup",
              example: "signup",
              description:
                "Purpose of OTP (defaults to signup if not provided)",
            },
          },
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["email", "otp", "newPassword"],
          properties: {
            email: { type: "string", format: "email" },
            otp: { type: "string" },
            newPassword: { type: "string", format: "password", minLength: 6 },
          },
        },
        AnswerRequest: {
          type: "object",
          required: ["answerText"],
          properties: {
            answerText: { type: "string" },
          },
        },
        QuestionRequest: {
          type: "object",
          required: ["questionText"],
          properties: {
            questionText: { type: "string" },
          },
        },
        AnswerResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            question_id: { type: "string", format: "uuid" },
            userId: {
              type: "integer",
              description: "The ID of the seller who answered",
            },
            answer_text: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        QuestionResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            product_id: { type: "string", format: "uuid" },
            userId: {
              type: "integer",
              description: "The ID of the user who asked the question",
            },
            question_text: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        SignUpResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                email: {
                  type: "string",
                  format: "email",
                },
                requiresOTP: {
                  type: "boolean",
                },
              },
            },
          },
        },
        SignInResponse: {
          type: "object",
          properties: {
            userID: { type: "string" },
            accessToken: { type: "string" },
          },
          required: ["userID", "accessToken"],
        },
        VertifyOTPResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example:
                "Email verified successfully. Welcome to Online Auction!",
            },
            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/UserResponse",
                  description: "User data (only for signup purpose)",
                },
              },
            },
          },
        },
        ResendOTPResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                email: { type: "string", format: "email" },
                expiresIn: { type: "string" },
                purpose: { type: "string" },
              },
            },
          },
        },
        ResetPasswordResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
            },
            message: {
              type: "string",
              example: "User registered successfully",
            },
            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/UserResponse",
                },
                accessToken: {
                  type: "string",
                  description: "JWT access token (15min)",
                },
                refreshToken: {
                  type: "string",
                  description: "Refresh token (7 days)",
                },
              },
            },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            username: {
              type: "string",
            },
            email: {
              type: "string",
            },
            fullName: {
              type: "string",
              example: "John Doe",
            },
            role: {
              type: "string",
              enum: ["bidder", "seller", "admin"],
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
            },
            message: {
              type: "string",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
            },
            message: {
              type: "string",
            },
            data: {
              type: "object",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication endpoints",
      },
      {
        name: "Categories",
        description: "Operations related to categories",
      },
      {
        name: "Products",
        description: "Operations related to products",
      },
      {
        name: "Product Images",
        description: "Operations related to product images",
      },
      {
        name: "Q&A",
        description: "Operations related to questions and answers",
      },
    ],
  },

  // Point to source files for JSDoc annotations
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
