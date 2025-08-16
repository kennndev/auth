import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Fetch custom orders from the database
    const { data: orders, error } = await supabase
      .from('custom_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch custom orders', details: error.message },
        { status: 500 }
      )
    }

    // Process orders to ensure we have image URLs
    const ordersWithImages = (orders || []).map(order => {
      // If we have custom_image_url, use it directly
      if (order.custom_image_url) {
        return {
          ...order,
          imageUrl: order.custom_image_url
        }
      }
      
      // Otherwise, try to construct URL from upload_id if it exists
      if (order.upload_id) {
        const { data: urlData } = supabase.storage
          .from('custom-uploads')
          .getPublicUrl(order.upload_id)
        
        return {
          ...order,
          imageUrl: urlData.publicUrl
        }
      }
      
      return order
    })

    return NextResponse.json({ 
      success: true, 
      orders: ordersWithImages
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}