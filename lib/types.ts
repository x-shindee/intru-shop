export interface Product {
  id: string
  title: string
  description: string | null
  price: number
  compare_at_price: number | null
  stock: number
  hsn_code: string
  image_url: string | null
  images: string[]
  size_chart_url: string | null
  is_live: boolean
  country_of_origin: string
  material: string | null
  gsm: string | null
  fit: string | null
  color: string | null
  care_instructions: string | null
  variants: ProductVariant[]
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  size: string
  stock: number
}

export interface Address {
  name: string
  phone: string
  email: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface OrderItem {
  product_id: string
  title: string
  size: string
  quantity: number
  price: number
  image_url: string | null
}

export interface TaxBreakdown {
  cgst?: number
  sgst?: number
  igst?: number
  rate: number
}

export interface Order {
  id: string
  order_number: string
  customer_email: string
  customer_name: string
  customer_phone: string
  shipping_address: Address
  billing_address: Address | null
  items: OrderItem[]
  subtotal: number
  shipping_cost: number
  tax_amount: number
  tax_breakdown: TaxBreakdown
  total_amount: number
  payment_type: 'prepaid' | 'cod'
  payment_status: 'pending' | 'success' | 'failed' | 'refunded'
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  razorpay_signature: string | null
  shipping_status: 'pending' | 'processing' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled'
  shiprocket_order_id: string | null
  shiprocket_shipment_id: string | null
  courier_name: string | null
  tracking_number: string | null
  verification_status: 'pending' | 'verified' | 'cancelled'
  verified_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CartItem {
  product: Product
  size: string
  quantity: number
}

export interface Settings {
  business_info: {
    name: string
    email: string
    phone: string
    address: string
    gstin: string
    state: string
    state_code: string
  }
  shipping_config: {
    free_shipping_threshold: number
    default_shipping_cost: number
    cod_charges: number
  }
  grievance_officer: {
    name: string
    email: string
    phone: string
  }
}

export interface ShiprocketRate {
  courier_name: string
  rate: number
  estimated_delivery_days: number
}
