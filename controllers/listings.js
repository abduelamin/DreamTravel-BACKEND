// This is for fetching listings both  on the homepage and on the users 'my properties'

import pool from "../db.js";

// homepageListings controller
export const homepageListings = async (req, res, next) => {
  const queryCategory = req.query.category; // Extract the 'category' query parameter

  try {
    let listings;

    if (!queryCategory || queryCategory === "All") {
      // If no category or 'All' is provided, return all listings with their images
      listings = await pool.query(
        // array_agg() is a function used to group all relevant photos to that listing into an array. Without this the photos will be displayed in different rows on the response. This just makes it easier as it allows us to map through the photos. Whenever we use array_agg() we must also use GROUP BY other wise psql will through errors.
        `SELECT listings.*, categories.name AS category_name, array_agg(photos.photo_url) AS photos
         FROM listings
         INNER JOIN categories ON listings.category_id = categories.id
         LEFT JOIN photos ON listings.id = photos.listing_id
         GROUP BY listings.id, categories.name`
      );
    } else {
      // Perform a JOIN between listings, categories, and photos to get listings by category name and their images
      listings = await pool.query(
        `SELECT listings.*, categories.name AS category_name, array_agg(photos.photo_url) AS photos
         FROM listings
         INNER JOIN categories ON listings.category_id = categories.id
         LEFT JOIN photos ON listings.id = photos.listing_id
         WHERE categories.name = $1
         GROUP BY listings.id, categories.name`,
        [queryCategory]
      );
    }

    res.status(200).json(listings.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server Error: Failed to retrieve listings" });
  }
};
