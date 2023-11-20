// ... (your existing JavaScript code)

function displaycart() {
    let j = 0, total = 0;
    const cartBody = document.getElementById("cartBody");
    const cartSubtotal = document.getElementById("cartSubtotal");
    const cartTotal = document.getElementById("cartTotal");

    document.getElementById("count").innerHTML = cart.length;

    if (cart.length === 0) {
        document.getElementById('cartItem').innerHTML = "Your cart is empty";
        cartSubtotal.textContent = "0 Ksh";
        cartTotal.textContent = "0 Ksh";
    } else {
        document.getElementById("cartItem").innerHTML = cart.map((items, index) => {
            const { image, title, price } = items;
            total = total + price;

            // Create a new table row for each cart item
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td><a href="#" onclick="delElement(${index})"><i class="fa-regular fa-circle-xmark"></i></a></td>
                <td><img src="${image}" alt="${title}"></td>
                <td>${title}</td>
                <td>${price} Ksh</td>
                <td><input type="number" value="1"></td>
                <td>${price} Ksh</td>
            `;
            cartBody.appendChild(newRow);

            cartSubtotal.textContent = total + " Ksh";
            cartTotal.textContent = total + " Ksh";

            return "";
        }).join('');
    }
}
