import express from "express";
import pool from "../db.js";
const router = express.Router()

router.get("/my-properties/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await pool.query(
        `SELECT 
          listings.*, 
          array_agg(photos.photo_url) AS photos 
        FROM listings 
        LEFT JOIN photos ON listings.id = photos.listing_id 
        WHERE listings.user_id = $1 
        GROUP BY listings.id`,
        [userId]
      );
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  export default router;