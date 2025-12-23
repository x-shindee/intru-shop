export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { data: config, error } = await supabaseAdmin
      .from('store_config')
      .select('*')
      .limit(1)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      config,
    })
  } catch (error: any) {
    console.error('Get store config error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { data: config, error } = await supabaseAdmin
      .from('store_config')
      .update(body)
      .eq('id', body.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      config,
    })
  } catch (error: any) {
    console.error('Update store config error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
