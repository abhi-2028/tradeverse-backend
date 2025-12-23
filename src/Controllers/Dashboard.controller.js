const { HoldingsModel } = require("../model/HoldingsModel");
const { PositionsModel } = require("../model/PositionsModel");
const { OrdersModel } = require("../model/OrdersModel");
const { WatchListModel } = require("../model/WatchListModel");

/* ================= HOLDINGS ================= */
async function allHoldings(req, res) {
  try {
    const holdings = await HoldingsModel.find({ user: req.user.id });
    res.json(holdings);
  } catch {
    res.status(500).json({ message: "Failed to fetch holdings" });
  }
}

/* ================= POSITIONS ================= */
async function allPositions(req, res) {
  try {
    const positions = await PositionsModel.find({ user: req.user.id });
    res.json(positions);
  } catch {
    res.status(500).json({ message: "Failed to fetch positions" });
  }
}

/* ================= ORDERS ================= */
async function allOrders(req, res) {
  try {
    const orders = await OrdersModel.find({ user: req.user.id });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
}

/* ================= NEW ORDER ================= */
async function newOrder(req, res) {
  try {
    const { name, qty, price, mode } = req.body;
    const userId = req.user.id;

    if (!name || !qty || !price || !mode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["BUY", "SELL"].includes(mode)) {
      return res.status(400).json({ message: "Invalid order mode" });
    }

    const quantity = Number(qty);
    const orderPrice = Number(price);

    if (quantity <= 0 || orderPrice <= 0) {
      return res.status(400).json({ message: "Invalid quantity or price" });
    }

    /* 1️⃣ SAVE ORDER */
    await OrdersModel.create({
      user: userId,
      name,
      qty: quantity,
      price: orderPrice,
      mode,
    });

    /* 2️⃣ POSITIONS */
    let position = await PositionsModel.findOne({ user: userId, name });

    if (mode === "SELL" && (!position || position.qty < quantity)) {
      return res.status(400).json({ message: "Insufficient position quantity" });
    }

    if (!position) {
      position = await PositionsModel.create({
        user: userId,
        product: "MIS",
        name,
        qty: quantity,
        avg: orderPrice,
        price: orderPrice,
        net: "0%",
        day: "0%",
        isLoss: false,
      });
    } else {
      if (mode === "BUY") {
        const totalQty = position.qty + quantity;
        position.avg =
          (position.avg * position.qty + orderPrice * quantity) / totalQty;
        position.qty = totalQty;
      } else {
        position.qty -= quantity;
      }

      position.price = orderPrice;

      const pnlPercent =
        ((position.price - position.avg) / position.avg) * 100;

      position.net = `${pnlPercent.toFixed(2)}%`;
      position.day = position.net;
      position.isLoss = pnlPercent < 0;

      if (position.qty === 0) {
        await PositionsModel.deleteOne({ _id: position._id });
      } else {
        await position.save();
      }
    }

    /* 3️⃣ HOLDINGS */
    let holding = await HoldingsModel.findOne({ user: userId, name });

    if (mode === "BUY") {
      if (holding) {
        const totalQty = holding.qty + quantity;
        holding.avg =
          (holding.avg * holding.qty + orderPrice * quantity) / totalQty;
        holding.qty = totalQty;
        holding.price = orderPrice;
        await holding.save();
      } else {
        await HoldingsModel.create({
          user: userId,
          name,
          qty: quantity,
          avg: orderPrice,
          price: orderPrice,
          net: "0%",
          day: "0%",
        });
      }
    } else {
      if (!holding || holding.qty < quantity) {
        return res.status(400).json({ message: "Insufficient holdings" });
      }

      holding.qty -= quantity;

      if (holding.qty === 0) {
        await HoldingsModel.deleteOne({ _id: holding._id });
      } else {
        holding.price = orderPrice;
        await holding.save();
      }
    }

    return res.status(201).json({ message: "Order placed successfully" });
  } catch (error) {
    console.error("Order error:", error);
    return res.status(500).json({ message: "Failed to place order" });
  }
}

/* ================= WATCHLIST ================= */
async function allWatchList(req, res) {
  try {
    const list = await WatchListModel.find({ user: req.user.id });
    res.json(list);
  } catch {
    res.status(500).json({ message: "Failed to fetch watchlist" });
  }
}

async function updateWatchList(req,res) {
  try {
    const stocks = req.body;

    if (!Array.isArray(stocks) || stocks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array",
      });
    }

    // Optional: clear existing watchlist before seeding
    await WatchListModel.deleteMany({});

    const insertedStocks = await WatchListModel.insertMany(stocks);

    res.status(201).json({
      success: true,
      message: "Watchlist seeded successfully",
      count: insertedStocks.length,
      data: insertedStocks,
    });
  } catch (error) {
    console.error("WatchList seed error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/* ================= SUMMARY ================= */
async function getSummary(req, res) {
  try {
    const holdings = await HoldingsModel.find({ user: req.user.id });

    let investment = 0;
    let currentValue = 0;

    holdings.forEach((h) => {
      investment += h.avg * h.qty;
      currentValue += h.price * h.qty;
    });

    const pnl = currentValue - investment;
    const pnlPercent = investment
      ? Number(((pnl / investment) * 100).toFixed(2))
      : 0;

    res.json({
      user: { username: req.user.username },
      equity: {
        availableMargin: 3740,
        usedMargin: 0,
        openingBalance: 3740,
      },
      holdings: {
        count: holdings.length,
        investment: Number(investment.toFixed(2)),
        currentValue: Number(currentValue.toFixed(2)),
        pnl: Number(pnl.toFixed(2)),
        pnlPercent,
      },
    });
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
}

module.exports = {
  allHoldings,
  allPositions,
  allOrders,
  newOrder,
  allWatchList,
  updateWatchList,
  getSummary,
};


