export const PRODUCT_SIZES = Object.freeze(["Small", "Large", "XL", "XXL"]);

export const PRODUCTS = Object.freeze([
  // The old detail page was a static f1 view at KSh 10,000 with a generic title; ID details follow the card catalog.
  { id: "f1", brand: "adidas", name: "Cartoon Astronaut T-shirt", price: 7800, image: "../img/products/f1.jpg", collection: "featured" },
  { id: "f2", brand: "adidas", name: "Beach Art Shirt - Green and Pink Flowers", price: 7800, image: "../img/products/f2.jpg", collection: "featured" },
  { id: "f3", brand: "adidas", name: "Beach Art Shirt - Red and Beige Flowers", price: 7800, image: "../img/products/f3.jpg", collection: "featured" },
  { id: "f4", brand: "adidas", name: "Beach Art Shirt - White with Pink Flowers", price: 7800, image: "../img/products/f4.jpg", collection: "featured" },
  { id: "f5", brand: "adidas", name: "Beach Art Shirt - Navy Blue with Pink Flowers", price: 7800, image: "../img/products/f5.jpg", collection: "featured" },
  { id: "f6", brand: "adidas", name: "Beach Art Shirt - Red-Brown and Jean Blue Split Palette", price: 7800, image: "../img/products/f6.jpg", collection: "featured" },
  { id: "f7", brand: "adidas", name: "Floral Grey Trouser", price: 7900, image: "../img/products/f7.jpg", collection: "featured" },
  { id: "f8", brand: "adidas", name: "Lilac Top with Leaf Designs", price: 4400, image: "../img/products/f8.jpg", collection: "featured" },
  { id: "n1", brand: "adidas", name: "Plain Shirt - Light Blue", price: 6500, image: "../img/products/n1.jpg", collection: "new" },
  { id: "n2", brand: "adidas", name: "Plain Shirt - Dark Blue with Narrow White Line Pattern", price: 6500, image: "../img/products/n2.jpg", collection: "new" },
  { id: "n3", brand: "adidas", name: "Plain Shirt - Light Gray", price: 6500, image: "../img/products/n3.jpg", collection: "new" },
  // The committed Home card says KSh 6,500; Shop says KSh 7,000. Shop is the catalog source.
  { id: "n4", brand: "adidas", name: "Modern Art Grey Shirt", price: 7000, image: "../img/products/n4.jpg", collection: "new" },
  { id: "n5", brand: "adidas", name: "Plain Shirt - Ocean Blue", price: 6500, image: "../img/products/n5.jpg", collection: "new" },
  { id: "n6", brand: "adidas", name: "Grey Golf Short", price: 5500, image: "../img/products/n6.jpg", collection: "new" },
  { id: "n7", brand: "adidas", name: "Plain Shirt - Brown with Two Front Pockets", price: 8000, image: "../img/products/n7.jpg", collection: "new" },
  { id: "n8", brand: "adidas", name: "Plain Shirt - Dark Grey", price: 6500, image: "../img/products/n8.jpg", collection: "new" },
].map((product) => Object.freeze(product)));

export function getProduct(id) {
  return PRODUCTS.find((product) => product.id === String(id ?? ""));
}

export function getProductsByCollection(collection) {
  return PRODUCTS.filter((product) => product.collection === collection);
}
