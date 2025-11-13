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
          required: ["username", "password", "email", "fullName"],
          properties: {
            username: {
              type: "string",
              example: "john_doe",
              description: "Unique username",
            },
            password: {
              type: "string",
              format: "password",
              example: "password123",
              minLength: 6,
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            fullName: {
              type: "string",
              example: "John Doe",
            },
            phone: {
              type: "string",
              example: "+1234567890",
            },
            address: {
              type: "string",
              example: "123 Main St New York",
            },
            birthdate: {
              type: "string",
              format: "date",
              example: "1990-01-01",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
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
              example: 1,
            },
            username: {
              type: "string",
              example: "john_doe",
            },
            email: {
              type: "string",
              example: "john@example.com",
            },
            fullName: {
              type: "string",
              example: "John Doe",
            },
            role: {
              type: "string",
              enum: ["bidder", "seller", "admin"],
              example: "bidder",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "User ID",
            },
            username: {
              type: "string",
              description: "Username",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email",
            },
            fullName: {
              type: "string",
              description: "Full name",
            },
            phone: {
              type: "string",
              description: "Phone number",
            },
            address: {
              type: "string",
              description: "Address",
            },
            birthdate: {
              type: "string",
              format: "date",
              description: "Birth date",
            },
            role: {
              type: "string",
              description: "User role",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation successful",
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
