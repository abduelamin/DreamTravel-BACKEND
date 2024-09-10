// This is for fetching listings both  on the homepage and on the users 'my properties'

import pool from "../db.js";

// homepageListings controller
export const homepageListings = async (req, res, next) => {
  const queryCategory = req.query.category; // Extract the 'category' query parameter

  try {
    let listings;

    if (!queryCategory || queryCategory === "All") {
      // If no category or 'All' is provided, return all listings
      listings = await pool.query("SELECT * FROM listings");
    } else {
      // Perform a JOIN between listings and categories to get listings by category name
      listings = await pool.query(
        `SELECT listings.*, categories.name
         FROM listings
         INNER JOIN categories ON listings.category_id = categories.id
         WHERE categories.name = $1;`,
        [queryCategory] 
      );
    }

    res.status(200).json(listings.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error: Failed to retrieve listings" });
  }
};
