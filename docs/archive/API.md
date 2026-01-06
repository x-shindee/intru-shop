# API Documentation - Intru E-commerce Store

## API Endpoints

All API endpoints are located in `/app/api/` directory using Next.js Route Handlers.

---

## Orders API

### Create Order
**POST** `/api/orders/create`

Creates a new order with automatic GST calculation and Razorpay order creation (for prepaid).

#### Request Body
```json
{
  "customer_email": "customer@example.com",
  "customer_name": "John Doe",
  "customer_phone": "9876543210",
  "shipping_address": {
    "name": "John Doe",
    "phone": "9876543210",
    "email": "customer@example.com",
    "line1": "123 Street Name",
    "line2": "Apartment 4B",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "country": "India"
  },
  "billing_address": { /* same structure as shipping_address */ },
  "items": [
    {
      "product_id": "uuid-here",
      "title": "Product Name",
      "size": "M",
      "quantity": 2,
      "price": 999.00,
      "image_url": "https://..."
    }
  ],
  "payment_type": "prepaid" | "cod"
}
```

#### Response (Prepaid)
```json
{
  "success": true,
  "order_id": "uuid-here",
  "order_number": "INTRU-20240120-1234",
  "razorpay_order_id": "order_xxxxx",
  "amount": 1178.82,
  "currency": "INR"
}
```

#### Response (COD)
```json
{
  "success": true,
  "order_id": "uuid-here",
  "order_number": "INTRU-20240120-1234",
  "payment_type": "cod"
}
```

---

### Verify Payment
**POST** `/api/orders/verify-payment`

Verifies Razorpay payment signature and updates order status.

#### Request Body
```json
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_string",
  "order_id": "uuid-here"
}
```

#### Response
```json
{
  "success": true,
  "order": { /* complete order object */ }
}
```

#### Functionality
- Verifies HMAC signature
- Updates payment status to "success"
- Sets shipping status to "ready_to_ship"
- Decrements product stock atomically
- Prevents overselling with database-level locking

---

### Verify COD Order
**POST** `/api/orders/verify-cod`

Manually verify COD order after WhatsApp confirmation.

#### Request Body
```json
{
  "order_id": "uuid-here"
}
```

#### Response
```json
{
  "success": true,
  "order": { /* complete order object */ }
}
```

---

## Shipping API (Shiprocket Integration)

### Get Shipping Rates
**POST** `/api/shipping/rates`

Fetch available courier services and rates from Shiprocket.

#### Request Body
```json
{
  "pickup_pincode": "560001",
  "delivery_pincode": "400001",
  "weight": 0.5,
  "cod": 0
}
```

#### Response
```json
{
  "success": true,
  "rates": [
    {
      "courier_name": "BlueDart",
      "courier_company_id": 1,
      "rate": 65.00,
      "estimated_delivery_days": 3,
      "cod_charges": 0
    },
    {
      "courier_name": "Delhivery",
      "courier_company_id": 2,
      "rate": 55.00,
      "estimated_delivery_days": 4,
      "cod_charges": 0
    }
  ]
}
```

---

### Create Shipment
**POST** `/api/shipping/create`

Create shipment in Shiprocket and generate AWB (Airway Bill).

#### Request Body
```json
{
  "order_id": "uuid-here",
  "courier_company_id": 1
}
```

#### Response
```json
{
  "success": true,
  "shiprocket_order_id": "12345",
  "shiprocket_shipment_id": "67890"
}
```

#### Functionality
- Creates order in Shiprocket
- Generates AWB with selected courier
- Updates order with shipping details
- Changes shipping status to "processing"

---

## Webhooks API

### Razorpay Webhook
**POST** `/api/webhooks/razorpay`

Handles Razorpay payment webhooks for asynchronous payment updates.

#### Headers Required
```
x-razorpay-signature: webhook_signature
```

#### Webhook Events Handled
1. **payment.captured** - Payment successful
2. **payment.failed** - Payment failed
3. **refund.created** - Refund processed

#### Event Payload
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxxxx",
        "order_id": "order_xxxxx",
        "amount": 117882,
        "currency": "INR",
        "status": "captured"
      }
    }
  }
}
```

#### Security
- Verifies webhook signature with HMAC SHA256
- Rejects requests with invalid signatures
- Idempotent - safe to retry

---

## GST Calculation Logic

The GST calculation is handled by `lib/gst.ts`:

### Intrastate (Same State)
- **CGST**: 9% (Central GST)
- **SGST**: 9% (State GST)
- **Total**: 18%

### Interstate (Different States)
- **IGST**: 18% (Integrated GST)

### Example Calculation
```typescript
// Order from Karnataka to Karnataka
calculateGST(1000, "Karnataka", "Karnataka")
// Returns:
// {
//   taxAmount: 180,
//   taxBreakdown: {
//     cgst: 90,    // 9%
//     sgst: 90,    // 9%
//     rate: 18
//   }
// }

// Order from Karnataka to Maharashtra
calculateGST(1000, "Maharashtra", "Karnataka")
// Returns:
// {
//   taxAmount: 180,
//   taxBreakdown: {
//     igst: 180,   // 18%
//     rate: 18
//   }
// }
```

---

## Database Functions

### Decrement Product Stock
PostgreSQL function to safely decrement stock (prevents overselling).

```sql
SELECT decrement_product_stock(
  'product-uuid',
  'M',           -- size
  2              -- quantity
);
```

Returns `true` if successful, `false` if insufficient stock.

**Features:**
- Row-level locking (`FOR UPDATE`)
- Atomic operation
- Prevents race conditions
- Returns false if stock insufficient

---

## Error Handling

All API endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### HTTP Status Codes
- **200**: Success
- **400**: Bad request (invalid data)
- **401**: Unauthorized
- **404**: Not found
- **500**: Server error

---

## Authentication

### Admin Routes
Admin routes (`/api/admin/*`) should be protected with authentication middleware.

**TODO**: Implement admin authentication using:
- Supabase Auth
- Or custom JWT-based auth
- Or session-based auth

### Public Routes
All customer-facing routes are public but protected with:
- Cloudflare Turnstile (bot protection)
- Rate limiting (recommended)
- Input validation

---

## Rate Limiting (Recommended)

For production, implement rate limiting on sensitive endpoints:

```typescript
// Example using upstash/ratelimit
import { Ratelimit } from "@upstash/ratelimit"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})

// In API route
const { success } = await ratelimit.limit(ip)
if (!success) {
  return NextResponse.json(
    { error: "Too many requests" },
    { status: 429 }
  )
}
```

---

## Testing APIs

### Using cURL

**Create Order (COD)**
```bash
curl -X POST https://intru.in/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "test@example.com",
    "customer_name": "Test User",
    "customer_phone": "9876543210",
    "shipping_address": {
      "name": "Test User",
      "line1": "123 Test St",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001",
      "country": "India"
    },
    "items": [...],
    "payment_type": "cod"
  }'
```

**Get Shipping Rates**
```bash
curl -X POST https://intru.in/api/shipping/rates \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_pincode": "560001",
    "delivery_pincode": "400001",
    "weight": 0.5
  }'
```

### Using Postman

Import the following collection structure:

```json
{
  "name": "Intru API",
  "requests": [
    {
      "name": "Create Order",
      "method": "POST",
      "url": "{{base_url}}/api/orders/create",
      "body": { /* request body */ }
    },
    {
      "name": "Get Shipping Rates",
      "method": "POST",
      "url": "{{base_url}}/api/shipping/rates",
      "body": { /* request body */ }
    }
  ]
}
```

---

## Environment Variables Reference

All API endpoints use these environment variables:

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Razorpay
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

### Shiprocket
- `SHIPROCKET_EMAIL`
- `SHIPROCKET_PASSWORD`

### WhatsApp
- `NEXT_PUBLIC_WHATSAPP_NUMBER`

---

## Support

For API issues or questions:
- Technical: Check API logs in Cloudflare Pages
- Business: support@intru.in

---

**Last Updated**: January 2024
