import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRateHistory } from '@/lib/supabase/exchange-rates';

// GET: Obtener historial de tasas de cambio
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const onlyValid = searchParams.get('only_valid') === 'true';

    const history = await getExchangeRateHistory(limit, onlyValid);

    return NextResponse.json({
      success: true,
      data: history,
      count: history.length,
      filters: {
        limit,
        only_valid: onlyValid
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching exchange rate history:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error al obtener historial de tasas',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
