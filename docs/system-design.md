# DenTool — System Design Document

**Version:** 1.0
**Status:** Approved
**Project:** DenTool
**Architecture:** Modular Monolith
**Primary Market:** Lebanon
**Initial Scale:** <100 users
**Primary Stack:** Next.js + NestJS + Prisma + PostgreSQL

---

## 1. Overview

## 1.1 Purpose

DenTool is an ecommerce platform for dental products, including dental tools, materials, and potentially dental machines in the future.

The platform is primarily targeted at:

* Dentists
* Dentistry students
* Dental laboratory students
* Other customers purchasing dental-related products

The MVP focuses on making product discovery and purchasing as fast and simple as possible.

The current purchasing process ends through WhatsApp rather than an internal order/payment workflow.

---

## 1.2 Business Context

DenTool owns and manages the products sold through the platform.

The initial business model is not a marketplace.

A marketplace model may be introduced in the future, but it is explicitly outside the MVP architecture and requirements.

The initial market is Lebanon with relatively low expected traffic.

---

## 2. MVP Goals

The three primary product goals are:

1. **Fastest possible purchasing experience**
2. **Easy product discovery**
3. **Easy product management for administrators**

These goals influence architectural decisions throughout the system.

For example, customer authentication is intentionally excluded from the MVP because forcing customers to register would add friction to the purchasing process.

---

## 3. MVP Non-Goals

The following are explicitly outside the MVP:

* Loyalty programs
* Reviews and ratings
* Advanced analytics
* Inventory forecasting
* Delivery tracking
* Complex payment systems
* Customer accounts
* Marketplace functionality
* Internal order management
* Multi-vendor functionality

These may be introduced in future iterations if business requirements justify them.

---

## 4. Actors

## 4.1 Customer

Customers can:

* Browse categories
* Browse products
* Search products
* Filter products
* Sort products
* View product details
* Add products to cart
* Modify cart quantities
* Submit a purchase request
* Continue the purchase through WhatsApp

Customers are not required to authenticate during the MVP.

---

## 4.2 Administrator

The administrator manages the DenTool catalog.

Admin capabilities include:

* Authenticate into the administration area
* Create products
* Update products
* Deactivate products
* Delete products
* Manage stock
* Manage product availability
* Create categories
* Update categories
* Deactivate categories
* Delete eligible categories
* Upload product images
* Delete product images
* Upload category images

The administrator is represented as a user with an administrative role.

Admin is not a separate application module.

---

## 4.3 WhatsApp Provider

WhatsApp is currently the channel through which the purchase conversation is completed.

The system generates a WhatsApp purchase URL containing the generated order message.

The customer then opens WhatsApp and manually sends the message.

No internal order is created during the MVP.

---

## 4.4 Cloudinary

Cloudinary is responsible for image storage, transformation, optimization, and delivery.

The backend does not store image binaries.

---

## 4.5 Future Payment Providers

Payment providers are outside the MVP.

They will be introduced later when the internal order/payment workflow is implemented.

---

## 5. High-Level Architecture

DenTool uses a **modular monolith architecture**.

The system consists of:

```text
Customer
    |
    v
Next.js Frontend
    |
    | HTTP
    v
NestJS Backend
    |
    +-------------------+
    |                   |
    v                   v
PostgreSQL          External Services
                    |
                    +-- Cloudinary
                    |
                    +-- WhatsApp
```

The backend is deployed as one NestJS application but is internally divided into well-defined modules.

---

## 6. Technology Stack

## Frontend

* Next.js
* TypeScript
* Redux
* Redux Persist / localStorage-based cart persistence

## Backend

* NestJS
* TypeScript
* Prisma
* DTO validation
* Guards
* Global exception filter
* Winston logging

## Database

* PostgreSQL
* Supabase PostgreSQL initially

## External Services

* Cloudinary for image storage and delivery
* WhatsApp as the current purchasing communication channel

## Future Infrastructure

* Redis
* Docker
* Nginx
* Multiple NestJS instances

---

## 7. Backend Architecture

The backend follows:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma
    ↓
PostgreSQL
```

## Controller

Responsible for:

* HTTP endpoints
* Request/response handling
* DTO input
* Delegating business operations to services

Controllers should not contain business logic.

---

## Service

Responsible for:

* Business rules
* Validation beyond basic DTO validation
* Coordinating repositories
* Coordinating external integrations
* Applying domain rules

---

## Repository

Responsible for:

* Database access
* Prisma queries
* Database-specific implementation details

The service layer should not directly contain raw Prisma queries.

---

## DTO

DTOs define and validate external API input.

Requests must not be trusted simply because they originate from the frontend.

DTO validation is required for:

* Body parameters
* Query parameters
* Route parameters where appropriate

---

## Guards

Guards are responsible for authentication and authorization.

Examples:

```text
SessionGuard
AdminGuard
```

Public APIs do not require authentication.

Admin APIs require an authenticated admin session.

---

## Global Exception Filter

The backend uses a global exception filter to provide a consistent error format.

Example:

```json
{
  "statusCode": 409,
  "code": "CATEGORY_NOT_EMPTY",
  "message": "Category cannot be deleted while it contains products.",
  "details": {}
}
```

Services should use stable application error codes rather than inventing inconsistent HTTP responses.

---

## 8. Module Boundaries

## 8.1 Auth Module

Responsible for:

* Admin login
* Logout
* Session management
* Password hashing
* Password reset
* OTP verification

Authentication is currently only required for administrators.

---

## 8.2 Users Module

Responsible for user persistence and user-related operations.

MVP users are primarily administrator accounts.

The system does not implement customer registration.

---

## 8.3 Products Module

Responsible for:

* Product CRUD
* Product status
* Stock
* Availability
* Product search
* Product filtering
* Product sorting
* Product images
* Product specifications
* Product use cases

---

## 8.4 Categories Module

Responsible for:

* Category CRUD
* Category status
* Category images
* Category/product relationships

Each product belongs to exactly one category.

A category can contain many products.

---

## 8.5 WhatsApp Module

Responsible for:

* Receiving purchase requests
* Validating cart items
* Fetching current product data
* Generating purchase messages
* Generating WhatsApp URLs

WhatsApp configuration and message formatting remain backend concerns.

---

## 9. Cart Architecture

The MVP does not have a backend Cart module.

The cart is maintained on the frontend using Redux and persisted using localStorage.

```text
Next.js
    ↓
Redux Cart State
    ↓
localStorage
```

The cart contains product identifiers and quantities.

The frontend must never be considered authoritative for:

* Product price
* Availability
* Stock
* Product existence

When the customer requests a WhatsApp purchase URL, the backend revalidates the cart.

```text
Cart
    ↓
Product IDs + quantities
    ↓
NestJS
    ↓
Fetch current products
    ↓
Validate
    ↓
Use current prices
    ↓
Generate WhatsApp message
```

This prevents manipulated client-side prices from reaching the purchase process.

---

## 10. Product Model

A product contains:

```text
id
categoryId
name
slug
description
price
stockQuantity
isAvailable
isActive
useCases
specifications
createdAt
updatedAt
```

## Product Rules

### Category

Every product belongs to exactly one category.

A category can contain many products.

### Price

Product prices are stored as VAT-inclusive prices.

The customer sees the final purchase price without additional VAT calculations during checkout.

### Stock

Stock is visible to administrators but not exposed as an exact quantity to customers.

### Availability

Availability is explicitly separate from stock.

```text
stockQuantity
```

represents physical stock.

```text
isAvailable
```

represents whether the business currently permits the product to be purchased.

### Active state

```text
isActive
```

controls whether the product is publicly visible.

These represent different concepts.

Example:

```text
isActive = false
→ Product is hidden.

isActive = true
isAvailable = false
→ Product is visible but unavailable.

isActive = true
isAvailable = true
stockQuantity = 0
→ Product is visible and normally available but currently sold out.

isActive = true
isAvailable = true
stockQuantity > 0
→ Product can be purchased.
```

---

## 11. Product Specifications and Use Cases

Product specifications are stored as JSONB.

Use cases may be represented as a JSON-compatible structure.

This is intentional because different dental products can have different attributes.

For example:

```json
{
  "brand": "Example",
  "material": "Composite",
  "shade": "A2"
}
```

This avoids prematurely creating rigid relational tables for product-specific attributes.

If future search/reporting requirements require structured querying of these fields, the data model can be revisited.

---

## 12. Product Images

Each product may contain up to **5 images**.

Each image contains metadata such as:

```text
id
productId
publicId
secureUrl
sortOrder
createdAt
```

`sortOrder` determines display order and identifies the primary/first image.

A separate `isPrimary` field is not required.

---

## 13. Category Model

A category contains:

```text
id
name
slug
description
imagePublicId
imageUrl
isActive
createdAt
updatedAt
```

A category may have one image.

Categories can be deactivated or deleted under the defined business rules.

A category containing products cannot be permanently deleted.

Example:

```text
Category has products
    ↓
DELETE
    ↓
409 CATEGORY_NOT_EMPTY
```

Deactivation is reversible.

---

## 14. Product and Category Lifecycle

The system distinguishes between **deactivation** and **permanent deletion**.

## Deactivation

Used when the entity should no longer be publicly available but should remain in the system.

```text
isActive = false
```

This is reversible.

## Permanent deletion

Permanently removes the entity.

Deletion is more restricted because related data may exist.

Future order history will further restrict product deletion.

---

## 15. Database Architecture

The initial relational model contains:

```text
User
Session
PasswordReset

Category
Product
ProductImage
```

Relationships:

```text
User 1 ───── N Session

User 1 ───── N PasswordReset

Category 1 ── N Product

Product 1 ── N ProductImage
```

---

## 16. User Entity

```text
User
--------------------
id
email
passwordHash
role
isActive
createdAt
updatedAt
```

Rules:

* `id` is UUID
* `email` is unique
* `passwordHash` is never exposed
* `role` currently supports administrator access
* `isActive` controls whether the account can authenticate

---

## 17. Session Entity

```text
Session
--------------------
id
userId
expiresAt
createdAt
```

Sessions are server-side and stored in PostgreSQL.

The raw session token is not stored directly.

Instead, a secure representation/hash is stored.

Session relationship:

```text
Session.userId → User.id
```

User deletion cascades to sessions.

---

## 18. Password Reset Entity

The password reset process uses:

* 6-digit OTP
* 5-minute expiration
* Maximum 3 verification attempts

OTP values are not stored in plaintext.

The database stores a hash.

Conceptually:

```text
PasswordReset
--------------------
id
userId
otpHash
attempts
expiresAt
verifiedAt
resetTokenHash
createdAt
```

After a successful password reset, existing authentication sessions are invalidated.

---

## 19. Database Constraints and Indexing

Important uniqueness constraints:

```text
User.email UNIQUE
Category.slug UNIQUE
Product.slug UNIQUE
```

Important indexes include:

```text
Product.categoryId
Product.isActive
Product.isAvailable
Product(categoryId, isActive)

ProductImage.productId

Session.userId
Session.expiresAt

PasswordReset.userId
PasswordReset.expiresAt
```

Additional search-specific indexes may be introduced based on real query patterns and performance measurements.

---

## 20. API Design

The backend uses:

```text
/api/...
```

as its API namespace.

---

## Authentication

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout

POST /api/auth/forgot-password
POST /api/auth/verify-otp
POST /api/auth/reset-password
```

---

## Products

Public:

```text
GET /api/products
GET /api/products/:slug
```

Admin:

```text
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
```

Product listing supports:

```text
search
category
availability
minPrice
maxPrice
sortBy
sortOrder
page
limit
```

---

## Categories

Public:

```text
GET /api/categories
GET /api/categories/:slug
```

Admin:

```text
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id
```

---

## WhatsApp

```text
POST /api/whatsapp/purchase-request
```

Request:

```json
{
  "items": [
    {
      "productId": "product-id",
      "quantity": 2
    }
  ]
}
```

Response:

```json
{
  "whatsappUrl": "https://wa.me/..."
}
```

---

## 21. API Response Conventions

Single resources are returned directly.

Example:

```json
{
  "id": "...",
  "name": "...",
  "slug": "..."
}
```

Collections use pagination metadata:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Errors use a consistent structure:

```json
{
  "statusCode": 409,
  "code": "CATEGORY_NOT_EMPTY",
  "message": "Category cannot be deleted while it contains products.",
  "details": {}
}
```

---

## 22. WhatsApp Purchase Flow

The MVP does not create an internal Order entity.

The flow is:

```text
Customer
    ↓
Add products to cart
    ↓
Redux + localStorage
    ↓
POST /api/whatsapp/purchase-request
    ↓
NestJS
    ↓
Validate product IDs
    ↓
Validate quantities
    ↓
Validate active state
    ↓
Validate availability
    ↓
Validate stock
    ↓
Fetch current prices
    ↓
Build WhatsApp message
    ↓
Generate WhatsApp URL
    ↓
Return URL
    ↓
Next.js opens WhatsApp
    ↓
Customer clicks Send
```

The backend owns:

* WhatsApp number
* Message formatting
* Product validation
* Current pricing
* Availability validation

The frontend only owns the cart experience and opening WhatsApp.

---

## 23. Cloudinary Architecture

Images are uploaded directly from the browser to Cloudinary.

NestJS does not proxy image binaries.

Flow:

```text
Admin
    ↓
Next.js
    ↓
Request signed upload parameters
    ↓
NestJS
    ↓
Generate signature
    ↓
Next.js
    ↓
Cloudinary
    ↓
Upload image
    ↓
Return asset metadata
    ↓
Next.js
    ↓
NestJS
    ↓
Save metadata in PostgreSQL
```

The Cloudinary API secret never reaches the browser.

---

## 24. Cloudinary Rules

Product:

```text
Maximum 5 images
```

Category:

```text
Maximum 1 image
```

Allowed formats:

```text
JPG
PNG
```

Maximum upload size:

```text
5 MB
```

The system must not rely only on filename extensions for file validation.

Cloudinary is responsible for:

* Image storage
* Image transformations
* CDN delivery
* Delivery optimization

The delivery strategy uses automatic format and quality optimization, conceptually:

```text
f_auto
q_auto
```

The original uploaded asset remains available in Cloudinary.

---

## 25. Image Lifecycle

Products are created before images are uploaded.

```text
Create Product
    ↓
Product ID exists
    ↓
Upload image
    ↓
Attach image metadata
```

PostgreSQL stores metadata:

```text
publicId
secureUrl
sortOrder
```

PostgreSQL does not store image binaries.

When an image is deleted:

```text
Admin
    ↓
NestJS
    ↓
Verify image ownership
    ↓
Delete Cloudinary asset
    ↓
Delete PostgreSQL metadata
```

Cloudinary and PostgreSQL do not share a transaction.

Therefore, the system accepts eventual consistency and should provide retry/reconciliation mechanisms if integration failures occur.

---

## 26. Authentication and Security

## Password Hashing

Passwords are hashed using:

```text
Argon2id
```

Passwords are never stored in plaintext.

---

## Session Security

Authentication uses server-side sessions rather than JWTs.

The session identifier is stored in an HTTP-only cookie.

Production cookie requirements:

```text
HttpOnly
Secure
SameSite=Lax
```

The application should use a dedicated cookie name such as:

```text
dentool_session
```

---

## Authorization

Admin endpoints require:

```text
Authenticated session
+
Admin authorization
```

Customers do not authenticate during MVP purchasing.

---

## CSRF

Because authentication uses cookies, state-changing authenticated operations must account for CSRF.

The system uses:

```text
SameSite=Lax
+
appropriate CSRF protection
```

The exact CSRF implementation is a feature-level authentication decision.

---

## Input Validation

All external input must be validated.

This includes:

* Request bodies
* Query parameters
* Route parameters
* Quantities
* Product IDs
* File uploads

Frontend validation improves UX but does not replace backend validation.

---

## 27. Authentication Rate Limiting

The login system applies progressive lockout behavior.

After failed login attempts:

```text
Attempts 1–5
→ 5 minute lockout

Attempts 6–10
→ 10 minute lockout

Attempts 11–15
→ 15 minute lockout

Attempts 16–20
→ 30 minute lockout
```

Password reset OTP:

```text
6 digits
5 minute expiration
3 attempts
```

Redis may later be introduced to improve distributed rate limiting.

PostgreSQL is sufficient for the initial single-instance deployment.

---

## 28. Performance Strategy

DenTool is initially a low-traffic application.

Expected traffic is approximately tens to hundreds of users, with fewer than 100 users initially.

The system therefore avoids premature infrastructure.

Performance priorities:

1. Fast product discovery
2. Fast product pages
3. Fast image delivery
4. Efficient API queries
5. Minimal unnecessary frontend requests

The system uses:

* PostgreSQL indexes
* Pagination
* Cloudinary CDN
* Image transformations
* Client-side cart persistence
* Appropriate Next.js caching
* Efficient Prisma queries

---

## 29. Search Strategy

Product search uses PostgreSQL for the MVP.

Search supports:

* Product name
* Relevant product text fields
* Category filtering
* Availability
* Price range
* Sorting

A dedicated search engine is not introduced initially because the current catalog size and traffic do not justify the operational complexity.

If search requirements or catalog size grow significantly, the search architecture can be revisited.

---

## 30. Scalability Strategy

Initial architecture:

```text
One Next.js deployment
        +
One NestJS instance
        +
PostgreSQL
        +
Cloudinary
```

Future scaling path:

```text
NestJS
   ↓
Docker
   ↓
Nginx
   ↓
Multiple NestJS instances
   ↓
Redis
   ↓
PostgreSQL
```

Scaling infrastructure is introduced only when actual requirements justify it.

---

## 31. Redis Strategy

Redis is deliberately not part of the initial architecture.

Potential future uses include:

* Distributed session/rate-limit support
* Caching
* Temporary data
* Performance optimization

The system should first establish real performance bottlenecks before introducing Redis.

---

## 32. Observability

The backend uses Winston for structured application logging.

Logs may include:

* Authentication failures
* Unexpected exceptions
* Integration failures
* Important administrator actions
* Request failures

Sensitive information must never be logged.

Never log:

* Passwords
* OTP values
* Session tokens
* API secrets
* Cloudinary secrets

---

## Request IDs

Requests should support a request/correlation identifier.

Example:

```text
X-Request-ID: abc123
```

This allows logs from the same request to be correlated.

---

## Health Check

The backend provides:

```text
GET /health
```

A basic health endpoint should remain useful for deployment and infrastructure monitoring.

It should not unnecessarily depend on every external integration.

---

## 33. Error Handling

Errors are handled centrally using the global exception filter.

The application distinguishes between:

* Validation errors
* Authentication errors
* Authorization errors
* Resource-not-found errors
* Business rule violations
* External service failures
* Unexpected internal errors

Stable error codes allow the frontend to respond to known cases without parsing human-readable messages.

---

## 34. Future Architecture

The architecture intentionally leaves room for:

## Orders

A future Orders module will replace the WhatsApp-only purchase completion flow.

Potential flow:

```text
Cart
 ↓
Order
 ↓
Payment
 ↓
Order status
 ↓
Notification
```

---

## Payments

Future payment providers will be isolated behind an adapter/strategy boundary.

Conceptually:

```text
PaymentService
     ↓
PaymentProvider
     ├── Provider A
     ├── Provider B
     └── Provider C
```

This prevents payment-specific implementation details from spreading through the domain.

---

## Notifications

A future Notifications module may support:

* Email
* WhatsApp
* Other notification channels

---

## Marketplace

A marketplace model may eventually introduce:

* Vendors
* Vendor products
* Vendor accounts
* Vendor inventory
* Vendor-specific orders

This is explicitly not part of the current design.

---

## 35. Architectural Decisions

## ADR-001 — Modular Monolith

**Decision:** Use a modular monolith.

**Reason:** DenTool is initially maintained by a single developer with low expected traffic. A modular monolith provides clear boundaries without the operational complexity of microservices.

---

## ADR-002 — Server-Side Sessions

**Decision:** Use server-side sessions instead of JWT authentication.

**Reason:** Only administrator authentication is required in the MVP. Server-side sessions provide simple revocation and avoid unnecessary JWT infrastructure.

---

## ADR-003 — Guest Customer Purchasing

**Decision:** Customers do not need accounts.

**Reason:** Fast purchasing is one of the top three MVP goals. Mandatory registration would introduce unnecessary friction.

---

## ADR-004 — Frontend Cart

**Decision:** Keep the cart on the frontend using Redux and localStorage.

**Reason:** There is no customer authentication or persistent server-side cart requirement in the MVP.

The backend validates the cart at the purchase-request boundary.

---

## ADR-005 — WhatsApp Purchase Flow

**Decision:** Complete the current purchase flow through WhatsApp rather than creating internal Orders.

**Reason:** This matches the current business process and avoids implementing an unnecessary order/payment system before it is required.

---

## ADR-006 — Direct Cloudinary Upload

**Decision:** Upload images directly from the browser to Cloudinary using backend-generated signed parameters.

**Reason:** Image binaries do not need to consume NestJS server bandwidth or memory.

---

## ADR-007 — PostgreSQL Search

**Decision:** Use PostgreSQL for product search in the MVP.

**Reason:** The expected catalog size and traffic do not justify a dedicated search infrastructure.

---

## ADR-008 — JSONB Product Specifications

**Decision:** Store product specifications using JSONB.

**Reason:** Dental products can have different attributes. A rigid relational schema would create unnecessary complexity during the MVP.

---

## ADR-009 — Explicit Product Availability

**Decision:** Keep `isAvailable` separate from `stockQuantity`.

**Reason:** Physical stock and business availability are different concepts.

A product can have stock but temporarily not be available for purchase.

---

## ADR-010 — Category Deletion Protection

**Decision:** A category containing products cannot be permanently deleted.

**Reason:** Prevent accidental loss or invalidation of catalog relationships.

---

## 36. Project Documentation Structure

The system design is stored outside the application modules:

```text
DenTool/
├── apps/
│   ├── api/
│   └── web/
│
├── docs/
│   ├── system-design.md
│   ├── decisions/
│   └── features/
│
├── package.json
└── README.md
```

The system design document defines the high-level architecture.

Feature-level design documents derive from it.

Potential future documents:

```text
docs/features/
├── authentication.md
├── product-catalog.md
├── categories.md
├── cloudinary-media.md
└── whatsapp-purchase.md
```

Architecture decisions may be recorded separately when useful:

```text
docs/decisions/
├── 001-modular-monolith.md
├── 002-server-side-sessions.md
├── 003-frontend-cart.md
└── ...
```

---

## 37. System Design Principles

The following principles guide implementation:

1. **Prefer simple architecture until complexity is justified.**
2. **Business logic belongs in services, not controllers.**
3. **Database access belongs behind repository boundaries.**
4. **Never trust client-provided prices or business state.**
5. **External services must be isolated behind integration boundaries.**
6. **Customer purchasing should remain as frictionless as possible.**
7. **Security decisions must not depend solely on frontend validation.**
8. **Do not introduce infrastructure before there is a demonstrated need.**
9. **Design modules so future features can be added without rewriting the core.**
10. **Document important architectural decisions and their tradeoffs.**

---

## 38. Summary Architecture

```text
                         ┌──────────────────┐
                         │     Customer     │
                         └────────┬─────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │        Next.js          │
                    │                         │
                    │ Product UI              │
                    │ Search / Filters        │
                    │ Redux Cart               │
                    │ localStorage             │
                    └────────────┬────────────┘
                                 │
                           HTTP / Cookies
                                 │
                                 ▼
              ┌────────────────────────────────────┐
              │              NestJS                 │
              │                                    │
              │ Auth                                │
              │ Users                               │
              │ Products                            │
              │ Categories                          │
              │ WhatsApp                            │
              │                                    │
              │ Controller → Service → Repository  │
              └───────────────┬────────────────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
        ┌─────────────────┐       ┌──────────────────┐
        │   PostgreSQL    │       │    Cloudinary    │
        │                 │       │                  │
        │ Users           │       │ Product images  │
        │ Sessions        │       │ Category images │
        │ PasswordReset   │       │ CDN / Transform │
        │ Categories      │       └──────────────────┘
        │ Products        │
        │ ProductImages   │
        └─────────────────┘
                 │
                 │ Future
                 ▼
              ┌───────┐
              │ Redis │
              └───────┘


       NestJS
          │
          ▼
    WhatsApp URL
          │
          ▼
      WhatsApp
```

---

## 39. Implementation Direction

The System Design is now the architectural source of truth for the MVP.

Implementation should proceed feature-by-feature rather than building the entire backend at once.

Recommended order:

```text
1. Database schema
2. Auth
3. Categories
4. Products
5. Product discovery
6. Cloudinary media
7. Frontend cart
8. WhatsApp purchase request
9. Admin UI
10. Integration testing
11. Deployment
```

Feature-level designs should be written before implementing complex features and must remain consistent with this document.

## Status: System Design v1 — Approved
