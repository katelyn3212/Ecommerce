// Event listener that waits for search button in index.html to be submitted 
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("Rendering working");

        // Fetch all products when the page loads
        await fetchAndDisplayProducts();

        // Add event listener to the search button
        const searchButton = document.getElementById('search-button');
        searchButton.addEventListener('click', async () => {
            const searchTerm = document.getElementById('search-input').value;

            // Fetch and display products based on the search term
            await fetchAndDisplayProducts(searchTerm);
        });
    } catch (error) {
        console.error('Error initializing page:', error);
    }
});

// Function to fetch products and display them
async function fetchAndDisplayProducts(searchTerm = '') {
    try {
        // Make a request to the server, passing the search term as a query parameter
        const response = await fetch(`http://localhost:3000/products?search=${encodeURIComponent(searchTerm)}`);
        const products = await response.json();

        const productList = document.getElementById('product-content');
        productList.innerHTML = ''; // Clear previous products

        // Iterate through products and create HTML for each
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('item'); // Add a class for styling if needed

            // Assuming each product has 'product_name' and 'image' properties
            productDiv.innerHTML = `
                <img src="${product.product_image}" alt="${product.product_name}"><br>
                <a href="product-view.html?product_id=${product.product_id}">${product.product_name}</a>
            `;

            productList.appendChild(productDiv); // Add the product div to the container
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}


