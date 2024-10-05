import { getClient } from "../db.js"; 
import { createCategoryIfNotExists, createTypeIfNotExists, insertLocation, insertListingFacilities, insertPhotos } from '../services/listingService.js';
import dotenv from "dotenv";
dotenv.config();
export const createListing = async (req, res, next) => {
  const client = await getClient();
  
  // Extracting user ID from req.user (provided after authentication)
  const userId = req.user.id;

  try {
  
    await client.query('BEGIN');

    // Data received using formData is all in string format. Therefore I need to parse any non primtive data type manaully.
    const { category, type } = req.body;

    let location, counts, amenities, description;

    location = JSON.parse(req.body.location);   
    counts = JSON.parse(req.body.counts);       
    amenities = JSON.parse(req.body.amenities); 
    description = JSON.parse(req.body.description); 


    // 1. Handle category insertion/retrieval
    const categoryId = await createCategoryIfNotExists(client, category);

    // 2. Handle type insertion/retrieval
    const typeId = await createTypeIfNotExists(client, type);

    // 3. Handle location insertion
    const locationId = await insertLocation(client, location);

    // 4. Insert the listing
    const insertListingResult = await client.query(
      `INSERT INTO listings (
        user_id, category_id, type_id, location_id, title, description, highlight, highlight_desc, price, guests, bedrooms, beds, bathrooms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
      [userId, categoryId, typeId, locationId, description.title, description.description, description.highlight, description.highlightDesc, description.price, counts.Guests, counts.Bedrooms, counts.Beds, counts.Bathrooms]
    );
    const listingId = insertListingResult.rows[0].id;

    // 5. Insert amenities (facilities)
    await insertListingFacilities(client, listingId, amenities);

// stores S3 URL
const photos = req.files.map(file => file.location); // S3 URL for each image

    
    // Extract uploaded photo using file paths 
    // const photos = req.files.map(file => `/uploads/${file.filename}`); // Generate file paths
    // const photos = req.files; // Generate file paths with full path link i.e desktop/ we don't want this because then we can't access the photos on our app.
    console.log('photos:', photos);
    console.log('Uploaded file path:', req.files.map(file => file.path));
    await insertPhotos(client, listingId, photos);

  
    await client.query('COMMIT');

    return res.status(201).json({ message: 'Listing created successfully', listingId });
    next()
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'An error occurred while creating the listing.' });
  } finally {
    client.release();
  }
};
