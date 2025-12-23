export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { validateReferralCode } from '@/lib/store-config'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, orderAmount } = body

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Referral code is required' },
        { status: 400 }
      )
    }

    const result = await validateReferralCode(code, orderAmount)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Validate referral error:', error)
    return NextResponse.json(
      { valid: false, error: error.message },
      { status: 500 }
    )
  }
}
