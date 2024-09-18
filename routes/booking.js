import express from "express";
import pool from "../db.js";

const router = express.Router();

// Create Booking
router.post("/createBooking", async (req, res, next) => {
  try {
    const { customerId, listingId, startDate, endDate, totalPrice } = req.body;

    if (!customerId || !listingId || !startDate || !endDate || !totalPrice) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const saveBooking = await pool.query(
      "INSERT INTO bookings (user_id, listing_id, start_date, end_date, total_price) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [customerId, listingId, startDate, endDate, totalPrice]
    );

    res.status(201).json(saveBooking.rows[0]);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Get booking (i.e. reservations)
router.get("/:userId/myBookings", async (req, res, next) => {
  const { userId } = req.params;
  try {
    userBookings = await pool.query(
      "SELECT * FROM bookings WHERE user_id = $1",
      [userId]
    );
    res.status(202).json(userBookings.rows);
  } catch (error) {
    console.error(error);
    res.status(400).josn({
      message: "Failed to retrieve your bookings",
      err: error.message,
    });
  }
});

export default router;
