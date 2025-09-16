
import express from "express";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import CommunicationLog from "../models/CommunicationLog.js";

const router = express.Router();

/**
 * Rule-based suggestion (replaces AI)
 */
router.post("/ai/suggest-message", async (req, res) => {
  try {
    const { spends = 0, visits = 0, inactivity = 0 } = req.body.rules || {};

    let message = "Hi {name}, thanks for being with us!";

    if (spends > 1000) {
      message =
        "Hi {name}, you’re one of our top customers! Enjoy a VIP discount on your next purchase ";
    } else if (visits > 5) {
      message =
        "Hi {name}, thanks for visiting us often. Here’s a special reward just for you ";
    } else if (inactivity > 30) {
      message =
        "Hi {name}, we miss you! Come back and get 20% off your next order.";
    } else {
      message = "Hi {name}, check out our latest offers today!";
    }

    res.json({ message });
  } catch (err) {
    console.error("❌ Rule-based message error:", err);
    res.status(500).json({ error: "Message generation failed" });
  }
});

/**
 * Preview audience size
 */
router.post("/segments/preview", async (req, res) => {
  try {
    const { spends = 0, visits = 0, inactivity = 0 } = req.body.rules || {};

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - inactivity);

    const customers = await Customer.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "customer",
          as: "orders",
        },
      },
      {
        $addFields: {
          totalSpends: { $sum: "$orders.amount" },
          totalVisits: { $size: "$orders" },
          lastVisit: { $max: "$orders.date" },
        },
      },
      {
        $match: {
          totalSpends: { $gte: spends },
          totalVisits: { $gte: visits },
          $or: [{ lastVisit: { $lte: cutoff } }, { lastVisit: null }],
        },
      },
    ]);

    res.json({ audienceSize: customers.length });
  } catch (err) {
    console.error("Preview error:", err);
    res.status(500).json({ error: "Failed to preview audience" });
  }
});

/**
 * Save and launch campaign
 */
router.post("/campaigns", async (req, res) => {
  try {
    const { rules, message } = req.body;

    // Find target customers
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (rules.inactivity || 0));

    const customers = await Customer.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "customer",
          as: "orders",
        },
      },
      {
        $addFields: {
          totalSpends: { $sum: "$orders.amount" },
          totalVisits: { $size: "$orders" },
          lastVisit: { $max: "$orders.date" },
        },
      },
      {
        $match: {
          totalSpends: { $gte: rules.spends || 0 },
          totalVisits: { $gte: rules.visits || 0 },
          $or: [{ lastVisit: { $lte: cutoff } }, { lastVisit: null }],
        },
      },
    ]);

    const campaignId = Date.now().toString(); 

    // Log one entry per customer
    const logs = customers.map((c) => ({
      campaignId,
      customerId: c._id,
      message,
      rules,
      status: "SENT", // simulate success
      createdAt: new Date(),
    }));

    if (logs.length > 0) {
      await CommunicationLog.insertMany(logs);
      console.log(`✅ Inserted ${logs.length} logs for campaign ${campaignId}`);
    }

    res.json({ campaignId, audience: customers.length });
  } catch (err) {
    console.error("Campaign creation error:", err);
    res.status(500).json({ error: "Failed to create campaign" });
  }
});

/**
 * Campaign history (grouped view)
 */
router.get("/campaigns", async (_req, res) => {
  try {
    const aggr = await CommunicationLog.aggregate([
      
      {
        $group: {
          _id: "$campaignId",
          createdAt: { $min: "$createdAt" },
          message: { $first: "$message" },
          rules: { $first: "$rules" },
          audience: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ["$status", "SENT"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] } },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.json(
      aggr.map((x) => ({
        campaignId: x._id || "N/A",
        createdAt: x.createdAt,
        message: x.message,
        rules: x.rules,
        audience: x.audience,
        sent: x.sent,
        failed: x.failed,
      }))
    );
  } catch (err) {
    console.error("Error fetching campaign history:", err);
    res.status(500).json({ error: "Failed to fetch campaign history" });
  }
});

/**
 * All communication logs (raw view)
 */
router.get("/logs", async (_req, res) => {
  try {
    const logs = await CommunicationLog.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// Create a new customer
router.post("/customers", async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.json(customer);
  } catch (err) {
    console.error("Error creating customer:", err);
    res.status(500).json({ error: "Failed to create customer" });
  }
});

// Create a new order
router.post("/orders", async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Get all customers (to confirm insert)
router.get("/customers", async (_req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// Get all orders (to confirm insert)
router.get("/orders", async (_req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});


export default router;
