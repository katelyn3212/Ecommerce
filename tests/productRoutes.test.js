// Import Modules
import request from 'supertest';
import app from '../src/server.js'; // import express app
import { expect } from 'chai'; // used for writing assertions in the tests
import path from 'path'; // used for resolving file paths
import fs from 'fs'; // used for checking file existence
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @description Group related tests for the Product Routes.
 */
describe('Product Routes', () => {

  // defines a test case. checks if /products returns a status code of 200 and the response body is an array
  it('should GET all products', async () => {
    const res = await request(app).get('/products');
    expect(res.status).to.equal(200); // asserting that the response status is 200
    expect(res.body).to.be.an('array'); // asserting that the response body is an array
  });

  // Test for adding a product (needs the front-end form)
  it('should POST a new product', async () => {
    const imagePath = path.resolve(__dirname, '../uploads/testBanana.jpeg');
    console.log('Resolved image path:', imagePath);

    if (!fs.existsSync(imagePath)) {
      console.error('File does not exist:', imagePath);
      throw new Error('Test image file not found');
    }

    console.log('Current working directory:', process.cwd());
    const res = await request(app)
      .post('/admin/add') // sending a POST request to the /admin/add route
      .set('content-type', 'multipart/form-data') // content type = form-data for upload
      .field('product_name', 'Test Product') // Adding form fields
      .field('product_desc', 'This is a test product')
      .field('product_price', 100)
      .field('product_qty', 10)
      .attach('product_image', imagePath); // Use a sample image for the test
    console.log('Response status:', res.status);
    console.log('Response text:', res.text);
    expect(res.status).to.equal(200); // asserting that the response status is 200 (OK)
    expect(res.text).to.equal('Product added successfully!'); // asserting that the server sends the correct response message
  });

 // Test for updating a product
it('should PUT (update) a product by product_id', async () => {
  const imagePath = path.resolve(__dirname, '../uploads/testBanana.jpeg');
  console.log('Resolved image path:', imagePath);

  if (!fs.existsSync(imagePath)) {
    console.error('File does not exist:', imagePath);
    throw new Error('Test image file not found');
  }

  // First, add a product to update
  const addRes = await request(app)
    .post('/admin/add')
    .set('content-type', 'multipart/form-data')
    .field('product_name', 'Product to update')
    .field('product_desc', 'This product will be updated')
    .field('product_price', 50)
    .field('product_qty', 5)
    .attach('product_image', imagePath);

  console.log('Add product response status:', addRes.status);
  console.log('Add product response body:', addRes.body);

  // Retrieve the recently added product ID from the GET route
  const getRes = await request(app).get('/products');
  const products = getRes.body;
  const productId = products[products.length - 1].product_id; // Assuming the last product is the one we just added
  console.log('Product ID to be updated:', productId);

  // Now, perform the PUT request to update the product
  const updateRes = await request(app)
    .put('/admin/update')
    .send({
      id: productId,
      name: 'Updated Product',
      price: 75,
      quantity: 10
    });

  console.log('Update product response status:', updateRes.status);
  console.log('Update product response text:', updateRes.text);

  expect(updateRes.status).to.equal(200); // asserting that the response status is 200 (OK)
  expect(updateRes.text).to.equal('Product updated successfully'); // asserting that the server sends the correct response message
});


  // Test for removing a product by product_id or product_name
  it('should DELETE a product by product_id', async () => {
    const imagePath = path.resolve(__dirname, '../uploads/testBanana.jpeg');
    console.log('Resolved image path:', imagePath);

    if (!fs.existsSync(imagePath)) {
      console.error('File does not exist:', imagePath);
      throw new Error('Test image file not found');
    }

    // First, add a product to delete
    await request(app)
      .post('/admin/add')
      .set('content-type', 'multipart/form-data')
      .field('product_name', 'Product to delete')
      .field('product_desc', 'This product will be deleted')
      .field('product_price', 50)
      .field('product_qty', 5)
      .attach('product_image', imagePath);

      // Retrieve the recently added product ID from the GET route
  const getRes = await request(app).get('/products');
  const products = getRes.body;
  const productId = products[products.length - 1].product_id; // Assuming the last product is the one we just added
  console.log('Product ID to be deleted:', productId);


    // Now, perform the DELETE request
    const res = await request(app)
      .delete('/admin/remove')
      .send({ product_id: productId }); // sending the product_id

    console.log('Delete product response status:', res.status);
    console.log('Delete product response text:', res.text);

    expect(res.status).to.equal(200); // asserting that the response status is 200 (OK)
    expect(res.text).to.equal('Product removed successfully!'); // asserting that the server sends the correct response message
  });
});
