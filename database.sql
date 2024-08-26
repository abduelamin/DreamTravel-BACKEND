CREATE DATABASE elaminestate;


-- \c into todoApp


CREATE TABLE "user"(
    user_id SERIAL PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profile_picture_url VARCHAR(255), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
