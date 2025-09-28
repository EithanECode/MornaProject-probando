import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';



export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceRoleClient();
    // Configuración global: solo traer el primer registro
    const { data, error } = await supabase
      .from('business_config')
      .select('*')
      .limit(1)
      .single();
    if (error) throw error;
    return NextResponse.json({
      success: true,
      config: data,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching business config:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch configuration'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();
    const supabase = getSupabaseServiceRoleClient();
    // Buscar si ya existe un registro global
    const { data: existing, error: fetchError } = await supabase
      .from('business_config')
      .select('id')
      .limit(1)
      .single();
    let upsertResult;
    if (existing && existing.id) {
      // Actualizar registro existente
      upsertResult = await supabase
        .from('business_config')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Insertar nuevo registro
      upsertResult = await supabase
        .from('business_config')
        .insert([{ ...updates, updated_at: new Date().toISOString() }])
        .select()
        .single();
    }
    if (upsertResult.error) throw upsertResult.error;
    return NextResponse.json({
      success: true,
      config: upsertResult.data,
      message: 'Configuration updated successfully in Supabase'
    });
  } catch (error: any) {
    console.error('Error updating business config:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update configuration' 
      }, 
      { status: 500 }
    );
  }
}