import { getProduct, PRODUCT_SIZES } from "./products.js";

const CART_STORAGE_KEY = "cara-demo-cart-v1";
const SAVED_STATUS = "Cart changes are saved in this browser.";
const SESSION_STORAGE_STATUS = "Local storage could not be used. Cart changes are kept in this tab's session and will be cleared when the tab closes.";
const MEMORY_ONLY_STATUS = "Browser storage is unavailable. Cart changes are kept only on this page and will be lost when you leave or reload.";

let cart = [];
let storage = null;
let storageType = null;
let persistenceStatus = MEMORY_ONLY_STATUS;

function isValidProductId(productId) {
  return typeof productId === "string" && getProduct(productId) !== undefined;
}

function isValidSize(size) {
  return typeof size === "string" && PRODUCT_SIZES.includes(size);
}

function isValidQuantity(quantity) {
  return Number.isSafeInteger(quantity) && quantity > 0;
}

function isValidLine(line) {
  return line !== null
    && typeof line === "object"
    && !Array.isArray(line)
    && isValidProductId(line.productId)
    && isValidSize(line.size)
    && isValidQuantity(line.quantity);
}

function hasSafeSubtotal(lines) {
  let subtotal = 0;
  for (const line of lines) {
    const product = getProduct(line.productId);
    if (!product) return false;

    const lineSubtotal = product.price * line.quantity;
    if (!Number.isSafeInteger(lineSubtotal)) return false;

    subtotal += lineSubtotal;
    if (!Number.isSafeInteger(subtotal)) return false;
  }

  return true;
}

function lineKey(productId, size) {
  return JSON.stringify([productId, size]);
}

function copyCart() {
  return cart.map((line) => ({
    productId: line.productId,
    size: line.size,
    quantity: line.quantity,
  }));
}

function getBrowserStorage(type) {
  try {
    if (typeof window === "undefined") return null;
    return type === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function selectStorage(type, candidate) {
  storage = candidate;
  storageType = type;
  persistenceStatus = type === "local" ? SAVED_STATUS : SESSION_STORAGE_STATUS;
}

function selectSessionStorage() {
  const candidate = getBrowserStorage("session");
  if (!candidate) {
    storage = null;
    storageType = null;
    persistenceStatus = MEMORY_ONLY_STATUS;
    return false;
  }

  selectStorage("session", candidate);
  return true;
}

function clearSessionFallback() {
  const sessionStorage = getBrowserStorage("session");
  if (!sessionStorage) return;
  try {
    sessionStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // Local storage remains the primary copy when this cleanup is unavailable.
  }
}

function persistCart() {
  if (!storage && !selectSessionStorage()) return;

  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    persistenceStatus = storageType === "local" ? SAVED_STATUS : SESSION_STORAGE_STATUS;
    if (storageType === "local") clearSessionFallback();
  } catch {
    if (storageType === "local" && selectSessionStorage()) {
      try {
        storage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        persistenceStatus = SESSION_STORAGE_STATUS;
        return;
      } catch {
        storage = null;
        storageType = null;
      }
    } else {
      storage = null;
      storageType = null;
    }

    persistenceStatus = MEMORY_ONLY_STATUS;
  }
}

function clearInvalidSavedData() {
  cart = [];
  try {
    storage.removeItem(CART_STORAGE_KEY);
    persistenceStatus = storageType === "local"
      ? "Invalid saved cart data was cleared. New cart changes will be saved in this browser."
      : "Invalid saved cart data was cleared. New cart changes will be kept in this tab's session and cleared when it closes.";
  } catch {
    if (storageType === "local" && selectSessionStorage()) {
      persistCart();
      if (storageType === "session") {
        persistenceStatus = "Invalid saved cart data was cleared. New cart changes are kept in this tab's session and cleared when it closes.";
      }
    } else {
      storage = null;
      storageType = null;
      persistenceStatus = MEMORY_ONLY_STATUS;
    }
  }
}

function sanitizeStoredCart(storedLines) {
  const lines = [];
  const byKey = new Map();
  let totalCount = 0;
  let changed = false;

  for (const candidate of storedLines) {
    if (!isValidLine(candidate)) {
      changed = true;
      continue;
    }

    const keys = Object.keys(candidate);
    if (
      keys.length !== 3
      || !Object.prototype.hasOwnProperty.call(candidate, "productId")
      || !Object.prototype.hasOwnProperty.call(candidate, "size")
      || !Object.prototype.hasOwnProperty.call(candidate, "quantity")
    ) {
      changed = true;
    }

    const key = lineKey(candidate.productId, candidate.size);
    const existing = byKey.get(key);
    const nextLineQuantity = existing
      ? existing.quantity + candidate.quantity
      : candidate.quantity;
    const nextCount = totalCount + candidate.quantity;

    if (!Number.isSafeInteger(nextLineQuantity) || !Number.isSafeInteger(nextCount)) {
      changed = true;
      continue;
    }

    const normalized = {
      productId: candidate.productId,
      size: candidate.size,
      quantity: nextLineQuantity,
    };
    const proposedLines = existing
      ? lines.map((line) => line === existing ? normalized : line)
      : [...lines, normalized];
    if (!hasSafeSubtotal(proposedLines)) {
      changed = true;
      continue;
    }

    if (existing) {
      existing.quantity = nextLineQuantity;
      changed = true;
    } else {
      lines.push(normalized);
      byKey.set(key, normalized);
    }

    totalCount = nextCount;
  }

  return { lines, changed };
}

function readCartFromStorage() {
  let serializedCart;
  try {
    serializedCart = storage.getItem(CART_STORAGE_KEY);
  } catch {
    if (storageType === "local" && selectSessionStorage()) {
      readCartFromStorage();
    } else {
      storage = null;
      storageType = null;
      persistenceStatus = MEMORY_ONLY_STATUS;
    }
    return;
  }

  if (serializedCart === null) return;

  let storedLines;
  try {
    storedLines = JSON.parse(serializedCart);
  } catch {
    clearInvalidSavedData();
    return;
  }

  if (!Array.isArray(storedLines)) {
    clearInvalidSavedData();
    return;
  }

  const sanitized = sanitizeStoredCart(storedLines);
  cart = sanitized.lines;
  if (sanitized.changed) {
    persistCart();
    if (storageType === "local") {
      persistenceStatus = "Saved cart data was cleaned; valid items are saved in this browser.";
    } else if (storageType === "session") {
      persistenceStatus = "Saved cart data was cleaned; valid items are kept in this tab's session and cleared when it closes.";
    }
  }
}

function loadCart() {
  const sessionStorage = getBrowserStorage("session");
  if (sessionStorage) {
    try {
      if (sessionStorage.getItem(CART_STORAGE_KEY) !== null) {
        selectStorage("session", sessionStorage);
        readCartFromStorage();
        return;
      }
    } catch {
      // A blocked session store must not prevent reading local storage.
    }
  }

  const localStorage = getBrowserStorage("local");
  if (localStorage) {
    selectStorage("local", localStorage);
  } else if (sessionStorage) {
    selectStorage("session", sessionStorage);
  } else {
    persistenceStatus = MEMORY_ONLY_STATUS;
    return;
  }

  readCartFromStorage();
}

loadCart();

export function getCart() {
  return copyCart();
}

export function addToCart(productId, size, quantity) {
  if (!isValidProductId(productId) || !isValidSize(size) || !isValidQuantity(quantity)) {
    return getCart();
  }

  const existing = cart.find((line) => line.productId === productId && line.size === size);
  const nextQuantity = existing ? existing.quantity + quantity : quantity;
  if (!Number.isSafeInteger(nextQuantity)) return getCart();

  const nextCart = existing
    ? cart.map((line) => (
      line.productId === productId && line.size === size
        ? { productId, size, quantity: nextQuantity }
        : line
    ))
    : [...cart, { productId, size, quantity }];

  const nextCount = nextCart.reduce((total, line) => total + line.quantity, 0);
  if (!Number.isSafeInteger(nextCount) || !hasSafeSubtotal(nextCart)) return getCart();

  cart = nextCart;
  persistCart();
  return getCart();
}

export function setQuantity(productId, size, quantity) {
  if (!isValidProductId(productId) || !isValidSize(size) || !isValidQuantity(quantity)) {
    return getCart();
  }

  const lineExists = cart.some((line) => line.productId === productId && line.size === size);
  if (!lineExists) return getCart();

  const nextCart = cart.map((line) => (
    line.productId === productId && line.size === size
      ? { productId, size, quantity }
      : line
  ));
  const nextCount = nextCart.reduce((total, line) => total + line.quantity, 0);
  if (!Number.isSafeInteger(nextCount) || !hasSafeSubtotal(nextCart)) return getCart();

  cart = nextCart;
  persistCart();
  return getCart();
}

export function removeFromCart(productId, size) {
  if (!isValidProductId(productId) || !isValidSize(size)) return getCart();

  const nextCart = cart.filter((line) => !(line.productId === productId && line.size === size));
  if (nextCart.length === cart.length) return getCart();

  cart = nextCart;
  persistCart();
  return getCart();
}

export function getCartCount() {
  return cart.reduce((total, line) => total + line.quantity, 0);
}

export function getSubtotal() {
  return cart.reduce((total, line) => {
    const product = getProduct(line.productId);
    return product ? total + product.price * line.quantity : total;
  }, 0);
}

export function clearCart() {
  cart = [];
  persistCart();
}

export function getCartStatus() {
  return persistenceStatus;
}
