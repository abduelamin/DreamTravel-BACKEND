import express from "express";
import cors from "cors";
import pool from "./db.js";
import { authorize } from "./controllers/authorize.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import path from "path";
import upload from "./middleware/fileUpload.js"; // this is ofr using S3
// import upload, { __dirname } from "./middleware/fileUpload.js"; // this if using local upload
import dotenv from "dotenv";
import { errorHandler } from "./middleware/erroHandler.js";
import { createListing } from "./controllers/createListing.js";
import { homepageListings } from "./controllers/listings.js";
import { listingDetails } from "./controllers/listingDetails.js";
import bookingRoutes from "./routes/booking.js"
import watchlist from "./routes/watchlist.js"
import properties from "./routes/userProperties.js"
const app = express();
dotenv.config();

const allowedOrigins = ['http://localhost:8000', 'https://dreamnesttravel.netlify.app', 'https://dream-travel-five.vercel.app'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files (profile images)
// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// console.log(path.join(__dirname, "../uploads"));

// routes

// Auth routes
// app.post(
//   "/api/register",
//   upload.single("profileImage"),
//   errorHandler,
//   async (req, res, next) => {
//     const { firstname, lastname, email, password } = req.body;
//     const profileImage = req.file ? `/uploads/${req.file.filename}` : null; // Files are not found in req.body

//     try {
//       const userFromDatabase = await pool.query(
//         'SELECT * FROM "user" WHERE email = $1',
//         [email]
//       );

//       if (userFromDatabase.rows.length !== 0) {
//         const error = new Error(`User with ${email} already exists`);
//         error.name = "AlreadyExist";
//         error.status = 400;
//         return next(error);
//       }

//       const salt = await bcrypt.genSalt(10);
//       const bcryptPassword = await bcrypt.hash(password, salt);

//       await pool.query(
//         'INSERT INTO "user" (firstname, lastname, email, password, profile_picture_url) VALUES ($1, $2, $3, $4, $5)',
//         [firstname, lastname, email, bcryptPassword, profileImage]
//       );
//       return res.status(201).json({ message: "New User Added" });
//     } catch (err) {
//       console.log(err);
//       return next(err);
//     }
//   }
// );

// using S3
app.post(
  "/api/register",
  upload.single("profileImage"),
  errorHandler,
  async (req, res, next) => {
    const { firstname, lastname, email, password } = req.body;
    const profileImage = req.file ? req.file.location : null;

   

    try {
      const userFromDatabase = await pool.query(
        'SELECT * FROM "user" WHERE email = $1',
        [email]
      );

      if (userFromDatabase.rows.length !== 0) {
        return next(new Error(`User with ${email} already exists`));
      }

      const salt = await bcrypt.genSalt(10);
      const bcryptPassword = await bcrypt.hash(password, salt);

      await pool.query(
        'INSERT INTO "user" (firstname, lastname, email, password, profile_picture_url) VALUES ($1, $2, $3, $4, $5)',
        [firstname, lastname, email, bcryptPassword, profileImage]
      );
      
      return res.status(201).json({ message: "New User Added" });
    } catch (err) {
      return next(err);
    }
  }
);

app.post("/api/refresh-token", (req, res) => {
  const CurrentRefreshToken = req.cookies.refreshToken;
  if (!CurrentRefreshToken)
    return res.status(403).json({ message: "Refresh Token Missing" });

  jwt.verify(CurrentRefreshToken, process.env.JWTKEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Refresh Token" });

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        profileImage: user.profileImage,
      },
      process.env.JWTKEY,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: false, // We make the access Token httpOnly false so that we can access it via js on the FE.
      secure: false, // We're not dealing with HTTPs but HTTP so this should be false unless we're using HTTPS.
      sameSite: "Strict",
    });
  });
});

app.post("/api/login", errorHandler, async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query('SELECT * FROM "user" WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return next(createError(401, "User is not registered"));
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return next(createError(403, "Email or password is incorrect"));
    }

    const accessToken = jwt.sign(
      {
        id: user.rows[0].user_id,
        firstname: user.rows[0].firstname,
        lastname: user.rows[0].lastname,
        email: user.rows[0].email,
        profileImage: user.rows[0].profile_picture_url,
      },
      process.env.JWTKEY,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      {
        id: user.rows[0].user_id,
        firstname: user.rows[0].firstname,
        lastname: user.rows[0].lastname,
        email: user.rows[0].email,
        profileImage: user.rows[0].profile_picture_url,
      },
      process.env.JWTKEY,
      { expiresIn: "7d" }
    );

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: false,
      secure: true, 
      sameSite: "None",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    // Send access token in response for local storage
    return res.status(200).json({ message: "Login Successful", accessToken });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

app.post("/api/logout", (req, res) => {
    res.clearCookie("refreshToken")
    res.clearCookie("accessToken")
    res.status(200).json({message: "Logged out"})
})
// Auth routess


// Create Lisiting routes. Here I will have all logic in one place but service file to control CRUD of the database.
app.post('/api/create-listing', authorize, upload.array('photos', 10), createListing)


// Fetching of listings, homepage + user's my properties

app.get('/api/listings', homepageListings)


// Fetching listing details for a particular property

app.get('/api/properties/:listingId', listingDetails)

// Booking routes
app.use("/api", bookingRoutes)

// Watchlist route
app.use("/api", watchlist)

// User properties
app.use('/api', properties)

// error middleware REMEMBER TO IMPORT IT
app.use(errorHandler);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});