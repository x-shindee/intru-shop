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

export interface CustomCharge {
  label: string
  amount: number
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
  discount_amount: number
  shipping_cost: number
  custom_charges: CustomCharge[]
  tax_amount: number
  tax_breakdown: TaxBreakdown
  total_amount: number
  payment_type: 'prepaid' | 'cod'
  payment_status: 'pending' | 'success' | 'failed' | 'refunded' | 'abandoned'
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
  referral_code_used: string | null
  referral_discount: number
  requires_unboxing_video: boolean
  notes: string | null
  created_at: string
  updated_at: string
  abandoned_at: string | null
}

export interface CartItem {
  product: Product
  size: string
  quantity: number
}

export interface StoreConfig {
  id: string
  business_name: string
  business_email: string
  business_phone: string
  business_address: string | null
  gstin: string | null
  business_state: string
  state_code: string
  extra_charges_enabled: boolean
  custom_charges: CustomCharge[]
  free_shipping_enabled: boolean
  free_shipping_threshold: number
  default_shipping_cost: number
  cod_charges: number
  is_referral_enabled: boolean
  referral_discount_type: 'percentage' | 'fixed'
  referral_discount_value: number
  referral_credit_amount: number
  min_order_for_referral: number
  require_unboxing_video: boolean
  abandoned_order_timeout_minutes: number
  grievance_officer_name: string | null
  grievance_officer_email: string | null
  grievance_officer_phone: string | null
  created_at: string
  updated_at: string
}

export interface BlockedPincode {
  id: string
  pincode: string
  reason: string | null
  blocked_by: string | null
  created_at: string
}

export interface ReferralCode {
  id: string
  code: string
  owner_email: string
  owner_name: string | null
  uses_count: number
  max_uses: number
  is_active: boolean
  created_at: string
  expires_at: string | null
}

export interface CustomerWallet {
  id: string
  customer_email: string
  customer_name: string | null
  balance: number
  total_earned: number
  total_spent: number
  referral_code: string | null
  successful_referrals: number
  created_at: string
  updated_at: string
}

export interface WalletTransaction {
  id: string
  wallet_id: string
  transaction_type: 'credit' | 'debit'
  amount: number
  description: string | null
  order_id: string | null
  referral_code: string | null
  created_at: string
}

export interface ShiprocketRate {
  courier_name: string
  rate: number
  estimated_delivery_days: number
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

export interface OrderCalculation {
  subtotal: number
  discount: number
  shipping_cost: number
  custom_charges: CustomCharge[]
  custom_charges_total: number
  tax_amount: number
  tax_breakdown: TaxBreakdown
  total: number
}
