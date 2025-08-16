import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get('path') || 'uploads'
    
    // List files in the custom-uploads bucket
    const { data, error } = await supabase.storage
      .from('custom-uploads')
      .list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error('Supabase storage error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch uploads', details: error.message },
        { status: 500 }
      )
    }

    // Process the data to include public URLs
    const filesWithUrls = (data || []).map(file => {
      const filePath = path === 'uploads' ? file.name : `${path}/${file.name}`
      const { data: urlData } = supabase.storage
        .from('custom-uploads')
        .getPublicUrl(filePath)
      
      return {
        ...file,
        publicUrl: urlData.publicUrl,
        fullPath: filePath
      }
    })

    return NextResponse.json({ 
      success: true, 
      files: filesWithUrls,
      path 
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