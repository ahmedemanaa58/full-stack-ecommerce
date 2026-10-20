const router = require("express").Router();

const productController = require("../controllers/productController");

const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateMiddleware } = require("../middlewares/validatorMiddleware");
const {
  idValidatorMiddleware,
} = require("../middlewares/idValidatorMiddleware");
const { roleMiddleware } = require("../middlewares/roleMiddleware");

//req controller
const orderController = require("../controllers/orderController");
const {
  createOrderSchema,
  updateOrderStatusSchema,
} = require("../validation/orderValidation");

//find order (ADMIN)
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  orderController.findOrders,
);
//get my  order
router.get("/me", authMiddleware, orderController.findMyOrders);

//find order by id
router.get(
  "/:id",
  authMiddleware,
  idValidatorMiddleware,
  orderController.findOrderById,
);
//create order
router.post(
  "/",
  authMiddleware,
  validateMiddleware(createOrderSchema),
  orderController.createOrder,
);

//update status
router.patch(
  "/:id/status",
  authMiddleware,
  idValidatorMiddleware,
  validateMiddleware(updateOrderStatusSchema),
  orderController.updateOrderStatus,
);

//cancel order
router.delete(
  "/:id",
  authMiddleware,
  idValidatorMiddleware,
  orderController.removeOrder,
);

module.exports = router;
