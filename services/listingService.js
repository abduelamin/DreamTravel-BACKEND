import { getClient } from "../db.js"; 
const client = await getClient();

// Service for handling category creation/retrieval
export const createCategoryIfNotExists = async (client, categoryName) => {
  const categoryResult = await client.query(
    "SELECT id FROM categories WHERE name = $1",
    [categoryName]
  );

  if (categoryResult.rows.length > 0) {
    return categoryResult.rows[0].id;
  }

  const insertCategoryResult = await client.query(
    "INSERT INTO categories (name) VALUES ($1) RETURNING id",
    [categoryName]
  );

  return insertCategoryResult.rows[0].id;
};

// Service for handling type creation/retrieval
export const createTypeIfNotExists = async (client, typeName) => {
  const typeResult = await client.query(
    "SELECT id FROM types WHERE name = $1",
    [typeName]
  );

  if (typeResult.rows.length > 0) {
    return typeResult.rows[0].id;
  }

  const insertTypeResult = await client.query(
    "INSERT INTO types (name, description) VALUES ($1, $2) RETURNING id",
    [typeName, ""]
  );

  return insertTypeResult.rows[0].id;
};

// Service for handling location insertion
export const insertLocation = async (client, location) => {
  try {
    const locationResult = await client.query(
      "INSERT INTO locations (street_address, apt_suite, city, province, country) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [
        location.streetAddress,
        location.aptSuite,
        location.city,
        location.province,
        location.country,
      ]
    );
    return locationResult.rows[0].id;
  } catch (error) {
    console.log("locationInsertionError:", error);
  }
};

// Service for handling amenities insertion to facilities and join table
export const insertListingFacilities = async (client, listingId, amenities) => {
  const amenityInsertPromises = amenities.map(async (amenity) => {
    // Check if the amenity already exists in the facilities table
    const facilityResult = await client.query(
      "SELECT id FROM facilities WHERE name = $1",
      [amenity]
    );

    let facilityId;

    if (facilityResult.rows.length === 0) {
      // If the facility doesn't exist, insert it into the facilities table
      const insertFacilityResult = await client.query(
        "INSERT INTO facilities (name) VALUES ($1) RETURNING id",
        [amenity]
      );
      facilityId = insertFacilityResult.rows[0].id;
    } else {
      // If it exists, just get its id
      facilityId = facilityResult.rows[0].id;
    }

    // Insert the facility into listing_facilities
    await client.query(
      "INSERT INTO listing_facilities (listing_id, facility_id) VALUES ($1, $2)",
      [listingId, facilityId]
    );
  });

  await Promise.all(amenityInsertPromises);
};

// Service for handling photo insertion
export const insertPhotos = async (client, listingId, photos) => {
  const photoInsertPromises = photos.map((photoUrl, index) => {
    return client.query(
      "INSERT INTO photos (listing_id, photo_url, order_number) VALUES ($1, $2, $3)",
      [listingId, photoUrl, index + 1]
    );
  });

  await Promise.all(photoInsertPromises);
};

