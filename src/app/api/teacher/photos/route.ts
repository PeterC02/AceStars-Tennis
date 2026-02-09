import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const BUCKET = 'timetable-photos'

// POST - Upload a timetable photo for a boy
export async function POST(request: NextRequest) {
  try {
    const { boyId, boyName, divMasterId, term, photoData } = await request.json()

    if (!boyId || !photoData || !divMasterId) {
      return NextResponse.json({ error: 'boyId, divMasterId, and photoData are required' }, { status: 400 })
    }

    // Decode base64 data URL
    const matches = photoData.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!matches) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
    }

    const ext = matches[1]
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, 'base64')
    const filePath = `${divMasterId}/${term || 'default'}/${boyId}.${ext}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: `image/${ext}`,
        upsert: true,
      })

    if (uploadError) {
      // If bucket doesn't exist, store reference in DB only
      console.error('[PHOTO UPLOAD] Storage error:', uploadError.message)

      // Fallback: store in a DB table
      const { error: dbError } = await supabase
        .from('timetable_photos')
        .upsert({
          boy_id: boyId,
          boy_name: boyName || '',
          div_master_id: divMasterId,
          term: term || 'Summer 2026',
          file_path: filePath,
          uploaded_at: new Date().toISOString(),
        }, { onConflict: 'boy_id,term' })

      if (dbError) {
        console.error('[PHOTO UPLOAD] DB fallback error:', dbError.message)
      }

      return NextResponse.json({
        success: true,
        filePath,
        message: 'Photo reference saved (storage bucket may need setup)',
      })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath)

    // Store reference in DB
    try {
      await supabase
        .from('timetable_photos')
        .upsert({
          boy_id: boyId,
          boy_name: boyName || '',
          div_master_id: divMasterId,
          term: term || 'Summer 2026',
          file_path: filePath,
          public_url: urlData?.publicUrl || null,
          uploaded_at: new Date().toISOString(),
        }, { onConflict: 'boy_id,term' })
    } catch {}

    return NextResponse.json({
      success: true,
      filePath,
      publicUrl: urlData?.publicUrl,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - List uploaded photos for a div master
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const divMasterId = searchParams.get('divMasterId')
    const term = searchParams.get('term') || 'Summer 2026'

    if (!divMasterId) {
      return NextResponse.json({ error: 'divMasterId is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('timetable_photos')
      .select('*')
      .eq('div_master_id', divMasterId)
      .eq('term', term)

    if (error) {
      // Table might not exist yet
      return NextResponse.json({ photos: [] })
    }

    return NextResponse.json({ photos: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
