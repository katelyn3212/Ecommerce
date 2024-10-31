document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product_id");
    console.log(productId);

    async function loadProduct(productId) {
        try {
            const response = await fetch(`http://localhost:3000/products?product_id=${productId}`);
            // Check if the response is okay (status code 200-299)
            if (!response.ok) {
                throw new Error(`Error fetching product with ID ${productId}: ${response.statusText}`);
            }
            const product = await response.json();
        
            const productPage = document.getElementById('product-details');
            productPage.innerHTML = ''; // Clear previous products
            // Create and append <h2> element for the product name
            const productName = document.createElement('h2');
            productName.textContent = product.product_name;
            productPage.appendChild(productName);

            // Create and append <img> element for the product image
            const productImage = document.createElement('img');
            productImage.src = product.product_image; // Assuming product_image is the correct path
            productImage.alt = product.product_name;
            productPage.appendChild(productImage);

            // Create and append <p> element for the product description
            const productDesc = document.createElement('p');
            productDesc.textContent = product.product_desc;
            productPage.appendChild(productDesc);

            // Create and append <h3> element for the product price
            const productPrice = document.createElement('h3');
            productPrice.textContent = `$${product.product_price}`;
            productPage.appendChild(productPrice);

            // Create and append <button> for adding to cart
            const addToCartButton = document.createElement('button');
            addToCartButton.id = 'add-to-cart';
            addToCartButton.textContent = 'Add to Cart';
            productPage.appendChild(addToCartButton);

            // Create and append <p> element for stock quantity
            const productQty = document.createElement('p');
            productQty.textContent = `${product.product_qty} left`;
            productPage.appendChild(productQty);

        } catch (error) {
            console.error('Error fetching product with this id:', error);
        }


    }
    if (productId) {
        loadProduct(productId);
    }
});
