import pool from "../db.js";

export const listingDetails = async (req, res, next) => {
  const { listingId } = req.params;

  try {
    const fetchListing = await pool.query(
      `SELECT 
                l.id AS listing_id, l.title, l.description, l.highlight, l.highlight_desc, l.price, l.guests, l.bedrooms, l.beds, l.bathrooms,
                u.user_id, u.firstname, u.lastname, u.email, u.profile_picture_url,
                c.name AS category,
                t.name AS type,
                loc.street_address, loc.apt_suite, loc.city, loc.province, loc.country,
                array_agg(DISTINCT p.photo_url) AS photos,
                array_agg(DISTINCT f.name) AS facilities
              FROM listings l
              LEFT JOIN "user" u ON l.user_id = u.user_id
              LEFT JOIN categories c ON l.category_id = c.id
              LEFT JOIN types t ON l.type_id = t.id
              LEFT JOIN locations loc ON l.location_id = loc.id
              LEFT JOIN photos p ON l.id = p.listing_id
              LEFT JOIN listing_facilities lf ON l.id = lf.listing_id
              LEFT JOIN facilities f ON lf.facility_id = f.id
              WHERE l.id = $1
              GROUP BY l.id, u.user_id, c.name, t.name, loc.street_address, loc.apt_suite, loc.city, loc.province, loc.country`,
      [listingId]
    );

    if (fetchListing.rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const listing = fetchListing.rows[0];

    // Normalize the photo paths
    listing.photos = listing.photos.map((photoUrl) => {
      try {
        // Parse JSON-like string if it starts with '{'
        let photoData;
        if (photoUrl.startsWith("{")) {
          photoData = JSON.parse(photoUrl);
        } else {
          // If not JSON, use the path directly
          photoData = { path: photoUrl };
        }

        // Extract the file path and normalize it
        const filePath = photoData.path || photoUrl;
        const normalizedPath = filePath
          .replace(/\\/g, "/") // Replace backslashes with forward slashes
          .replace(/^.*\/uploads\//, ""); // Remove everything before /uploads/

        const match = normalizedPath.match(/.*\.(jpg|jpeg|png|gif|bmp)$/i);
        if (match) {
          return `http://localhost:8000/uploads/${match[0]}`;
        }
        // Parsing of facilities
        listing.facilities = listing.facilities.map((facility) => {
          try {
            // Parse JSON-like string if it starts with '{'
            let facilityData;
            if (facility.startsWith("{")) {
              facilityData = JSON.parse(facility);
            } else {
              // If not JSON, use the data directly
              facilityData = { name: facility };
            }

            // Extract the name and normalize it
            const facilityName = facilityData.name || facility;

            // Return the normalized name
            return facilityName;
          } catch (error) {
            console.error("Error parsing facility data:", error);
            return facility; // Return original if parsing fails
          }
        });
        return `http://localhost:8000/uploads/${normalizedPath}`;
      } catch (error) {
        console.error("Error parsing photo URL:", error);
        return photoUrl; // Fallback in case of error
      }
    });

    return res.status(200).json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
};
