# Cara

Cara is a local, browser-only clothing storefront project. This pass provides eight semantic page shells, a shared responsive visual system, local navigation, and stable page hooks for the catalog and cart work.

## Run locally

From the Cara directory, start Python's built-in HTTP server:

    py -m http.server 8000

On Windows, use the py launcher shown above. In a shell where Python is available as python, use python -m http.server 8000 instead.

Then open:

    http://localhost:8000/src/index.html

Run the server from the Cara directory so relative image and page paths resolve. No packages, backend, external APIs, account service, or payment processor are required.

## Pages and interactions

The existing page filenames remain the local routes. Each document identifies its role with body[data-page]: home (index.html), shop, product, cart, about, blog, contact, and account (home.html).

The shared header keeps the logo route at index.html, the main navigation at #primary-navigation, the search form at #site-search (searches the local catalog on shop.html), and the cart link/count at #cart-link and #cart-count. The shared main landmark is #main-content; the footer is #site-footer, with its local route list at #footer-navigation.

The Home and Shop routes render the 16 bundled sample products. Shop search and pagination run locally, and each product card opens its matching detail route. Product detail requires a size and a positive whole-number quantity before adding a line to the local cart. The cart supports same-size merging, different size lines, quantity changes, removal, totals, and a demo checkout that clears the cart without placing an order or taking payment.

The About and Journal pages reuse the bundled imagery and label their replacement copy as demo content. The old login route is an Account Demo page with guest shopping and no credential fields. Contact and newsletter controls only clear their entered fields and display a notice; they do not send or save the entered information. Avoid entering real personal information into any demo field.

Page hooks used by the storefront:

- Home: #home-hero, #featured-products, and #new-products.
- Shop: #shop-results, #shop-empty-state, #shop-status, and #shop-pagination.
- Product: #product-detail, #product-status, and #product-feedback.
- Cart: #cart-content, #cart-items, #cart-empty-state, #cart-subtotal, #cart-actions, and #cart-feedback.
- Secondary pages: #about-content, #blog-content, #contact-content, and #account-content.

The interface uses bundled images in img/ through relative paths. It has no backend, account service, external API, or payment processor.
