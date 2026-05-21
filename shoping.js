/* Combined site JavaScript (extracted from HTML files)
   Safe to include on every page: guards ensure page-specific code
   runs only when relevant elements exist. */

// Add to cart (used from menu buttons)
window.addToCart = function(name, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ name: name, price: price });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Đã thêm vào giỏ hàng!");
};

// Shopping page: render cart, remove items
(function() {
    const cartListEl = document.getElementById("cart-list");
    if (!cartListEl) return; // not on shopping page

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let total = 0;

    window.renderCart = function() {
        cartListEl.innerHTML = "";
        total = 0;
        cart.forEach((item, index) => {
            cartListEl.innerHTML += `

        <div class="cart-item">

            <span>
                ${item.name}
            </span>

            <span>
                ${item.price.toLocaleString()} VNĐ
            </span>

            <button onclick="removeItem(${index})">
                ❌
            </button>

        </div>

        `;
            total += item.price;
        });
        const totalEl = document.getElementById("total");
        if (totalEl) totalEl.innerText = total.toLocaleString();
    };

    window.removeItem = function(index) {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    };

    // initial render
    renderCart();
})();

// Account page: register & login
window.register = function() {
    const usernameEl = document.getElementById("username");
    const passwordEl = document.getElementById("password");
    if (!usernameEl || !passwordEl) return;

    const username = usernameEl.value;
    const password = passwordEl.value;

    if (username === "" || password === "") {
        alert("Nhập đầy đủ thông tin!");
        return;
    }

    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    alert("Đăng ký thành công!");
};

window.login = function() {
    const usernameEl = document.getElementById("username");
    const passwordEl = document.getElementById("password");
    const welcomeEl = document.getElementById("welcome");
    if (!usernameEl || !passwordEl || !welcomeEl) return;

    const username = usernameEl.value;
    const password = passwordEl.value;

    const savedUser = localStorage.getItem("username");
    const savedPass = localStorage.getItem("password");

    if (username === savedUser && password === savedPass) {
        welcomeEl.innerText = "Xin chào " + username + " 👋";
    } else {
        alert("Sai tài khoản hoặc mật khẩu!");
    }
};
