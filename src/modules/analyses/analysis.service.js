import Order from "../orders/order.model.js";
import user from "../users/user.model.js";

export const averageOrderValue = async () =>
  await Order.aggregate([
    { $match: { status: "paid" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$pricing.total" },
        totalOrders: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        AOV: {
          $cond: {
            if: { $eq: ["$totalOrders", 0] },
            then: 0,
            else: { $divide: ["$totalRevenue", "$totalOrders"] },
          },
        },
      },
    },
  ]);

export const dailySales = async () =>
  await Order.aggregate([
    // Only include completed/paid orders
    { $match: { status: "paid" } },

    // Flatten the items array — each item becomes its own document
    // e.g. one order with 3 items → 3 documents
    { $unwind: "$items" },

    // Group by day + product to get per-product daily stats
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
          productId: "$items.product",
        },
        // Collect unique order IDs to avoid counting multi-item orders multiple times
        orderIds: { $addToSet: "$_id" },
        unitsSold: { $sum: "$items.quantity" },
        // Collect unique discount entries per order to avoid double-counting
        discountEntries: {
          $addToSet: { orderId: "$_id", amount: "$pricing.discount" },
        },
      },
    },

    // Count distinct orders from the deduplicated orderIds array
    {
      $addFields: {
        orders: { $size: "$orderIds" },
      },
    },

    // Sort and limit early — before $lookup — so we only join 30 documents
    // instead of joining everything and then discarding
    { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
    { $limit: 30 },

    // Join with the products collection to get name, thumbnail, price, etc.
    {
      $lookup: {
        from: "products",
        localField: "_id.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    // $lookup returns an array — unwind it into a single object
    { $unwind: "$product" },

    // Shape each product-day document into the desired format
    {
      $project: {
        _id: 0,
        date: {
          year: "$_id.year",
          month: "$_id.month",
          day: "$_id.day",
        },
        product: {
          id: "$product._id",
          name: "$product.title",
          thumbnail: "$product.thumbnail",
          unitsSold: "$unitsSold",
        },
        orderIds: 1, // carry forward for deduplication in the next $group
        discountEntries: 1, // carry forward for deduplication in the next $group
        orders: 1,
        unitsSold: 1,
        // profit per unit × units sold
        // profit = (price - discount) - cost
        revenue: {
          $multiply: [
            {
              $subtract: [
                { $subtract: ["$product.price", "$product.discount"] },
                "$product.cost",
              ],
            },
            "$unitsSold",
          ],
        },
      },
    },

    // Merge all product-day documents that share the same date into one
    {
      $group: {
        _id: "$date",
        products: { $push: "$product" },
        allOrderIds: { $push: "$orderIds" }, // array of arrays e.g. [[id1, id2], [id1, id3]]
        allDiscountEntries: { $push: "$discountEntries" }, // array of arrays e.g. [[{orderId, amount}], ...]
        totalUnitsSold: { $sum: "$unitsSold" },
        totalRevenue: { $sum: "$revenue" },
      },
    },

    {
      $addFields: {
        // Flatten allOrderIds and deduplicate, then count unique orders per day
        totalOrders: {
          $size: {
            $reduce: {
              input: "$allOrderIds",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
        },
        totalDiscounts: {
          $reduce: {
            // Inner $reduce: flatten array of arrays and deduplicate {orderId, amount} entries
            // so the same order's discount is never counted more than once
            input: {
              $reduce: {
                input: "$allDiscountEntries",
                initialValue: [],
                in: { $setUnion: ["$$value", "$$this"] },
              },
            },
            // Outer $reduce: sum the unique discount amounts
            initialValue: 0,
            in: { $add: ["$$value", "$$this.amount"] },
          },
        },
      },
    },

    // Final output shape — drop internal fields like _id, allOrderIds, allDiscountEntries
    {
      $project: {
        _id: 0,
        date: "$_id",
        products: 1,
        totalOrders: 1,
        totalUnitsSold: 1,
        totalRevenue: { $subtract: ["$totalRevenue", "$totalDiscounts"] }, // apply total discounts to revenue
      },
    },

    // Re-sort after the second $group since grouping disrupts the order
    { $sort: { "date.year": -1, "date.month": -1, "date.day": -1 } },
  ]);
export const monthlySales = async () =>
  await Order.aggregate([
    // Only include completed/paid orders
    { $match: { status: "paid" } },

    // Flatten the items array — each item becomes its own document
    // e.g. one order with 3 items → 3 documents
    { $unwind: "$items" },

    // Group by day + product to get per-product daily stats
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          productId: "$items.product",
        },
        // Collect unique order IDs to avoid counting multi-item orders multiple times
        orderIds: { $addToSet: "$_id" },
        unitsSold: { $sum: "$items.quantity" },
        // Collect unique discount entries per order to avoid double-counting
        discountEntries: {
          $addToSet: { orderId: "$_id", amount: "$pricing.discount" },
        },
      },
    },

    // Count distinct orders from the deduplicated orderIds array
    {
      $addFields: {
        orders: { $size: "$orderIds" },
      },
    },

    // Sort and limit early — before $lookup — so we only join 30 documents
    // instead of joining everything and then discarding
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 },

    // Join with the products collection to get name, thumbnail, price, etc.
    {
      $lookup: {
        from: "products",
        localField: "_id.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    // $lookup returns an array — unwind it into a single object
    { $unwind: "$product" },

    // Shape each product-day document into the desired format
    {
      $project: {
        _id: 0,
        date: {
          year: "$_id.year",
          month: "$_id.month",
        },
        product: {
          id: "$product._id",
          name: "$product.title",
          thumbnail: "$product.thumbnail",
          unitsSold: "$unitsSold",
        },
        orderIds: 1, // carry forward for deduplication in the next $group
        discountEntries: 1, // carry forward for deduplication in the next $group
        orders: 1,
        unitsSold: 1,
        // profit per unit × units sold
        // profit = (price - discount) - cost
        revenue: {
          $multiply: [
            {
              $subtract: [
                { $subtract: ["$product.price", "$product.discount"] },
                "$product.cost",
              ],
            },
            "$unitsSold",
          ],
        },
      },
    },

    // Merge all product-day documents that share the same date into one
    {
      $group: {
        _id: "$date",
        products: { $push: "$product" },
        allOrderIds: { $push: "$orderIds" }, // array of arrays e.g. [[id1, id2], [id1, id3]]
        allDiscountEntries: { $push: "$discountEntries" }, // array of arrays e.g. [[{orderId, amount}], ...]
        totalUnitsSold: { $sum: "$unitsSold" },
        totalRevenue: { $sum: "$revenue" },
      },
    },

    {
      $addFields: {
        // Flatten allOrderIds and deduplicate, then count unique orders per day
        totalOrders: {
          $size: {
            $reduce: {
              input: "$allOrderIds",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
        },
        totalDiscounts: {
          $reduce: {
            // Inner $reduce: flatten array of arrays and deduplicate {orderId, amount} entries
            // so the same order's discount is never counted more than once
            input: {
              $reduce: {
                input: "$allDiscountEntries",
                initialValue: [],
                in: { $setUnion: ["$$value", "$$this"] },
              },
            },
            // Outer $reduce: sum the unique discount amounts
            initialValue: 0,
            in: { $add: ["$$value", "$$this.amount"] },
          },
        },
      },
    },

    // Final output shape — drop internal fields like _id, allOrderIds, allDiscountEntries
    {
      $project: {
        _id: 0,
        date: "$_id",
        products: 1,
        totalOrders: 1,
        totalUnitsSold: 1,
        totalRevenue: { $subtract: ["$totalRevenue", "$totalDiscounts"] }, // apply total discounts to revenue
      },
    },

    // Re-sort after the second $group since grouping disrupts the order
    { $sort: { "date.year": -1, "date.month": -1, "date.day": -1 } },
  ]);
export const yearlySales = async () =>
  await Order.aggregate([
    // Only include completed/paid orders
    { $match: { status: "paid" } },

    // Flatten the items array — each item becomes its own document
    // e.g. one order with 3 items → 3 documents
    { $unwind: "$items" },

    // Group by day + product to get per-product daily stats
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          productId: "$items.product",
        },
        // Collect unique order IDs to avoid counting multi-item orders multiple times
        orderIds: { $addToSet: "$_id" },
        unitsSold: { $sum: "$items.quantity" },
        // Collect unique discount entries per order to avoid double-counting
        discountEntries: {
          $addToSet: { orderId: "$_id", amount: "$pricing.discount" },
        },
      },
    },

    // Count distinct orders from the deduplicated orderIds array
    {
      $addFields: {
        orders: { $size: "$orderIds" },
      },
    },

    // Sort and limit early — before $lookup — so we only join 30 documents
    // instead of joining everything and then discarding
    { $sort: { "_id.year": -1 } },
    { $limit: 10 },

    // Join with the products collection to get name, thumbnail, price, etc.
    {
      $lookup: {
        from: "products",
        localField: "_id.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    // $lookup returns an array — unwind it into a single object
    { $unwind: "$product" },

    // Shape each product-day document into the desired format
    {
      $project: {
        _id: 0,
        date: {
          year: "$_id.year",
        },
        product: {
          id: "$product._id",
          name: "$product.title",
          thumbnail: "$product.thumbnail",
          unitsSold: "$unitsSold",
        },
        orderIds: 1, // carry forward for deduplication in the next $group
        discountEntries: 1, // carry forward for deduplication in the next $group
        orders: 1,
        unitsSold: 1,
        // profit per unit × units sold
        // profit = (price - discount) - cost
        revenue: {
          $multiply: [
            {
              $subtract: [
                { $subtract: ["$product.price", "$product.discount"] },
                "$product.cost",
              ],
            },
            "$unitsSold",
          ],
        },
      },
    },

    // Merge all product-day documents that share the same date into one
    {
      $group: {
        _id: "$date",
        products: { $push: "$product" },
        allOrderIds: { $push: "$orderIds" }, // array of arrays e.g. [[id1, id2], [id1, id3]]
        allDiscountEntries: { $push: "$discountEntries" }, // array of arrays e.g. [[{orderId, amount}], ...]
        totalUnitsSold: { $sum: "$unitsSold" },
        totalRevenue: { $sum: "$revenue" },
      },
    },

    {
      $addFields: {
        // Flatten allOrderIds and deduplicate, then count unique orders per day
        totalOrders: {
          $size: {
            $reduce: {
              input: "$allOrderIds",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
        },
        totalDiscounts: {
          $reduce: {
            // Inner $reduce: flatten array of arrays and deduplicate {orderId, amount} entries
            // so the same order's discount is never counted more than once
            input: {
              $reduce: {
                input: "$allDiscountEntries",
                initialValue: [],
                in: { $setUnion: ["$$value", "$$this"] },
              },
            },
            // Outer $reduce: sum the unique discount amounts
            initialValue: 0,
            in: { $add: ["$$value", "$$this.amount"] },
          },
        },
      },
    },

    // Final output shape — drop internal fields like _id, allOrderIds, allDiscountEntries
    {
      $project: {
        _id: 0,
        date: "$_id",
        products: 1,
        totalOrders: 1,
        totalUnitsSold: 1,
        totalRevenue: { $subtract: ["$totalRevenue", "$totalDiscounts"] }, // apply total discounts to revenue
      },
    },

    // Re-sort after the second $group since grouping disrupts the order
    { $sort: { "date.year": -1, "date.month": -1, "date.day": -1 } },
  ]);

export const totalRevenue = async () =>
  await Order.aggregate([
    // Only include completed/paid orders
    { $match: { status: "paid" } },

    // Flatten the items array — each item becomes its own document
    // e.g. one order with 3 items → 3 documents
    { $unwind: "$items" },

    // Group by day + product to get per-product daily stats
    {
      $group: {
        _id: {
          productId: "$items.product",
        },
        // Collect unique order IDs to avoid counting multi-item orders multiple times
        unitsSold: { $sum: "$items.quantity" },
        // Collect unique discount entries per order to avoid double-counting
        discountEntries: {
          $addToSet: { orderId: "$_id", amount: "$pricing.discount" },
        },
      },
    },

    // Join with the products collection to get name, thumbnail, price, etc.
    {
      $lookup: {
        from: "products",
        localField: "_id.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    // $lookup returns an array — unwind it into a single object
    { $unwind: "$product" },

    // Shape each product-day document into the desired format
    {
      $project: {
        _id: 0,
        discountEntries: 1, // carry forward for deduplication in the next $group
        revenue: {
          $multiply: [
            {
              $subtract: [
                { $subtract: ["$product.price", "$product.discount"] },
                "$product.cost",
              ],
            },
            "$unitsSold",
          ],
        },
      },
    },

    // Merge all product-day documents that share the same date into one
    {
      $group: {
        _id: "$date",
        allDiscountEntries: { $push: "$discountEntries" }, // array of arrays e.g. [[{orderId, amount}], ...]
        totalRevenue: { $sum: "$revenue" },
      },
    },

    {
      $addFields: {
        totalDiscounts: {
          $reduce: {
            // Inner $reduce: flatten array of arrays and deduplicate {orderId, amount} entries
            // so the same order's discount is never counted more than once
            input: {
              $reduce: {
                input: "$allDiscountEntries",
                initialValue: [],
                in: { $setUnion: ["$$value", "$$this"] },
              },
            },
            // Outer $reduce: sum the unique discount amounts
            initialValue: 0,
            in: { $add: ["$$value", "$$this.amount"] },
          },
        },
      },
    },

    // Final output shape — drop internal fields like _id, allOrderIds, allDiscountEntries
    {
      $project: {
        _id: 0,
        totalRevenue: { $subtract: ["$totalRevenue", "$totalDiscounts"] }, // apply total discounts to revenue
      },
    },
  ]);

export const topProducts = async () =>
  await Order.aggregate([
    { $match: { status: "paid" } },

    { $unwind: "$items" },

    {
      $group: {
        _id: "$items.product",
        unitsSold: { $sum: "$items.quantity" },
      },
    },

    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        name: "$product.title",
        unitsSold: 1,
        thumbnail: "$product.thumbnail",
        revenue: {
          $multiply: [
            { $subtract: ["$product.price", "$product.cost"] },
            "$unitsSold",
          ],
        },
      },
    },
    { $sort: { revenue: -1 } },

    { $limit: 10 },
  ]);

export const newCustomersCount = async (lastDaysCount = 1) => {
  return await user
    .find({
      createdAt: {
        $gte: new Date(Date.now() - lastDaysCount * 24 * 60 * 60 * 1000),
      },
    })
    .countDocuments();
};

export const CustomersCount = async () => await user.find().countDocuments();

export const OrdersCount = async () => await Order.find().countDocuments();
