/** 
 * @file server.js
 * @description This file sets up an Express server for an e-commerce website.
 * It includes routes for handling product and user data, connects to a MySQL 
 * database, and configures middleware for parsing request bodies and handling 
 * file uploads.
 */

// Import required modules using ES Modules syntax
import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the .env file
dotenv.config({ path: 'krche.env' });

const app = express();

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('uploads'));

// Set up multer for file uploads
const storage = multer.diskStorage({
  // how and where uploaded files are stored
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); // just uploads makes the add product test work
  },
  /**
   * @function filename
   * @description Specifies the filename for uploaded files.
   * @param {Object} req - The request object.
   * @param {Object} file - The file object.
   * @param {Function} cb - The callback function.
   */
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage }); // create upload middleware

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost', // database host
  user: 'root', // MySQL username
  password: 'lizards3212', // MySQL password
  database: 'ecommerce_db' // database name
});

/**
 * @description Connects to the MySQL database and logs the connection status.
 */
db.connect(err => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

/**
 * @route POST /submit
 * @description Handles form submission and inserts user data into the MySQL database.
 * @param {Object} req - The request object containing user data.
 * @param {Object} res - The response object.
 */
app.post('/submit', (req, res) => {
  const { user_fName, user_lName, shipping_address, phone_number, email, password_hash, role } = req.body;
  // Log received data for debugging
  console.log('Received data:', { user_fName, user_lName, shipping_address, phone_number, email, password_hash, role });
  // Insert user into MySQL
  const query =
    'INSERT INTO User (user_fName, user_lName, shipping_address, phone_Number, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [user_fName, user_lName, shipping_address, phone_Number,
    email, password_hash, role], (err, result) => {
      if (err) {
        res.status(500).send('Error saving data');
      } else {
        res.send('User added successfully!');
      }
    });
});

/**
 * @route GET /products
 * @description Retrieves all products from the MySQL database and sends them as a JSON response.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */

/*app.get('/products', (req, res) => {
  // Get the search query from the request
  const productId = req.query.product_id;
  if (productId) {
    const queryById = 'SELECT * FROM Product WHERE id = ?';

    db.query(queryById, [productId], (err, results) => {
      if (err) {
        console.error('Error fetching product by ID:', err);
        return res.status(500).send('Error fetching product');
      } else if (results.length === 0) {
        return res.status(404).send('Product not found');
      } else {
        console.log('Product fetched successfully by ID:', results);
        return res.json(results[0]); // Return the product
      }
    });
  }
  else {
    const searchTerm = req.query.search || '';
    // Modify the SQL query to include a WHERE clause that filters products
    const query = `
      SELECT * FROM Product
      WHERE product_name LIKE ? OR product_desc LIKE ?
    `;

    // Use wildcard % for partial matches
    const searchQuery = `%${searchTerm}%`;

    // Execute the query with the search term
    db.query(query, [searchQuery, searchQuery], (err, results) => {
      if (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Error fetching products');
      } else {
        console.log('Products fetched successfully:', results);
        res.json(results);
      }
    });

  }
});*/
app.get('/products', (req, res) => {
  const productId = req.query.product_id;
  const searchTerm = req.query.search || '';

  // Scenario 1: If productId is provided, fetch product by ID
  if (productId) {
    const queryById = 'SELECT * FROM Product WHERE product_id = ?';
    db.query(queryById, [productId], (err, results) => {
      if (err) {
        console.error('Error fetching product by ID:', err);
        return res.status(500).send('Error fetching product');
      } else if (results.length === 0) {
        return res.status(404).send('Product not found');
      } else {
        console.log('Product fetched successfully by ID:', results);
        return res.json(results[0]); // Return the product
      }
    });

  // Scenario 2: If searchTerm is provided, fetch products by search
  } else if (searchTerm !== '') {
    const queryBySearch = `
      SELECT * FROM Product
      WHERE product_name LIKE ? OR product_desc LIKE ?
    `;
    const searchQuery = `%${searchTerm}%`;

    db.query(queryBySearch, [searchQuery, searchQuery], (err, results) => {
      if (err) {
        console.error('Error fetching products:', err);
        return res.status(500).send('Error fetching products');
      } else {
        console.log('Products fetched successfully with search term:', results);
        return res.json(results);
      }
    });

  // Scenario 3: If no query parameters are provided, fetch all products
  } else {
    const queryAllProducts = `
      SELECT * FROM Product
    `;

    db.query(queryAllProducts, (err, results) => {
      if (err) {
        console.error('Error fetching all products:', err);
        return res.status(500).send('Error fetching products');
      } else {
        console.log('All products fetched successfully:', results);
        return res.json(results);
      }
    });
  }
});

/**
 * @route POST /admin/add
 * @description Handles adding a new product to the MySQL database from the admin form.
 * @param {Object} req - The request object containing product data.
 * @param {Object} res - The response object.
 */
app.post('/admin/add', upload.single('product_image'), (req, res) => {
  const { product_name, product_desc, product_price, product_qty } = req.body; // extracted from req.body
  const product_image = req.file ? `../uploads/${req.file.filename}` : null; // req.file ? req.file.path : null; // Store relative path
  // SQL Query to insert a new product into the database
  const query = 'INSERT INTO Product (product_name, product_desc, product_price, product_qty, product_image) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [product_name, product_desc, product_price, product_qty, product_image], (err, result) => {
    if (err) {
      res.status(500).send('Error adding product');
    } else {
      res.send('Product added successfully!');
    }
  });
});

/**
 * @route DELETE /admin/remove
 * @description Handles removing a product from the MySQL database by product_id.
 * @param {Object} req - The request object containing the product_id.
 * @param {Object} res - The response object.
 */
app.delete('/admin/remove', (req, res) => {
  const { product_id } = req.body;

  let query = '';
  let params = [];
  if (product_id) {
    query = 'DELETE FROM Product WHERE product_id=?';
    params = [product_id];
  } else {
    return res.status(400).send('Please provide valid product id');
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error deleting product', err);
      res.status(500).send('Error removing product');
    } else {
      res.send('Product removed successfully!');
    }
  });
});

/**
 * @route PUT /admin/update
 * @description Handles updating product details in the MySQL database.
 * @param {Object} req - The request object containing product data.
 * @param {Object} res - The response object.
 */
app.put('/admin/update', (req, res) => {
  const { id, name, price, quantity } = req.body;
  // Check if all required fields are provided
  if (!id || !name || !price || !quantity) {
    return res.status(400).send('All fields are required');
  }
  // Update product in MySQL
  const query = `UPDATE Product SET product_name = ?, product_price = ?, product_qty = ? WHERE product_id = ?`;
  db.query(query, [name, price, quantity, id], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      res.status(500).send('Error updating product');
    } else if (result.affectedRows === 0) {
      res.status(404).send('Product not found');
    } else {
      res.send('Product updated successfully');
    }
  });
});

// Login logic
app.post('/login', (req, res) => {
  const { email, password_hash } = req.body;
  const query = 'SELECT * FROM Users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Internal server error');
    }
    if (results.length === 0) {
      return res.status(401).send('Invalid username or password');
    }
    const user = results[0];
    // Compare the entered password with the plain text password in the database
    if (user.password !== password_hash) {
      return res.status(401).send('Invalid username or password');
    }
    // Store user info in session
    req.session.user = {
      id: user.id,
      username: user.email
    };
    // Redirect to login.html or admin-panel.html on successful login
    if (user.role === 'admin') {
      res.redirect('/admin-panel.html');
    } else if (user.role === 'user') {
      res.redirect('/index.html');
    } else {
      return res.status(401).send('Invalid username or password');
    }
  });
});

// Serve the static HTML/CSS frontend
app.use(express.static('public'));

// Serve login.html by default
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
