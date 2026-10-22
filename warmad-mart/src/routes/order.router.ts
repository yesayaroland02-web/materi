import { Router } from "express";
import {
  createOrderHandler,
  updateOrderStatusHandler,
  getOrderByIdHandler,
  getAllOrdersHandler,
} from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.post("/", createOrderHandler);
orderRouter.get("/", getAllOrdersHandler);
orderRouter.get("/:id", getOrderByIdHandler);
orderRouter.patch("/:id/status", updateOrderStatusHandler);

export default orderRouter;