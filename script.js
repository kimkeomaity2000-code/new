const products = [
  { id: 1, name: "ແກ້ວນ້ຳພົກພາ Daily", category: "ຂອງໃຊ້", price: 185000, oldPrice: 220000, rating: 4.9, badge: "ຂາຍດີ", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=82" },
  { id: 2, name: "ກະເປົາຜ້າຝ້າຍ Everyday", category: "ແຟຊັ່ນ", price: 145000, oldPrice: null, rating: 4.8, badge: "ໃໝ່", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=82" },
  { id: 3, name: "ເທຽນຫອມກິ່ນດອກໄມ້", category: "ເຮືອນ", price: 165000, oldPrice: null, rating: 4.9, badge: "", image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=82" },
  { id: 4, name: "ຫູຟັງໄຮ້ສາຍ Studio", category: "ເທັກໂນໂລຊີ", price: 590000, oldPrice: 680000, rating: 4.7, badge: "ລົດລາຄາ", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=82" },
  { id: 5, name: "ຈອກເຊຣາມິກ Morning", category: "ເຮືອນ", price: 125000, oldPrice: null, rating: 4.8, badge: "", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=700&q=82" },
  { id: 6, name: "ກະເປົາສະພາຍຂ້າງ Mini", category: "ແຟຊັ່ນ", price: 320000, oldPrice: null, rating: 4.9, badge: "ໃໝ່", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=82" },
  { id: 7, name: "ໂຄມໄຟຕັ້ງໂຕະ Soft Glow", category: "ເຮືອນ", price: 420000, oldPrice: 490000, rating: 4.6, badge: "ລົດລາຄາ", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=82" },
  { id: 8, name: "ກ່ອງໃສ່ບັດ Slim Wallet", category: "ຂອງໃຊ້", price: 195000, oldPrice: null, rating: 4.7, badge: "", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=82" }
];

const categories = ["ທັງໝົດ", ...new Set(products.map((product) => product.category))];
const storage = {
  read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      showToast("ບຣາວເຊີບໍ່ສາມາດບັນທຶກລາຍການໄດ້");
    }
  }
};

let cart = storage.read("mali-cart", []);
let favorites = storage.read("mali-favorites", []);
let activeCategory = "ທັງໝົດ";
let favoritesOnly = false;
let toastTimer;

const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const categoryList = document.querySelector("#category-list");
const cartDrawer = document.querySelector("#cart-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const checkoutDialog = document.querySelector("#checkout-dialog");

function formatPrice(amount) {
  return `${amount.toLocaleString("en-US")} ₭`;
}

function getProduct(id) {
  return products.find((product) => product.id === Number(id));
}

function renderCategories() {
  categoryList.innerHTML = categories.map((category) => `
    <button class="category-button${category === activeCategory ? " is-active" : ""}" type="button" data-category="${category}" aria-pressed="${category === activeCategory}">${category}</button>
  `).join("");
}

function getVisibleProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("lo");
  const sort = document.querySelector("#sort-select").value;
  let visible = products.filter((product) => {
    const matchesCategory = activeCategory === "ທັງໝົດ" || product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.category}`.toLocaleLowerCase("lo").includes(query);
    const matchesFavorite = !favoritesOnly || favorites.includes(product.id);
    return matchesCategory && matchesSearch && matchesFavorite;
  });
  if (sort === "price-low") visible = visible.toSorted((a, b) => a.price - b.price);
  if (sort === "price-high") visible = visible.toSorted((a, b) => b.price - a.price);
  if (sort === "rating") visible = visible.toSorted((a, b) => b.rating - a.rating);
  return visible;
}

function renderProducts() {
  const visible = getVisibleProducts();
  productGrid.hidden = visible.length === 0;
  document.querySelector("#empty-state").hidden = visible.length > 0;
  document.querySelector("#results-count").textContent = `ສະແດງ ${visible.length} ລາຍການ`;
  document.querySelector("#clear-filters").hidden = activeCategory === "ທັງໝົດ" && !searchInput.value && !favoritesOnly;
  document.querySelector("#favorites-toggle").classList.toggle("is-active", favoritesOnly);
  productGrid.innerHTML = visible.map((product, index) => `
    <article class="product-card" style="animation-delay:${Math.min(index * 45, 270)}ms">
      <div class="product-image"><img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.badge ? `<span class="product-badge${product.badge === "ໃໝ່" ? " is-new" : ""}">${product.badge}</span>` : ""}
        <button class="favorite-button${favorites.includes(product.id) ? " is-active" : ""}" type="button" data-favorite="${product.id}" aria-label="${favorites.includes(product.id) ? "ເອົາອອກຈາກ" : "ເພີ່ມໃສ່"}ລາຍການທີ່ມັກ" aria-pressed="${favorites.includes(product.id)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.7c0 5.1-8.8 10.1-8.8 10.1S3.2 13.8 3.2 8.7A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 8.8 2.7Z"></path></svg></button>
      </div>
      <div class="product-info"><span class="product-category">${product.category}</span>
        <div class="product-name-row"><h3 class="product-name">${product.name}</h3><span class="product-rating">★ ${product.rating.toFixed(1)}</span></div>
        <div class="product-price-row"><strong class="product-price">${formatPrice(product.price)}</strong>${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ""}</div>
        <button class="add-button" type="button" data-add="${product.id}">ເພີ່ມໃສ່ກະຕ່າ <span aria-hidden="true">+</span></button>
      </div>
    </article>
  `).join("");
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelector("#cart-count").textContent = count;
  document.querySelector("#drawer-count").textContent = `(${count})`;
}

function renderCart() {
  cart = cart.filter((item) => getProduct(item.id) && item.quantity > 0);
  storage.write("mali-cart", cart);
  updateCartCount();
  const hasItems = cart.length > 0;
  document.querySelector("#cart-empty").hidden = hasItems;
  document.querySelector("#cart-summary").hidden = !hasItems;
  document.querySelector("#cart-items").innerHTML = cart.map((item) => {
    const product = getProduct(item.id);
    return `<article class="cart-item"><img src="${product.image}" alt="${product.name}"><div class="cart-item-details"><small>${product.category}</small><strong>${product.name}</strong><div class="quantity-control"><button type="button" data-quantity="-1" data-id="${product.id}" aria-label="ຫຼຸດຈຳນວນ">−</button><span>${item.quantity}</span><button type="button" data-quantity="1" data-id="${product.id}" aria-label="ເພີ່ມຈຳນວນ">+</button></div></div><div class="cart-item-side"><strong>${formatPrice(product.price * item.quantity)}</strong><button class="remove-item" type="button" data-remove="${product.id}">ລຶບ</button></div></article>`;
  }).join("");
  const subtotal = cart.reduce((total, item) => total + getProduct(item.id).price * item.quantity, 0);
  document.querySelector("#cart-subtotal").textContent = formatPrice(subtotal);
  document.querySelector("#checkout-total").textContent = formatPrice(subtotal);
  document.querySelector("#shipping-note").textContent = subtotal >= 500000 ? "ດີໃຈນຳ! ທ່ານໄດ້ຮັບສິດສົ່ງຟຣີ" : `ຊື້ອີກ ${formatPrice(500000 - subtotal)} ເພື່ອຮັບສິດສົ່ງຟຣີ`;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, quantity: 1 });
  storage.write("mali-cart", cart);
  renderCart();
  showToast("ເພີ່ມສິນຄ້າໃສ່ກະຕ່າແລ້ວ");
}

function toggleFavorite(id) {
  favorites = favorites.includes(id) ? favorites.filter((favorite) => favorite !== id) : [...favorites, id];
  storage.write("mali-favorites", favorites);
  renderProducts();
}

function openCart() {
  cartDrawer.hidden = false;
  drawerBackdrop.hidden = false;
  document.body.classList.add("drawer-open");
  document.querySelector("#cart-close").focus();
}

function closeCart() {
  cartDrawer.hidden = true;
  drawerBackdrop.hidden = true;
  document.body.classList.remove("drawer-open");
  document.querySelector("#cart-open").focus();
}

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategories();
  renderProducts();
});
productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const favoriteButton = event.target.closest("[data-favorite]");
  if (addButton) addToCart(Number(addButton.dataset.add));
  if (favoriteButton) toggleFavorite(Number(favoriteButton.dataset.favorite));
});
document.querySelector("#search-form").addEventListener("submit", (event) => event.preventDefault());
searchInput.addEventListener("input", renderProducts);
document.querySelector("#sort-select").addEventListener("change", renderProducts);
document.querySelector("#favorites-toggle").addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  renderProducts();
});
document.querySelector("#clear-filters").addEventListener("click", () => {
  activeCategory = "ທັງໝົດ";
  favoritesOnly = false;
  searchInput.value = "";
  renderCategories();
  renderProducts();
});
document.querySelector("#cart-open").addEventListener("click", openCart);
document.querySelector("#cart-close").addEventListener("click", closeCart);
document.querySelector("#continue-shopping").addEventListener("click", closeCart);
drawerBackdrop.addEventListener("click", closeCart);
document.querySelector("#cart-items").addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) {
    const item = cart.find((entry) => entry.id === Number(quantityButton.dataset.id));
    if (item) item.quantity += Number(quantityButton.dataset.quantity);
    cart = cart.filter((entry) => entry.quantity > 0);
    renderCart();
  }
  if (removeButton) {
    cart = cart.filter((item) => item.id !== Number(removeButton.dataset.remove));
    renderCart();
  }
});
document.querySelector("#checkout-open").addEventListener("click", () => {
  document.querySelector("#checkout-total").textContent = document.querySelector("#cart-subtotal").textContent;
  checkoutDialog.showModal();
});
document.querySelector("#checkout-close").addEventListener("click", () => checkoutDialog.close());
checkoutDialog.addEventListener("click", (event) => {
  if (event.target === checkoutDialog) checkoutDialog.close();
});
document.querySelector("#checkout-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  cart = [];
  renderCart();
  checkoutDialog.close();
  closeCart();
  event.currentTarget.reset();
  showToast("ຂອບໃຈ! ຮັບຄຳສັ່ງຊື້ຕົວຢ່າງແລ້ວ");
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape" && !checkoutDialog.open && !cartDrawer.hidden) closeCart();
});

renderCategories();
renderProducts();
renderCart();