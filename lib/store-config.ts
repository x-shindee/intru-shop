import { supabaseAdmin } from './supabase'
import type { StoreConfig, CustomCharge, OrderCalculation } from './types'
import { calculateGST } from './gst'

/**
 * Get store configuration
 */
export async function getStoreConfig(): Promise<StoreConfig | null> {
  const { data, error } = await supabaseAdmin
    .from('store_config')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching store config:', error)
    return null
  }

  return data
}

/**
 * Check if pincode is blocked for COD
 */
export async function isPincodeBlocked(pincode: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('blocked_pincodes')
    .select('id')
    .eq('pincode', pincode)
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking blocked pincode:', error)
    return false
  }

  return !!data
}

/**
 * Calculate order totals with custom charges
 */
export async function calculateOrderTotal(
  subtotal: number,
  shippingState: string,
  referralCode?: string,
  applyCustomCharges: boolean = true
): Promise<OrderCalculation> {
  const config = await getStoreConfig()
  
  if (!config) {
    throw new Error('Store configuration not found')
  }

  // Calculate discount from referral
  let discount = 0
  if (referralCode && config.is_referral_enabled) {
    const referralResult = await validateReferralCode(referralCode, subtotal)
    if (referralResult.valid) {
      discount = referralResult.discount_amount || 0
    }
  }

  // Calculate shipping
  const shipping_cost = config.free_shipping_enabled ? 0 : config.default_shipping_cost

  // Get custom charges if enabled
  let custom_charges: CustomCharge[] = []
  let custom_charges_total = 0
  
  if (applyCustomCharges && config.extra_charges_enabled && config.custom_charges) {
    custom_charges = config.custom_charges
    custom_charges_total = custom_charges.reduce((sum, charge) => sum + charge.amount, 0)
  }

  // Calculate amount before tax
  const amount_before_tax = subtotal - discount + shipping_cost + custom_charges_total

  // Calculate GST
  const { taxAmount, taxBreakdown } = calculateGST(
    amount_before_tax,
    shippingState,
    config.business_state
  )

  // Calculate total
  const total = amount_before_tax + taxAmount

  return {
    subtotal,
    discount,
    shipping_cost,
    custom_charges,
    custom_charges_total,
    tax_amount: taxAmount,
    tax_breakdown: taxBreakdown,
    total,
  }
}

/**
 * Validate referral code
 */
export async function validateReferralCode(
  code: string,
  orderAmount: number
): Promise<{
  valid: boolean
  discount_amount?: number
  owner_email?: string
  error?: string
}> {
  const config = await getStoreConfig()
  
  if (!config || !config.is_referral_enabled) {
    return { valid: false, error: 'Referral system is disabled' }
  }

  if (orderAmount < config.min_order_for_referral) {
    return { 
      valid: false, 
      error: `Minimum order amount ₹${config.min_order_for_referral} required for referral` 
    }
  }

  const { data: referralCode, error } = await supabaseAdmin
    .from('referral_codes')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single()

  if (error || !referralCode) {
    return { valid: false, error: 'Invalid referral code' }
  }

  if (referralCode.uses_count >= referralCode.max_uses) {
    return { valid: false, error: 'Referral code limit reached' }
  }

  if (referralCode.expires_at && new Date(referralCode.expires_at) < new Date()) {
    return { valid: false, error: 'Referral code expired' }
  }

  // Calculate discount
  let discount_amount = 0
  if (config.referral_discount_type === 'percentage') {
    discount_amount = (orderAmount * config.referral_discount_value) / 100
  } else {
    discount_amount = config.referral_discount_value
  }

  return {
    valid: true,
    discount_amount,
    owner_email: referralCode.owner_email,
  }
}

/**
 * Mark abandoned orders (call this via cron/scheduled function)
 */
export async function markAbandonedOrders(): Promise<number> {
  const config = await getStoreConfig()
  
  if (!config) {
    return 0
  }

  const timeoutMinutes = config.abandoned_order_timeout_minutes || 15

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'abandoned',
      abandoned_at: new Date().toISOString(),
    })
    .eq('payment_status', 'pending')
    .eq('payment_type', 'prepaid')
    .lt('created_at', new Date(Date.now() - timeoutMinutes * 60 * 1000).toISOString())
    .is('abandoned_at', null)
    .select('id')

  if (error) {
    console.error('Error marking abandoned orders:', error)
    return 0
  }

  return data?.length || 0
}

/**
 * Get or create customer wallet
 */
export async function getOrCreateWallet(
  customerEmail: string,
  customerName?: string
): Promise<string | null> {
  // Check if wallet exists
  const { data: existingWallet, error: fetchError } = await supabaseAdmin
    .from('customer_wallets')
    .select('id, referral_code')
    .eq('customer_email', customerEmail)
    .single()

  if (existingWallet) {
    return existingWallet.id
  }

  // Generate referral code
  const { data: codeData } = await supabaseAdmin.rpc('generate_referral_code')
  const referralCode = codeData || `INTRU${Date.now().toString(36).toUpperCase()}`

  // Create wallet
  const { data: newWallet, error: createError } = await supabaseAdmin
    .from('customer_wallets')
    .insert({
      customer_email: customerEmail,
      customer_name: customerName,
      referral_code: referralCode,
    })
    .select('id')
    .single()

  if (createError) {
    console.error('Error creating wallet:', createError)
    return null
  }

  // Create referral code entry
  await supabaseAdmin
    .from('referral_codes')
    .insert({
      code: referralCode,
      owner_email: customerEmail,
      owner_name: customerName,
    })

  return newWallet.id
}

/**
 * Add wallet credit
 */
export async function addWalletCredit(
  customerEmail: string,
  amount: number,
  description: string,
  orderId?: string,
  referralCode?: string
): Promise<boolean> {
  const walletId = await getOrCreateWallet(customerEmail)
  
  if (!walletId) {
    return false
  }

  // Add transaction
  const { error: txError } = await supabaseAdmin
    .from('wallet_transactions')
    .insert({
      wallet_id: walletId,
      transaction_type: 'credit',
      amount,
      description,
      order_id: orderId,
      referral_code: referralCode,
    })

  if (txError) {
    console.error('Error adding wallet credit:', txError)
    return false
  }

  // Update wallet balance
  const { error: updateError } = await supabaseAdmin.rpc('sql', {
    query: `
      UPDATE customer_wallets 
      SET 
        balance = balance + ${amount},
        total_earned = total_earned + ${amount}
      WHERE id = '${walletId}'
    `
  })

  return !updateError
}

/**
 * Process referral reward
 */
export async function processReferralReward(
  orderId: string,
  referralCode: string,
  orderAmount: number
): Promise<void> {
  const config = await getStoreConfig()
  
  if (!config || !config.is_referral_enabled) {
    return
  }

  // Get referral code owner
  const { data: referral } = await supabaseAdmin
    .from('referral_codes')
    .select('owner_email, owner_name')
    .eq('code', referralCode)
    .single()

  if (!referral) {
    return
  }

  // Add credit to referrer's wallet
  await addWalletCredit(
    referral.owner_email,
    config.referral_credit_amount,
    `Referral reward from order ${orderId}`,
    orderId,
    referralCode
  )

  // Update successful referrals count
  await supabaseAdmin
    .from('customer_wallets')
    .update({
      successful_referrals: supabaseAdmin.raw('successful_referrals + 1'),
    })
    .eq('customer_email', referral.owner_email)
}
