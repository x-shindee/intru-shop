export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const pincode = searchParams.get('pincode')

    if (!pincode) {
      return NextResponse.json(
        { success: false, error: 'Pincode is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('blocked_pincodes')
      .select('id, reason')
      .eq('pincode', pincode)
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({
      success: true,
      blocked: !!data,
      reason: data?.reason || null,
    })
  } catch (error: any) {
    console.error('Check pincode error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
