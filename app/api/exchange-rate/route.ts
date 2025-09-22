import { NextRequest, NextResponse } from 'next/server';

// Función para obtener la tasa de cambio oficial del BCV
async function fetchExchangeRate(): Promise<number> {
  try {
    // Intentar obtener la tasa oficial del BCV desde DollarVzla API
    const response = await fetch('https://api.dollarvzla.com/v1/exchange-rates', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MornaProject/1.0'
      },
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validar estructura de respuesta
    if (!data || !data.exchangeRates || !Array.isArray(data.exchangeRates)) {
      throw new Error('Invalid API response structure');
    }

    // Buscar específicamente la tasa del BCV
    const bcvRate = data.exchangeRates.find((rate: any) => 
      rate.sourceCode && rate.sourceCode.toLowerCase() === 'bcv'
    );

    if (!bcvRate || !bcvRate.value) {
      throw new Error('BCV rate not found in API response');
    }

    const rate = parseFloat(bcvRate.value);
    
    // Validar que la tasa sea razonable (BCV suele estar entre 30-200 Bs)
    if (isNaN(rate) || rate < 10 || rate > 500) {
      throw new Error(`Invalid BCV exchange rate value: ${rate}`);
    }

    return rate;

  } catch (error) {
    console.error('Error fetching BCV exchange rate:', error);
    
    // Fallback: Intentar con pyDolarVenezuela para obtener BCV
    try {
      const fallbackResponse = await fetch('https://pydolarvenezuela-api.vercel.app/api/v1/dollar/page?page=bcv', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MornaProject/1.0'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData && fallbackData.monitors && Array.isArray(fallbackData.monitors)) {
          const bcvMonitor = fallbackData.monitors.find((monitor: any) => 
            monitor.title && monitor.title.toLowerCase().includes('bcv')
          );
          
          if (bcvMonitor && bcvMonitor.price) {
            const fallbackRate = parseFloat(bcvMonitor.price);
            if (!isNaN(fallbackRate) && fallbackRate > 10 && fallbackRate < 500) {
              return fallbackRate;
            }
          }
        }
      }
    } catch (fallbackError) {
      console.error('Fallback BCV API also failed:', fallbackError);
    }

    // Segundo fallback: Usar una API alternativa para BCV
    try {
      const altResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MornaProject/1.0'
        },
        signal: AbortSignal.timeout(6000)
      });

      if (altResponse.ok) {
        const altData = await altResponse.json();
        if (altData && altData.rates && altData.rates.VES) {
          const vesRate = parseFloat(altData.rates.VES);
          if (!isNaN(vesRate) && vesRate > 10 && vesRate < 500) {
            return vesRate;
          }
        }
      }
    } catch (altError) {
      console.error('Alternative API also failed:', altError);
    }

    throw error;
  }
}

// GET: Obtener tasa de cambio actual
export async function GET(request: NextRequest) {
  try {
    const rate = await fetchExchangeRate();
    
    return NextResponse.json({
      success: true,
      rate: rate,
      timestamp: new Date().toISOString(),
      source: 'BCV Oficial'
    });

  } catch (error: any) {
    console.error('Exchange rate API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch exchange rate',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST: Actualizar tasa de cambio (para uso interno)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { manualRate } = body;

    if (manualRate && !isNaN(parseFloat(manualRate))) {
      return NextResponse.json({
        success: true,
        rate: parseFloat(manualRate),
        timestamp: new Date().toISOString(),
        source: 'manual'
      });
    }

    // Si no hay tasa manual, obtener de API
    const rate = await fetchExchangeRate();
    
    return NextResponse.json({
      success: true,
      rate: rate,
      timestamp: new Date().toISOString(),
      source: 'BCV Oficial'
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update exchange rate',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
