import { NextRequest, NextResponse } from 'next/server';
import { 
  saveBinanceRate, 
  getLatestValidBinanceRate, 
  getLatestBinanceRate,
  isValidBinanceRate,
  cleanupOldBinanceRates 
} from '@/lib/supabase/exchange-rates-binance';

interface ApiConfig {
  name: string;
  url: string;
  method?: 'GET' | 'POST';
  body?: any;
  parser: (data: any) => number | null;
}

// Función para obtener la tasa de Binance P2P desde múltiples fuentes
async function fetchBinanceRate(): Promise<number> {
  // Lista de APIs en orden de prioridad
  const apis: ApiConfig[] = [
    {
      name: 'Binance-P2P-Direct',
      url: 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
      method: 'POST' as const,
      body: {
        asset: 'USDT',
        fiat: 'VES',
        merchantCheck: false,
        page: 1,
        payTypes: [],
        publisherType: null,
        rows: 10,
        tradeType: 'SELL'
      },
      parser: (data: any) => {
        console.log('[Binance Rate] Binance Direct raw data:', JSON.stringify(data, null, 2));
        // Formato: { code: "000000", data: [{ adv: { price: "299.50" } }] }
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          // Obtener la tasa más alta (primer elemento cuando está ordenado por precio)
          const firstOffer = data.data[0];
          if (firstOffer.adv && firstOffer.adv.price) {
            return parseFloat(firstOffer.adv.price);
          }
        }
        return null;
      }
    },
    {
      name: 'PyDolarVenezuela-Binance',
      url: 'https://pydolarvenezuela-api.vercel.app/api/v1/dollar/page?page=bcv',
      method: 'GET' as const,
      parser: (data: any) => {
        console.log('[Binance Rate] PyDolar raw data:', JSON.stringify(data, null, 2));
        // Intentar encontrar Binance en los monitores
        if (data.monitors && Array.isArray(data.monitors)) {
          const binanceMonitor = data.monitors.find((m: any) => 
            m.title && (m.title.toLowerCase().includes('binance') || m.key === 'binance')
          );
          if (binanceMonitor && binanceMonitor.price) {
            return parseFloat(binanceMonitor.price);
          }
        }
        return null;
      }
    },
    {
      name: 'DollarVzla-Binance',
      url: 'https://api.dollarvzla.com/v1/exchange-rates',
      method: 'GET' as const,
      parser: (data: any) => {
        console.log('[Binance Rate] DollarVzla raw data:', JSON.stringify(data, null, 2));
        if (data.exchangeRates && Array.isArray(data.exchangeRates)) {
          const binanceRate = data.exchangeRates.find((rate: any) => 
            rate.sourceCode && rate.sourceCode.toLowerCase().includes('binance')
          );
          if (binanceRate && binanceRate.value) {
            return parseFloat(binanceRate.value);
          }
        }
        return null;
      }
    }
  ];

  let lastError: any = null;

  // Intentar cada API en orden
  for (const api of apis) {
    try {
      console.log(`[Binance Rate] Trying ${api.name}...`);
      
      const fetchOptions: RequestInit = {
        method: api.method || 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'MornaProject/1.0'
        },
        signal: AbortSignal.timeout(10000)
      };

      // Agregar body si es POST
      if (api.method === 'POST' && api.body) {
        fetchOptions.body = JSON.stringify(api.body);
      }

      const response = await fetch(api.url, fetchOptions);

      if (!response.ok) {
        console.error(`[Binance Rate] ${api.name} HTTP error: ${response.status}`);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rate = api.parser(data);
      
      if (!rate) {
        console.error(`[Binance Rate] ${api.name} - No se pudo extraer tasa de la respuesta`);
        throw new Error(`Binance rate not found in ${api.name} response`);
      }

      const parsedRate = parseFloat(rate.toString());
      
      if (!isValidBinanceRate(parsedRate)) {
        console.error(`[Binance Rate] ${api.name} - Tasa inválida: ${parsedRate}`);
        throw new Error(`Invalid Binance rate value from ${api.name}: ${parsedRate}`);
      }

      console.log(`✅ [Binance Rate] Success with ${api.name}: ${parsedRate} VES/USDT`);
      return parsedRate;

    } catch (error: any) {
      console.error(`❌ [Binance Rate] ${api.name} failed:`, error.message);
      lastError = error;
      continue; // Intentar siguiente API
    }
  }

  // Si todas las APIs fallaron, lanzar error con detalles
  console.error('❌ [Binance Rate] ALL APIs failed. Last error:', lastError);
  throw new Error(`All Binance APIs failed. Last error: ${lastError?.message}`);
}

// GET: Obtener tasa de cambio de Binance P2P
export async function GET(request: NextRequest) {
  try {
    // 1. Intentar obtener de APIs externas primero
    let apiRate: number | null = null;
    let apiSource = 'Binance P2P';
    let apiError: any = null;

    try {
      apiRate = await fetchBinanceRate();
      console.log(`✅ [Binance Rate API] Success: ${apiRate} VES/USDT`);
    } catch (error) {
      apiError = error;
      console.error('❌ [Binance Rate API] All external APIs failed:', error);
    }

    // 2. Si obtuvimos tasa de API, guardarla y retornarla
    if (apiRate && isValidBinanceRate(apiRate)) {
      // Guardar tasa exitosa en BD
      await saveBinanceRate(apiRate, apiSource, false, {
        success: true,
        apis_used: ['monitorvenezuela', 'airtm']
      });

      // Limpiar registros antiguos ocasionalmente (1 de cada 50 requests)
      if (Math.random() < 0.02) {
        cleanupOldBinanceRates().catch(console.error);
      }

      return NextResponse.json({
        success: true,
        rate: apiRate,
        timestamp: new Date().toISOString(),
        source: apiSource,
        from_database: false,
        currency_pair: 'USDT/VES'
      });
    }

    // 3. APIs fallaron, intentar usar última tasa válida de BD
    console.log('[Binance Rate API] APIs failed, checking database for last valid rate...');
    const lastValidRate = await getLatestValidBinanceRate();

    if (lastValidRate) {
      console.log(`[Binance Rate API] Using last valid rate from DB: ${lastValidRate.rate} VES/USDT (${lastValidRate.age_minutes} min ago)`);
      
      // Guardar registro de que usamos fallback
      await saveBinanceRate(lastValidRate.rate, lastValidRate.source, true, {
        fallback_reason: 'APIs failed',
        original_error: apiError?.message,
        age_minutes: lastValidRate.age_minutes
      });

      return NextResponse.json({
        success: true,
        rate: lastValidRate.rate,
        timestamp: lastValidRate.timestamp,
        source: lastValidRate.source,
        from_database: true,
        age_minutes: lastValidRate.age_minutes,
        currency_pair: 'USDT/VES',
        warning: `Usando última tasa conocida de ${lastValidRate.source} (${lastValidRate.age_minutes} minutos de antigüedad) debido a errores en las APIs`
      });
    }

    // 4. No hay tasa válida en BD, usar cualquier tasa (incluso fallback anterior)
    console.log('[Binance Rate API] No valid rates in DB, checking for any rate...');
    const anyLastRate = await getLatestBinanceRate();

    if (anyLastRate) {
      console.log(`[Binance Rate API] Using any last rate from DB: ${anyLastRate.rate} VES/USDT`);
      
      return NextResponse.json({
        success: true,
        rate: anyLastRate.rate,
        timestamp: anyLastRate.timestamp || new Date().toISOString(),
        source: anyLastRate.source || 'Base de Datos',
        from_database: true,
        currency_pair: 'USDT/VES',
        warning: 'Usando tasa de respaldo de la base de datos debido a errores en todas las APIs'
      });
    }

    // 5. Último recurso: tasa por defecto
    console.error('[Binance Rate API] No rates available anywhere, using hardcoded default');
    const defaultRate = 299.51; // Tasa aproximada USDT → VES según Monitor Venezuela
    
    await saveBinanceRate(defaultRate, 'Hardcoded Default', true, {
      fallback_reason: 'No rates available in APIs or database',
      api_error: apiError?.message
    });

    return NextResponse.json({
      success: true,
      rate: defaultRate,
      timestamp: new Date().toISOString(),
      source: 'Tasa por Defecto',
      from_database: false,
      currency_pair: 'USDT/VES',
      warning: 'Usando tasa por defecto debido a errores en todas las APIs y ausencia de datos históricos'
    });

  } catch (error: any) {
    console.error('Critical error in Binance rate endpoint:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error crítico al obtener tasa de Binance',
      details: error.message,
      timestamp: new Date().toISOString(),
      currency_pair: 'USDT/VES'
    }, { status: 500 });
  }
}

// POST: Actualizar tasa de Binance (para uso interno/manual)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { manualRate, forceRefresh } = body;

    // Si hay tasa manual, guardarla y usarla
    if (manualRate && isValidBinanceRate(parseFloat(manualRate))) {
      const rate = parseFloat(manualRate);
      
      // Guardar tasa manual en BD
      await saveBinanceRate(rate, 'Manual', false, {
        manual_update: true,
        updated_by: 'admin_user'
      });

      return NextResponse.json({
        success: true,
        rate: rate,
        timestamp: new Date().toISOString(),
        source: 'Manual',
        from_database: true,
        currency_pair: 'USDT/VES'
      });
    }

    // Si no hay tasa manual, obtener de API y guardar
    try {
      const apiRate = await fetchBinanceRate();
      
      // Guardar tasa de API en BD
      await saveBinanceRate(apiRate, 'Monitor Venezuela (Manual Refresh)', false, {
        manual_refresh: true,
        force_refresh: forceRefresh || false
      });

      return NextResponse.json({
        success: true,
        rate: apiRate,
        timestamp: new Date().toISOString(),
        source: 'Monitor Venezuela (Manual Refresh)',
        from_database: false,
        currency_pair: 'USDT/VES'
      });
    } catch (apiError: any) {
      // Si falla API, usar última tasa válida de BD
      const lastValidRate = await getLatestValidBinanceRate();
      
      if (lastValidRate) {
        return NextResponse.json({
          success: true,
          rate: lastValidRate.rate,
          timestamp: lastValidRate.timestamp,
          source: lastValidRate.source,
          from_database: true,
          age_minutes: lastValidRate.age_minutes,
          currency_pair: 'USDT/VES',
          warning: `API falló durante actualización manual. Usando última tasa válida de ${lastValidRate.source}`
        });
      }

      throw new Error(`Failed to fetch from API and no valid rates in database: ${apiError.message}`);
    }

  } catch (error: any) {
    console.error('Error in POST Binance rate:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update Binance rate',
      timestamp: new Date().toISOString(),
      currency_pair: 'USDT/VES'
    }, { status: 500 });
  }
}
