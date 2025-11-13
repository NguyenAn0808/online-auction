import { Sign } from "crypto";
import swaggerJsdoc from "swagger-jsdoc";

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
        url: "http://localhost:8000",
        description: "Local server",
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
        SignInResponse: {
          type: "object",
          properties: {
            userID: { type: "string" },
            accessToken: { type: "string" },
          },
          required: ["userID", "accessToken"],
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
              type: "integer",
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
    security: [],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
