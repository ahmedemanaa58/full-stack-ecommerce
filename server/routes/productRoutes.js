const router = require("express").Router();

const productController = require("../controllers/productController");

const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateMiddleware } = require("../middlewares/validatorMiddleware");
const {
  idValidatorMiddleware,
} = require("../middlewares/idValidatorMiddleware");
const { roleMiddleware } = require("../middlewares/roleMiddleware");
const { productValidation } = require("../validation/productValidation");
const {
  updateProductValidation,
} = require("../validation/updateProductValidation");
const { uploader } = require("../services/upload");

//create
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  uploader.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  validateMiddleware(productValidation),
  productController.createProduct,
);
//update
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  idValidatorMiddleware,
  validateMiddleware(updateProductValidation),
  productController.updateProduct,
);
//delete
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  idValidatorMiddleware,
  productController.deleteProduct,
);

//get products
router.get("/", productController.getProducts);
//get product
router.get("/:id", idValidatorMiddleware, productController.getProduct);
module.exports = router;
