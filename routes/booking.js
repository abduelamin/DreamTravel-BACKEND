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
    const userBookings = await pool.query(
      "SELECT * FROM bookings WHERE user_id = $1",
      [userId]
    );
    res.status(202).json(userBookings.rows);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Failed to retrieve your bookings",
      err: error.message,
    });
  }
});


router.get("/:userId/myBookingsWithDetails", async (req, res) => {
  const { userId } = req.params;
  try {
    const userBookings = await pool.query(
      `SELECT 
         b.id AS booking_id, b.start_date, b.end_date, b.total_price, 
         l.id AS listing_id, l.title, l.price, 
         array_agg(DISTINCT p.photo_url) AS photos 
       FROM bookings b 
       LEFT JOIN listings l ON b.listing_id = l.id 
       LEFT JOIN photos p ON l.id = p.listing_id 
       WHERE b.user_id = $1 
       GROUP BY b.id, l.id`,
      [userId]
    );

    if (userBookings.rows.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    // Normalize photo URLs
    const bookingsWithNormalizedPhotos = userBookings.rows.map((booking) => {
      booking.photos = booking.photos.map((photoUrl) => {
        const normalizedPath = photoUrl.replace(
          "C:/Users/Home/Desktop/My react projects/FS Real estate app/ElaminEstate-BACKEND/",
          ""
        ).replace(/\\/g, "/");

        return `http://localhost:8000/uploads/${normalizedPath}`;
      });
      return booking;
    });

    res.status(200).json(bookingsWithNormalizedPhotos);
  } catch (error) {
    console.error("Error fetching user bookings with details:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});


export default router;
