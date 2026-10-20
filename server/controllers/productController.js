const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "nasr-store/products",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      },
    );

    stream.end(file.buffer);
  });

exports.createProduct = async (req, res) => {
  try {
    const data = req.value;
    const owner = req.user.id;
    const thumbnailFile = req.files?.thumbnail?.[0];

    if (!thumbnailFile) {
      return res.status(400).json({
        message: "A thumbnail image is required",
      });
    }

    const thumbnail = await uploadToCloudinary(thumbnailFile);

    const images = await Promise.all(
      (req.files?.images || []).map(uploadToCloudinary),
    );

    const product = await Product.create({
      ...data,
      owner,
      thumbnail,
      image: images,
    });

    return res.status(201).json({ product });
  } catch (error) {
    console.error("Create product error:", error.message);

    return res.status(500).json({
      message: "Failed to create product",
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.value, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error.message);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error.message);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "owner",
      "email",
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error("Get product error:", error.message);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.max(Number(req.query.pageSize) || 10, 1);
    const skip = (page - 1) * pageSize;

    const query = {};
    const { q, maxPrice, minPrice, stock, discount, rating, category } =
      req.query;

    if (q) {
      query.title = { $regex: q, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (stock) query.stock = { $gte: Number(stock) };
    if (discount) query.discount = discount;
    if (rating) query.rating = { $gte: Number(rating) };
    if (category) query.category = category;

    const allowedSorts = ["price", "stock", "rating", "discount", "createdAt"];

    const { sortBy = "createdAt", order = "desc" } = req.query;

    if (!allowedSorts.includes(sortBy)) {
      return res.status(400).json({
        message: `Invalid sort field. Allowed fields: ${allowedSorts.join(", ")}`,
      });
    }

    if (!["asc", "desc"].includes(order.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid sort order. Use asc or desc",
      });
    }

    const sort = {
      [sortBy]: order.toLowerCase() === "asc" ? 1 : -1,
    };

    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(pageSize),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "Products retrieved successfully",
      products,
      page,
      limit: pageSize,
      skip,
      total,
    });
  } catch (error) {
    console.error("Get products error:", error.message);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
