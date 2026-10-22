import { getProduct, getProductsByCollection, PRODUCTS, PRODUCT_SIZES } from "./products.js";
import {
  addToCart,
  clearCart,
  getCart,
  getCartCount,
  getCartStatus,
  getSubtotal,
  removeFromCart,
  setQuantity,
} from "./cart.js";

const PRODUCTS_PER_PAGE = 8;

function makeElement(tagName, { className, text } = {}) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function formatPrice(price) {
  return `KSh ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(price)}`;
}

function updateCartCount() {
  const count = String(getCartCount());
  for (const badge of document.querySelectorAll("[data-cart-count]")) {
    badge.textContent = count;
  }
}

function productUrl(product) {
  return `sproduct.html?id=${encodeURIComponent(product.id)}`;
}

function createProductCard(product) {
  const item = makeElement("li");
  const article = makeElement("article", { className: "product-card" });
  const url = productUrl(product);
  const imageLink = makeElement("a", { className: "product-card-image-link" });
  imageLink.href = url;

  const image = makeElement("img");
  image.src = product.image;
  image.alt = product.name;
  image.width = 360;
  image.loading = "lazy";
  image.decoding = "async";
  imageLink.append(image);

  const copy = makeElement("div", { className: "product-card-copy" });
  const brand = makeElement("p", { className: "eyebrow product-card-brand", text: product.brand });
  const title = makeElement("h3", { className: "product-card-title" });
  const titleLink = makeElement("a", { className: "product-card-title-link", text: product.name });
  titleLink.href = url;
  title.append(titleLink);

  const price = makeElement("p", { className: "product-card-price" });
  price.append(makeElement("strong", { text: formatPrice(product.price) }));

  copy.append(brand, title, price);
  article.append(imageLink, copy);
  item.append(article);
  return item;
}

function renderProductList(list, products, note) {
  list.replaceChildren(...products.map(createProductCard));
  if (note) note.hidden = products.length > 0;
}

function renderHome() {
  const featured = document.querySelector("#featured-products");
  const featuredNote = document.querySelector("#featured-products-note");
  const newProducts = document.querySelector("#new-products");
  const newProductsNote = document.querySelector("#new-products-note");

  if (featured && newProducts) {
    renderProductList(featured, getProductsByCollection("featured"), featuredNote);
    renderProductList(newProducts, getProductsByCollection("new"), newProductsNote);
  }
}

function filterProducts(query) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return PRODUCTS;

  return PRODUCTS.filter((product) => (
    product.name.toLocaleLowerCase().includes(normalizedQuery)
    || product.brand.toLocaleLowerCase().includes(normalizedQuery)
  ));
}

function makePaginationLink(label, page, currentPage, searchParams) {
  const link = makeElement("a", { className: "button", text: label });
  const params = new URLSearchParams(searchParams);
  params.set("page", String(page));
  link.href = `shop.html?${params.toString()}`;
  if (page === currentPage) link.setAttribute("aria-current", "page");
  return link;
}

function renderPagination(pagination, pageCount, currentPage, searchParams) {
  pagination.replaceChildren();
  if (pageCount <= 1) return;

  if (currentPage > 1) {
    pagination.append(makePaginationLink("Previous", currentPage - 1, currentPage, searchParams));
  }

  for (let page = 1; page <= pageCount; page += 1) {
    pagination.append(makePaginationLink(String(page), page, currentPage, searchParams));
  }

  if (currentPage < pageCount) {
    pagination.append(makePaginationLink("Next", currentPage + 1, currentPage, searchParams));
  }
}

function renderShop() {
  const resultsList = document.querySelector("#shop-results");
  const emptyState = document.querySelector("#shop-empty-state");
  const status = document.querySelector("#shop-status");
  const pagination = document.querySelector("#shop-pagination");
  if (!resultsList || !emptyState || !status || !pagination) return;

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") ?? "";
  const matchingProducts = filterProducts(query);
  const pageCount = Math.ceil(matchingProducts.length / PRODUCTS_PER_PAGE);
  const requestedPage = Number(params.get("page"));
  const parsedPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const currentPage = pageCount ? Math.min(parsedPage, pageCount) : 1;

  if (parsedPage !== currentPage) {
    const correctedUrl = new URL(window.location.href);
    if (pageCount) correctedUrl.searchParams.set("page", String(currentPage));
    else correctedUrl.searchParams.delete("page");
    window.history.replaceState(null, "", correctedUrl);
  }

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const pageProducts = matchingProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  renderProductList(resultsList, pageProducts);

  emptyState.hidden = matchingProducts.length > 0;
  emptyState.textContent = query.trim()
    ? `No products match “${query.trim()}”. Try another search or browse the full collection.`
    : "No products are available in the collection.";

  if (matchingProducts.length) {
    const firstItem = startIndex + 1;
    const lastItem = Math.min(startIndex + pageProducts.length, matchingProducts.length);
    status.textContent = query.trim()
      ? `Showing ${firstItem}–${lastItem} of ${matchingProducts.length} matches for “${query.trim()}”.`
      : `Showing ${firstItem}–${lastItem} of ${matchingProducts.length} pieces.`;
  } else {
    status.textContent = query.trim() ? "0 search results." : "No products to show.";
  }

  renderPagination(pagination, pageCount, currentPage, params);

  const searchInput = document.querySelector("#site-search-input");
  if (searchInput) searchInput.value = query;
}

function showProductNotFound(detail, status, productId) {
  const heading = document.querySelector("#product-heading");
  const breadcrumb = document.querySelector(".breadcrumbs [aria-current='page']");
  const introText = document.querySelector(".compact-intro > p:last-child");
  const message = productId
    ? `We couldn't find a product with ID “${productId}”.`
    : "No product was selected.";

  if (heading) heading.textContent = "Product not found";
  if (breadcrumb) breadcrumb.textContent = "Product not found";
  if (introText) introText.textContent = "Browse the collection to choose a product.";
  document.title = "Product not found — Cara";

  status.hidden = false;
  status.textContent = `${message} Browse the collection to choose a product.`;
  const shopLink = makeElement("a", { className: "button button-dark", text: "Browse the collection" });
  shopLink.href = "shop.html";
  detail.replaceChildren(status, shopLink);
}

function renderProduct() {
  const detail = document.querySelector("#product-detail");
  const status = document.querySelector("#product-status");
  const feedback = document.querySelector("#product-feedback");
  const productId = new URLSearchParams(window.location.search).get("id");
  const product = getProduct(productId);
  if (!detail || !status || !feedback) return;

  if (!product) {
    showProductNotFound(detail, status, productId);
    return;
  }

  const heading = document.querySelector("#product-heading");
  const breadcrumb = document.querySelector(".breadcrumbs [aria-current='page']");
  const introText = document.querySelector(".compact-intro > p:last-child");
  if (heading) heading.textContent = product.name;
  if (breadcrumb) breadcrumb.textContent = product.name;
  if (introText) introText.textContent = "Choose a size and quantity to add this item to the local demo cart. No order or payment will be submitted.";
  document.title = `${product.name} — Cara`;

  status.hidden = true;
  const article = makeElement("article", { className: "product-detail" });
  const media = makeElement("div", { className: "product-detail-media" });
  const image = makeElement("img");
  image.className = "product-detail-image";
  image.src = product.image;
  image.alt = product.name;
  image.width = 480;
  image.decoding = "async";
  media.append(image);

  const brand = makeElement("p", { className: "eyebrow", text: product.brand });
  const name = makeElement("h2", { className: "product-detail-title", text: product.name });
  const price = makeElement("p", { className: "product-detail-price" });
  price.append(makeElement("strong", { text: formatPrice(product.price) }));

  const form = makeElement("form");
  form.id = "product-add-form";
  form.className = "product-detail-form";
  form.setAttribute("aria-describedby", "product-feedback");

  const sizeLabel = makeElement("label", { text: "Size" });
  sizeLabel.htmlFor = "product-size";
  const sizeSelect = makeElement("select");
  sizeSelect.className = "product-option-select";
  sizeSelect.id = "product-size";
  sizeSelect.name = "size";
  sizeSelect.required = true;
  const placeholder = makeElement("option", { text: "Select a size" });
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.selected = true;
  sizeSelect.append(placeholder);
  for (const size of PRODUCT_SIZES) {
    const option = makeElement("option", { text: size });
    option.value = size;
    sizeSelect.append(option);
  }
  const sizeField = makeElement("div", { className: "product-control" });
  const sizeSelectWrap = makeElement("div", { className: "product-select-wrap" });
  sizeSelectWrap.append(sizeSelect);
  sizeField.append(sizeLabel, sizeSelectWrap);

  const quantityLabel = makeElement("label", { text: "Quantity" });
  quantityLabel.htmlFor = "product-quantity";
  const quantityInput = makeElement("input");
  quantityInput.id = "product-quantity";
  quantityInput.name = "quantity";
  quantityInput.type = "number";
  quantityInput.min = "1";
  quantityInput.step = "1";
  quantityInput.value = "1";
  quantityInput.required = true;
  const quantityField = makeElement("div", { className: "product-control product-control-quantity" });
  quantityField.append(quantityLabel, quantityInput);

  const options = makeElement("fieldset", { className: "product-options" });
  options.append(makeElement("legend", { text: "Product options" }), sizeField, quantityField);

  const addButton = makeElement("button", { className: "button button-dark", text: "Add to cart" });
  addButton.type = "submit";
  addButton.disabled = true;

  form.append(options, addButton);
  const content = makeElement("div", { className: "product-detail-content" });
  content.append(brand, name, price, form);
  article.append(media, content);
  detail.replaceChildren(status, article);

  function updateAddState() {
    const quantity = Number(quantityInput.value);
    const sizeIsValid = PRODUCT_SIZES.includes(sizeSelect.value);
    const quantityIsValid = Number.isSafeInteger(quantity) && quantity > 0;
    addButton.disabled = !(sizeIsValid && quantityIsValid);
    feedback.textContent = addButton.disabled
      ? "Select a size and enter a whole-number quantity of 1 or more."
      : "";
  }

  sizeSelect.addEventListener("change", updateAddState);
  quantityInput.addEventListener("input", updateAddState);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateAddState();
      if (addButton.disabled) return;

      const size = sizeSelect.value;
      const quantity = Number(quantityInput.value);
      const existing = getCart().find((line) => line.productId === product.id && line.size === size);
      const expectedQuantity = (existing ? existing.quantity : 0) + quantity;
      const nextCart = addToCart(product.id, size, quantity);
      const updatedLine = nextCart.find((line) => line.productId === product.id && line.size === size);
      if (!updatedLine || updatedLine.quantity !== expectedQuantity) {
        feedback.textContent = "This quantity is too large for an exact demo subtotal. Choose a smaller whole number; nothing was added.";
        return;
      }

      updateCartCount();
      const confirmation = "Added " + quantity + " × " + product.name + " (" + size + "). ";
      const cartLink = makeElement("a", { className: "text-link", text: "View cart" });
      cartLink.href = "cart.html";
      feedback.replaceChildren(
        document.createTextNode(confirmation),
        cartLink,
        document.createTextNode(" " + getCartStatus()),
      );
  });
  updateAddState();
}

function setCartFeedback(message = "") {
  const feedback = document.querySelector("#cart-feedback");
  if (!feedback) return;

  const persistenceStatus = getCartStatus();
  const statusText = persistenceStatus === "Cart changes are saved in this browser."
    ? message
    : [message, persistenceStatus].filter(Boolean).join(" ");
  feedback.textContent = statusText;
}

function focusCartControl(target) {
  if (!target) {
    document.querySelector("#cart-shop-link")?.focus();
    return;
  }

  const control = Array.from(document.querySelectorAll("[data-cart-action]")).find((item) => (
    item.dataset.cartProductId === target.productId
    && item.dataset.cartSize === target.size
    && item.dataset.cartAction === target.action
  ));
  (control || document.querySelector("#cart-shop-link"))?.focus();
}

function createCartLine(line) {
  const product = getProduct(line.productId);
  if (!product) return null;

  const item = makeElement("li", { className: "cart-line" });
  const main = makeElement("div", { className: "cart-line-main" });
  const imageLink = makeElement("a", { className: "cart-line-image-link" });
  imageLink.href = productUrl(product);
  imageLink.setAttribute("aria-label", "View " + product.name);
  const image = makeElement("img", { className: "cart-line-image" });
  image.src = product.image;
  image.alt = product.name;
  image.width = 160;
  image.height = 160;
  image.loading = "lazy";
  image.decoding = "async";
  imageLink.append(image);

  const copy = makeElement("div", { className: "cart-line-copy" });
  const brand = makeElement("p", { className: "eyebrow", text: product.brand });
  const heading = makeElement("h2", { className: "cart-line-title" });
  const productLink = makeElement("a", { className: "cart-line-product-link", text: product.name });
  productLink.href = productUrl(product);
  heading.append(productLink);

  const size = makeElement("p", { className: "cart-line-size", text: "Size: " + line.size });
  const unitPrice = makeElement("p", { className: "cart-line-unit-price", text: formatPrice(product.price) + " each" });
  copy.append(brand, heading, size, unitPrice);
  main.append(imageLink, copy);

  const lineTotal = makeElement("p", { className: "cart-line-total" });
  lineTotal.append(
    makeElement("span", { className: "cart-line-total-label", text: "Line subtotal" }),
    makeElement("strong", { text: formatPrice(product.price * line.quantity) }),
  );

  const actions = makeElement("div", { className: "cart-line-actions" });
  const quantityForm = makeElement("form", { className: "cart-quantity-form" });
  const quantityId = "cart-quantity-" + product.id + "-" + line.size.toLowerCase();
  const quantityLabel = makeElement("label", {
    className: "visually-hidden",
    text: "Quantity for " + product.name + " (" + line.size + ")",
  });
  quantityLabel.htmlFor = quantityId;
  const quantityInput = makeElement("input");
  quantityInput.id = quantityId;
  quantityInput.type = "number";
  quantityInput.min = "1";
  quantityInput.step = "1";
  quantityInput.required = true;
  quantityInput.value = String(line.quantity);
  quantityInput.dataset.cartProductId = line.productId;
  quantityInput.dataset.cartSize = line.size;
  const updateButton = makeElement("button", { className: "button button-dark", text: "Update quantity" });
  updateButton.type = "submit";
  updateButton.dataset.cartAction = "update";
  updateButton.dataset.cartProductId = line.productId;
  updateButton.dataset.cartSize = line.size;
  quantityForm.append(quantityLabel, quantityInput, updateButton);

  quantityForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const quantity = Number(quantityInput.value);
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      setCartFeedback("Enter a whole-number quantity of 1 or more. The cart is unchanged.");
      quantityInput.focus();
      return;
    }

    const updatedCart = setQuantity(line.productId, line.size, quantity);
    const updatedLine = updatedCart.find((entry) => entry.productId === line.productId && entry.size === line.size);
    if (!updatedLine || updatedLine.quantity !== quantity) {
      setCartFeedback("That quantity is too large for an exact demo subtotal. Enter a smaller whole number; the cart is unchanged.");
      quantityInput.focus();
      return;
    }

    updateCartCount();
    renderCart("Quantity updated.", { productId: line.productId, size: line.size, action: "update" });
  });

  const removeButton = makeElement("button", { className: "button", text: "Remove" });
  removeButton.type = "button";
  removeButton.dataset.cartAction = "remove";
  removeButton.dataset.cartProductId = line.productId;
  removeButton.dataset.cartSize = line.size;
  removeButton.addEventListener("click", () => {
    const updatedCart = removeFromCart(line.productId, line.size);
    if (updatedCart.some((entry) => entry.productId === line.productId && entry.size === line.size)) {
      setCartFeedback("This item could not be removed. The cart is unchanged.");
      return;
    }

    updateCartCount();
    const nextLine = updatedCart[0];
    const focusTarget = nextLine
      ? { productId: nextLine.productId, size: nextLine.size, action: "update" }
      : null;
    renderCart("Removed " + product.name + " (" + line.size + ") from your cart.", focusTarget);
  });

  actions.append(quantityForm, removeButton);
  item.append(main, lineTotal, actions);
  return item;
}

function renderCart(message = "", focusTarget = null) {
  const items = document.querySelector("#cart-items");
  const emptyState = document.querySelector("#cart-empty-state");
  const subtotal = document.querySelector("#cart-subtotal");
  const actions = document.querySelector("#cart-actions");
  if (!items || !emptyState || !subtotal || !actions) return;

  const lines = getCart();
  const renderedLines = lines.map(createCartLine).filter(Boolean);
  items.replaceChildren(...renderedLines);
  emptyState.hidden = lines.length > 0;
  emptyState.textContent = "Your cart is empty. Browse the collection to find something you like.";
  subtotal.textContent = formatPrice(getSubtotal());
  actions.replaceChildren();

  if (lines.length > 0) {
    const checkout = makeElement("button", { className: "button button-dark", text: "Demo checkout" });
    checkout.type = "button";
    checkout.addEventListener("click", () => {
      clearCart();
      updateCartCount();
      renderCart("Demo checkout is complete. No order was placed and no payment was made.");
    });
    actions.append(checkout);
  }

  const shopLink = makeElement("a", { className: "button", text: "Continue shopping" });
  shopLink.id = "cart-shop-link";
  shopLink.href = "shop.html";
  actions.append(shopLink);

  setCartFeedback(message);
  updateCartCount();
  if (focusTarget !== null || lines.length === 0 && message) focusCartControl(focusTarget);
}

function setupSearch() {
  const form = document.querySelector("#site-search");
  const input = document.querySelector("#site-search-input");
  if (!form || !input) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const target = new URL(form.action, window.location.href);
    const query = input.value.trim();
    target.search = "";
    if (query) target.searchParams.set("q", query);
    window.location.assign(target.href);
  });
}

function setupDemoForms() {
  const messages = {
    contact: "This sample contact form is not connected. Nothing was sent or saved.",
    newsletter: "Newsletter signup is not connected. No email was sent or saved.",
  };

  for (const button of document.querySelectorAll("[data-demo-submit]")) {
    button.addEventListener("click", () => {
      const group = button.closest("[data-demo-form]");
      if (!group) return;

      const feedback = group.querySelector("[data-demo-feedback]");
      const message = messages[group.dataset.demoForm];
      if (!feedback || !message) return;

      for (const field of group.querySelectorAll("[data-demo-field]")) {
        field.value = "";
      }
      feedback.textContent = message;
    });
  }
}

function bootstrap() {
  setupSearch();
  setupDemoForms();
  updateCartCount();
  const page = document.body.dataset.page;
  if (page === "home") renderHome();
  if (page === "shop") renderShop();
  if (page === "product") renderProduct();
  if (page === "cart") renderCart();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
  bootstrap();
}
