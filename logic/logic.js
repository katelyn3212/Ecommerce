// Add Product Submission
// @param formID - the id of the form 
// @param url - the path to the API routes where the form data will be sent
// @return n/a
function submitAddProductForm(formID, url) {
    const form = document.getElementById(formID); // access the form addProductForm
    form.addEventListener('submit', async function (event) { //this fun't is triggered upon form submission
        event.preventDefault(); //prevents page from reloading

        const formData = new FormData(); //this will hold the input values
        formData.append('product_name', document.getElementById('productName').value);
        formData.append('product_desc', document.getElementById('productDescription').value);
        formData.append('product_price', document.getElementById('productPrice').value);
        formData.append('product_qty', document.getElementById('productQuantity').value);
        formData.append('product_image', document.getElementById('productImage').files[0]);

        try {
            // Send the form data to the backend API route using fetch
            const response = await fetch(url, {
                method: 'POST',
                body: formData //contains all input values
            });

            const result = await response.text(); // Handle the response (you could parse JSON if needed)

            // Checks whether product was added or not
            if (response.ok) {
                alert('Product added successfully!');
            } else {
                alert('Error adding product: ' + result);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the product');
        }

    })
}


// Remove Product Based on ID
// @param formID - the id of the form 
// @param url - the path to the API routes where the form data will be sent
// @return n/a
async function removeProduct(formID, url) {
    const productId = document.getElementById('removeId').value; // Get the product ID from input

    if (!productId) {
        alert('Please enter a valid product ID.');
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'DELETE', // Use DELETE method
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id: productId }) // Send product ID as JSON
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const message = await response.text(); // Get the response message
        alert(message); // Display success or error message
    } catch (error) {
        console.error('Error removing product:', error);
        alert('An error occurred while removing the product.');
    }
}


async function updateProductForm(formId, url) {
    const productId = document.getElementById('removeId').value;
    

}

//Usage: submitAddProductForm("addProductForm","http://localhost:3000/admin/add")
//Usage: removeProduct("removeProductForm", "http://localhost:3000/admin/remove")