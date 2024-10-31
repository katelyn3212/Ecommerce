// Function to fetch products and display them in the table
async function fetchAndDisplaySearchProducts(searchTerm, tableName) {
    try {
        // Fetch products from the server using the search term
        const response = await fetch(`http://localhost:3000/products?search=${encodeURIComponent(searchTerm)}`);
        const products = await response.json();
        const tableBody = document.getElementById(tableName); // Reference the table body

        tableBody.innerHTML = ''; // Clear previous results

        // Create a header row if it doesn't exist
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Quantity</th>
        `;
        tableBody.appendChild(headerRow); // Append the header row to the table
    

        // Iterate through products and create a new row for each
        products.forEach(product => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${product.product_id}</td>
                <td>${product.product_name}</td>
                <td>${product.product_desc}</td>
                <td>${product.product_price}</td>
                <td>${product.product_qty}</td>
            `;
            tableBody.appendChild(newRow); // Add the new row to the table body
        });
    } catch (error) {
        console.error('Error searching:', error);
    }
}
