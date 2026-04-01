# CRUNCHX – Healthy Snacking E-Commerce Webapp

## Functionality Overview

---

## 1. Product Catalog & Discovery

- **Home Page** – Hero section, featured products, category grid, offers, trust points, and customer reviews carousel
- **Search** – `/search` for product search
- **Categories** – `/categories` and `/category/:slug` for browsing by category (Protein Bars, Multigrain Snacks, Health Mix, Chikki & Sweets)
- **Product Detail** – `/product/:id` for individual product pages
- **Featured Products** – Highlighted products on the home page

---

## 2. Build Combo

- **Build Combo** – `/build-combo` to create custom combos with:
  - Multiple products and quantities
  - Optional gift wrap and gift message
  - Combo-specific pricing

---

## 3. Shopping Cart

- Add products and combos to cart
- Update quantity and remove items
- Subtotal, delivery charge (₹49; free above ₹499), and savings display
- Cart badge in navbar showing item count
- Optimistic updates via React Query

---

## 4. Checkout

- **Address Selection** – Choose from saved addresses or add new
- **Delivery Slot** – Date and time selection (Morning, Afternoon, Evening)
- **Coupon** – `CRUNCHFIRST` for 20% off first order
- **Order Summary** – Subtotal, delivery, discount, total
- **Place Order** – Creates order via `place-order` Edge Function

---

## 5. Address Management

- **Addresses Page** – `/profile/addresses`
- Add, edit, delete addresses
- Set default address
- Labels (Home, Work, Other)
- Post-login prompt to add address if none exists

---

## 6. Orders

- **My Orders** – `/orders` with filters (All, Active, Delivered)
- **Order Detail** – `/order/:orderId` with:
  - Status timeline
  - Item list
  - Shipping address
  - Reorder (add items to cart)
  - Cancel order (when allowed)
- **Order Confirmation** – `/order-confirmation` after placing order
- **Order Tracking** – `/order-tracking`

---

## 7. Payments

- **Payment Page** – `/payment` for completing payment
- **Stripe Integration** – `create-payment-intent` and `payment-webhook` Edge Functions
- Webhook signature verification (HMAC-SHA256)
- Payment status handling (success/failure, stock restore on failure)

---

## 8. User Account & Profile

- **Auth** – `/auth` (Supabase Auth, JWT-based)
- **Profile** – `/profile` hub
- **Edit Profile** – `/profile/edit`
- **Preferences** – `/profile/preferences`
- **Saved Products** – `/profile/saved`
- **Ratings** – `/profile/ratings`
- **Recently Viewed** – `/profile/recent`
- **Payment Methods** – `/profile/payments`
- **Help Center** – `/profile/help`
- **Delete Account** – `delete-account` Edge Function

---

## 9. Backend (Supabase Edge Functions)

| Function | Purpose |
|----------|---------|
| `list-products` | Product listing |
| `list-categories` | Category listing |
| `get-product-by-id` | Single product |
| `get-cart` | Fetch cart |
| `add-to-cart` | Add product to cart |
| `update-cart-item` | Update quantity |
| `remove-cart-item` | Remove item |
| `clear-cart` | Empty cart |
| `cart-totals` | Cart totals |
| `place-order` | Create order from cart |
| `create-payment-intent` | Stripe payment intent |
| `payment-webhook` | Stripe webhook handling |
| `list-my-orders` | User orders |
| `get-order-by-id` | Single order |
| `cancel-order` | Cancel order |
| `get-my-addresses` | User addresses |
| `add-address` | Add address |
| `update-address` | Update address |
| `delete-address` | Delete address |
| `set-default-address` | Set default address |
| `delete-account` | Delete user account |

---

## 10. UX & Design

- **Theme Toggle** – Light/dark mode
- **Responsive Layout** – Mobile bottom nav, desktop top nav
- **Skeletons** – Cart, checkout, address list loading states
- **Empty States** – Empty cart, no addresses, no orders
- **Framer Motion** – Page and list animations
- **Toast Notifications** – Sonner for feedback

---

## 11. Info & Legal Pages

- About, Contact, Privacy Policy, Terms of Service
- Shipping info, Returns & refunds

---

## Summary

CRUNCHX is a full-featured e-commerce webapp for healthy snacks with product catalog, cart, checkout, payments, order management, address management, and user profiles, powered by Supabase and Stripe.
