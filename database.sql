CREATE DATABASE elaminestate;





CREATE TABLE "user"(
    user_id SERIAL PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profile_picture_url VARCHAR(255), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);


CREATE TABLE types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);


CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    street_address VARCHAR(255) NOT NULL,
    apt_suite VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL
);


CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
    photo_url VARCHAR(255) NOT NULL,
    order_number INT
);


CREATE TABLE listing_facilities (
    listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
    facility_id INT REFERENCES facilities(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_id, facility_id)
);


CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES "user"(user_id),
    category_id INT REFERENCES categories(id),
    type_id INT REFERENCES types(id),
    location_id INT REFERENCES locations(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    highlight VARCHAR(255),
    highlight_desc TEXT,
    price DECIMAL(10, 2) NOT NULL,
    guests INT DEFAULT 1,
    bedrooms INT DEFAULT 1,
    beds INT DEFAULT 1,
    bathrooms INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
