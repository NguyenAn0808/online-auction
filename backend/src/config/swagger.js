import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Online Auction API",
      version: "1.0.0",
      description: "API documentation for Online Auction backend",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5001}`,
        description: "Local server",
      },
    ],
    components: {
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
      },
      securitySchemes: {
        // placeholder for future auth (e.g., bearerAuth)
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    tags: [
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
    ],
  },
  // Point to source files for JSDoc annotations
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
