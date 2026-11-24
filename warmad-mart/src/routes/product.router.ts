
import { Router } from "express";

import {
  createProductHandler,
  getAllProductsHandler,
  getProductByIdHandler,
  updateProductHandler,
  deleteProductHandler,
  restoreProductHandler,
} from "../controllers/product.controller.js";

import { createProductSchema } from "../schemas/product.schema.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

import { Role } from "../generated/prisma/index.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const productRouter = Router();

// PUBLIC ROUTES
productRouter.get("/", getAllProductsHandler);
productRouter.get("/:id", getProductByIdHandler);

// ADMIN ROUTES
productRouter.post(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN),
  uploadSingleImage,
  validate(createProductSchema),
  createProductHandler,
);

productRouter.put(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN),
  uploadSingleImage,
  updateProductHandler,
);

productRouter.delete(
  "/:id/soft-delete",
  authenticate,
  authorizeRoles(Role.ADMIN),
  deleteProductHandler,
);

productRouter.put(
  "/:id/restore",
  authenticate,
  authorizeRoles(Role.ADMIN),
  restoreProductHandler,
);

export default productRouter;
