
# URL Shortener Service

This URL Shortener Service is a Node.js and Express application designed to generate unique short URLs for long URLs, store them in MongoDB, and provide a RESTful API to create, retrieve, and manage these shortened URLs.

## Table of Contents

- [Project Structure](#project-structure)
- [Data Structure and URL Uniqueness Approach](#data-structure-and-url-uniqueness-approach)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Run the Service](#run-the-service)
- [API Documentation](#api-documentation)
- [Endpoints](#endpoints)
- [Example Requests](#example-requests)

## Project Structure

The project consists of the following main components:

- **Node.js** and **Express.js**: Handles API routes and the core business logic.
- **MongoDB (Atlas)**: A cloud-based NoSQL database for storing long URLs and corresponding short URLs.
- **Swagger**: Used for API documentation and easy testing of endpoints.

## Data Structure and URL Uniqueness Approach

The application uses a MongoDB collection with a schema containing fields for:
1. **longUrl**: The original URL provided by the user.
2. **shortUrl**: A unique six-character identifier generated for the long URL.

### Approach to Short URL Uniqueness

- **Unique Key Generation**: A six-character `shortUrl` is generated using the `nanoid` library, which provides secure, URL-friendly unique IDs.
- **Uniqueness Check**: For every generated short URL, a check is performed to ensure that no existing URL in the database has the same short code. If a collision is detected, a new code is generated, ensuring the uniqueness of each short URL.

## Getting Started

To set up and run the service locally, follow the instructions below.

### Prerequisites

1. **Node.js**: Ensure Node.js and npm are installed on your system. You can download Node.js [here](https://nodejs.org/).
2. **MongoDB Atlas**: Sign up for MongoDB Atlas and get a connection string for your MongoDB database. (Not required if you are cloning this repository)
3. **Environment Variables**:
   - Create a `.env` file in the root directory with the following variables:
     ```env
     PORT=5000
     MONGO_URI=mongodb+srv://tanvirahmed80151:jO0QENe8LSt4MTym@urlshortenerdb.aoab0.mongodb.net/?retryWrites=true&w=majority&appName=URLShortenerDB
     MONGODB_TEST_URI=mongodb+srv://tanvirahmed80151:W0AHypTJy6oswCcT@testdb.f5mds.mongodb.net/?retryWrites=true&w=majority&appName=TestDB
     ```
   - Replace `<username>`, `<password>`, and `<dbname>` with your MongoDB Atlas credentials. (Not required if you are cloning this repository)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/url-shortener-service.git
   cd url-shortener-service
2.  **Install dependencies**:

    `npm install` 
    

### Run the Service

1.  **Start the server**:
    
    `npm run dev` 
    
    This will start the server on `http://localhost:5000` (or the port specified in the `.env` file).
    
2.  **Run tests**:
    
    `npm test` 
    
    Running tests will confirm the functionality of the core API endpoints.
    

## API Documentation

The API documentation is available via Swagger at http://localhost:5000/api-docs once the server is running.

## Endpoints

### POST /shorten

-   **Description**: Creates a short URL for a valid long URL.
-   **Request Body**: JSON object containing the `longUrl`.
-   **Responses**:
    -   `201 Created`: Returns the `longUrl` and `shortUrl` when a new short URL is generated.
    -   `200 OK`: Returns the existing short URL if the long URL has already been shortened.
    -   `400 Bad Request`: Returns if the URL format is invalid.
    -   `500 Internal Server Error`: Returned if there is a database or server error.

#### Example Request

`curl -X POST http://localhost:5000/shorten -H "Content-Type: application/json" -d '{"longUrl":"https://example.com"}'` 

#### Example Response (201 Created)

`{
  "longUrl": "https://example.com",
  "shortUrl": "abc123"
}` 

### GET /{shortUrl}

-   **Description**: Redirects to the original long URL associated with the `shortUrl`.
-   **Parameters**:
    -   `shortUrl`: The unique six-character code representing the original URL.
-   **Responses**:
    -   `302 Found`: Redirects to the original `longUrl` associated with the `shortUrl`.
    -   `404 Not Found`: Returned if the `shortUrl` does not exist in the database.
    -   `500 Internal Server Error`: Returned if there is a database or server error.

#### Example Request

`curl -X GET http://localhost:5000/abc123` 

#### Example Response (302 Found)

The server will redirect to the original URL (`https://example.com`).

## Example Requests

### 1. Shorten a URL

This request shortens a valid URL.

`curl -X POST http://localhost:5000/shorten -H "Content-Type: application/json" -d '{"longUrl":"https://example.com"}'` 

### 2. Retrieve a Short URL

This request attempts to redirect to the original URL.

`curl -X GET http://localhost:3000/abc123` 

## Error Handling
The API provides error responses for invalid URLs, duplicate entries, and unexpected server issues. Responses include meaningful status codes and error messages.