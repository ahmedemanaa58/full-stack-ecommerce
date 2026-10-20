const Order = require("../models/Order");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.PAYMENT_SECRET);

exports.findOrders = async function (req, res) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(
      Math.max(Number(req.query.pageSize) || 10, 1),
      100,
    );
    const skip = (page - 1) * pageSize;

    // Search
    const query = {};
    const q = req.query.q;

    if (q) {
      query.$or = [
        {
          shippingAddress: {
            $regex: q,
            $options: "i",
          },
        },
      ];
    }

    // Filter by total amount
    const { maxPrice, minPrice } = req.query;

    if (minPrice || maxPrice) {
      query.totalAmount = {};

      if (minPrice !== undefined && minPrice !== "") {
        query.totalAmount.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined && maxPrice !== "") {
        query.totalAmount.$lte = Number(maxPrice);
      }
    }

    // Sort
    const allowedSorts = ["totalAmount", "createdAt", "status"];
    const allowedOrders = ["asc", "desc"];

    const { sortBy = "createdAt", order = "desc" } = req.query;
    const normalizedOrder = order.toLowerCase();

    if (!allowedSorts.includes(sortBy)) {
      return res.status(400).json({
        message: `Invalid sort. Allowed: ${allowedSorts.join(", ")}`,
      });
    }

    if (!allowedOrders.includes(normalizedOrder)) {
      return res.status(400).json({
        message: `Invalid order. Allowed: ${allowedOrders.join(", ")}`,
      });
    }

    const sort = {
      [sortBy]: normalizedOrder === "asc" ? 1 : -1,
    };

    // Find orders
    const orders = await Order.find(query)
      .populate("items.product")
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    const totalOrders = await Order.countDocuments(query);

    return res.status(200).json({
      orders,
      pagination: {
        page,
        pageSize,
        totalOrders,
        totalPages: Math.ceil(totalOrders / pageSize),
      },
    });
  } catch (error) {
    console.log(`DEBUG ERROR: FIND ORDERS ${error}`);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.findOrderById = async function (req, res) {
  try {
    const id = req.params.id;

    const order = await Order.findById(id).populate("items.product");

    if (!order) return res.status(404).json({ message: "order not found" });

    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "unauthorized" });
    }
    return res.status(200).json(order);
  } catch (error) {
    console.log(`DEBUG ERROR : FIND ORDER BY ID ${error}`);
    res.status(500).json({ message: "internal server error" });
  }
};

exports.findMyOrders = async function (req, res) {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId }).populate("items.product");
    res.status(200).json({ orders });
  } catch (error) {
    console.log(`DEBUG ERROR : FIND MY ORDERS ${error}`);
    res.status(500).json({ message: "internal server error" });
  }
};

exports.createOrder = async function (req, res) {
  try {
    console.log("CREATE ORDER CONTROLLER REACHED");

    const { items } = req.value;
    const userId = req.user.id;
    let orderItem = [];
    let lineItems = [];
    let totalAmount = 0;

    for (let item of items) {
      // Find product
      const product = await Product.findById(item.product);

      // Check if product exists
      if (!product) {
        return res.status(404).json({ message: "product not found" });
      }

      // Get stock level
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: "product out of stock" });
      }

      // Decrement stock (preserving original behavior)
      product.stock -= item.quantity;
      await product.save();

      // Add order item
      orderItem.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      // Update total amount
      totalAmount += product.price * item.quantity;

      // Resolve thumbnail URL for Stripe
      const thumbnail = product.thumbnail;
      console.log("PRODUCT:", product.title);
      console.log("THUMBNAIL:", product.thumbnail);
      console.log("SERVER_URL:", process.env.SERVER_URL);
      let imageUrl = null;

      if (typeof thumbnail === "string" && thumbnail.trim()) {
        if (/^https?:\/\//i.test(thumbnail)) {
          // Thumbnail is already a URL
          imageUrl = thumbnail;
        } else if (process.env.SERVER_URL) {
          // Convert a local uploads path to a public URL
          const filename = thumbnail
            .replace(/\\/g, "/")
            .replace(/^\/+/, "")
            .replace(/^uploads\//, "");

          if (filename && !filename.includes("..")) {
            const encodedFilename = filename
              .split("/")
              .map((part) => encodeURIComponent(part))
              .join("/");

            imageUrl = `${process.env.SERVER_URL.replace(/\/+$/, "")}/uploads/${encodedFilename}`;
          }
        }
      }

      if (!imageUrl && thumbnail) {
        console.warn(`Stripe image URL unavailable for product ${product._id}`);
      }

      // Add exactly one Stripe line item per product
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.title || "Product",
            description: product.description || undefined,
            ...(imageUrl ? { images: [imageUrl] } : {}),
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      });
    }

    // Create order (original behavior)
    const order = await Order.create({
      ...req.value,
      user: userId,
      items: orderItem,
      totalAmount,
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    // Create Stripe Checkout Session
    const paymentSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,

      // For client
      success_url: `${clientUrl}/orders/success`,
      cancel_url: `${clientUrl}/orders/cancel`,

      // For webhook
      metadata: { orderId: order._id.toString() },
    });

    return res.status(201).json({
      order,
      url: paymentSession.url,
    });
  } catch (error) {
    console.log(`DEBUG ERROR : CREATE ORDER ${error}`);
    return res.status(500).json({
      message: "internal server error",
    });
  }
};

exports.updateOrderStatus = async function (req, res) {
  try {
    const { status } = req.value;
    const id = req.params.id;

    // 1. Update order status in DB
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    // 2. Prepare notification payload
    const orderCode = String(order._id).slice(-7).toUpperCase();
    const title = `Order #${orderCode} Updated`;
    const message = `Your order status has been updated to "${status}".`;

    // 3. Create notification record in DB
    try {
      await Notification.create({
        user: order.user,
        title,
        message,
        type: "order_status",
      });
    } catch (notifErr) {
      console.log(`DEBUG ERROR : CREATE NOTIFICATION ${notifErr}`);
    }

    // 4. Emit real-time socket event to the customer room
    const io = req.app.get("io");
    if (io) {
      io.to(String(order.user)).emit("notification", {
        title,
        message,
        orderId: order._id,
        status,
        createdAt: new Date(),
      });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.log(`DEBUG ERROR : UPDATE ORDER STATUS ${error}`);
    res.status(500).json({ message: "internal server error" });
  }
};

exports.removeOrder = async function (req, res) {
  try {
    const id = req.params.id;

    const order = await Order.findByIdAndUpdate(
      id,
      { status: "canceled" },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    // Prepare notification payload
    const orderCode = String(order._id).slice(-7).toUpperCase();
    const title = `Order #${orderCode} Canceled`;
    const message = `Your order #${orderCode} has been canceled.`;

    try {
      await Notification.create({
        user: order.user,
        title,
        message,
        type: "order_status",
      });
    } catch (notifErr) {
      console.log(`DEBUG ERROR : CREATE NOTIFICATION ${notifErr}`);
    }

    const io = req.app.get("io");
    if (io) {
      io.to(String(order.user)).emit("notification", {
        title,
        message,
        orderId: order._id,
        status: "canceled",
        createdAt: new Date(),
      });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.log(`DEBUG ERROR : REMOVE ORDER ${error}`);
    res.status(500).json({ message: "internal server error" });
  }
};
