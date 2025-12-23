export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { supabaseAdmin } from '@/lib/supabase'

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external'

async function getShiprocketToken(): Promise<string> {
  const response = await axios.post(`${SHIPROCKET_API_URL}/auth/login`, {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD,
  })
  return response.data.token
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { order_id, courier_company_id } = body

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    const token = await getShiprocketToken()

    // Create Shiprocket order
    const shiprocketOrder = {
      order_id: order.order_number,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: 'Primary',
      channel_id: '',
      comment: order.notes || '',
      billing_customer_name: order.customer_name,
      billing_last_name: '',
      billing_address: order.billing_address.line1,
      billing_address_2: order.billing_address.line2 || '',
      billing_city: order.billing_address.city,
      billing_pincode: order.billing_address.pincode,
      billing_state: order.billing_address.state,
      billing_country: order.billing_address.country,
      billing_email: order.customer_email,
      billing_phone: order.customer_phone,
      shipping_is_billing: true,
      shipping_customer_name: order.shipping_address.name,
      shipping_last_name: '',
      shipping_address: order.shipping_address.line1,
      shipping_address_2: order.shipping_address.line2 || '',
      shipping_city: order.shipping_address.city,
      shipping_pincode: order.shipping_address.pincode,
      shipping_country: order.shipping_address.country,
      shipping_state: order.shipping_address.state,
      shipping_email: order.customer_email,
      shipping_phone: order.customer_phone,
      order_items: order.items.map((item: any) => ({
        name: item.title,
        sku: item.product_id,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: order.tax_amount / order.items.length,
        hsn: '',
      })),
      payment_method: order.payment_type === 'prepaid' ? 'Prepaid' : 'COD',
      shipping_charges: order.shipping_cost,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: order.subtotal,
      length: 10,
      breadth: 10,
      height: 5,
      weight: 0.5,
    }

    const createResponse = await axios.post(
      `${SHIPROCKET_API_URL}/orders/create/adhoc`,
      shiprocketOrder,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const shiprocket_order_id = createResponse.data.order_id
    const shiprocket_shipment_id = createResponse.data.shipment_id

    // Generate AWB (Airway Bill)
    if (courier_company_id) {
      await axios.post(
        `${SHIPROCKET_API_URL}/courier/assign/awb`,
        {
          shipment_id: shiprocket_shipment_id,
          courier_id: courier_company_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    }

    // Update order with shipping details
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        shiprocket_order_id,
        shiprocket_shipment_id,
        shipping_status: 'processing',
      })
      .eq('id', order_id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      shiprocket_order_id,
      shiprocket_shipment_id,
    })
  } catch (error: any) {
    console.error('Create shipment error:', error.response?.data || error)
    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.message || error.message,
      },
      { status: 500 }
    )
  }
}
