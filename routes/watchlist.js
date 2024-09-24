import express from "express";
import pool from "../db.js";

const router = express.Router();

// Add property to wishlist
router.post("/wishlist/:userId/:listingId", async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    const result = await pool.query(
      "INSERT INTO watchlist (user_id, listing_id) VALUES ($1, $2) RETURNING *",
      [userId, listingId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get items in watchlist

// Get items in watchlist with full listing details
router.get("/wishlist/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT 
             listings.*, array_agg(photos.photo_url) AS photos
             FROM watchlist
             JOIN listings ON watchlist.listing_id = listings.id
             LEFT JOIN photos ON listings.id = photos.listing_id
             WHERE  watchlist.user_id = $1
             GROUP BY listings.id`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Remove from watchlist

router.delete("/wishlist/:userId/:listingId", async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    await pool.query(
      "DELETE FROM watchlist WHERE user_id = $1 AND listing_id = $2",
      [userId, listingId]
    );
    res.status(204).json({ message: "Property removed from Wish List" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
