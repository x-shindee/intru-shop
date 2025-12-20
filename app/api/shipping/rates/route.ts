import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external'

// Get Shiprocket auth token
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
    const {
      pickup_pincode,
      delivery_pincode,
      weight = 0.5, // Default 500g
      cod = 0,
    } = body

    const token = await getShiprocketToken()

    const response = await axios.get(
      `${SHIPROCKET_API_URL}/courier/serviceability`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          pickup_postcode: pickup_pincode,
          delivery_postcode: delivery_pincode,
          weight,
          cod,
        },
      }
    )

    const couriers = response.data.data.available_courier_companies

    // Format the response
    const rates = couriers.map((courier: any) => ({
      courier_name: courier.courier_name,
      courier_company_id: courier.courier_company_id,
      rate: courier.rate,
      estimated_delivery_days: courier.estimated_delivery_days,
      cod_charges: courier.cod_charges,
    }))

    return NextResponse.json({
      success: true,
      rates,
    })
  } catch (error: any) {
    console.error('Shiprocket rates error:', error.response?.data || error)
    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.message || error.message,
      },
      { status: 500 }
    )
  }
}
