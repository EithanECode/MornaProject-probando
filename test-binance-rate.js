// Script temporal para probar la función de Binance P2P
async function testBinanceRate() {
  const url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";
  
  const payload = {
    asset: "USDT",
    fiat: "VES",
    merchantCheck: false,
    page: 1,
    payTypes: [],
    publisherType: null,
    rows: 10,
    tradeType: "BUY"
  };
  
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  };
  
  try {
    console.log('🔄 Consultando Binance P2P...\n');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      const anuncios = data.data.slice(0, 5); // Top 5 ofertas
      
      console.log('✓ Tasas P2P Binance USDT/VES (Compra):\n');
      
      anuncios.forEach((anuncio, i) => {
        const precio = parseFloat(anuncio.adv.price);
        const comerciante = anuncio.advertiser.nickName;
        console.log(`  ${i + 1}. Bs. ${precio.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - ${comerciante}`);
      });
      
      // Calcular promedio
      const precios = anuncios
        .map(anuncio => parseFloat(anuncio.adv.price))
        .filter(precio => !isNaN(precio));
      
      if (precios.length > 0) {
        const promedio = precios.reduce((sum, precio) => sum + precio, 0) / precios.length;
        console.log(`\n📊 Promedio (top ${precios.length}): Bs. ${promedio.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        console.log(`\n✅ Función funcionando correctamente!`);
        return promedio;
      } else {
        console.log('\n✗ No se pudieron extraer precios válidos');
        return null;
      }
    } else {
      console.log('✗ No se encontraron anuncios');
      return null;
    }
    
  } catch (error) {
    console.error(`✗ Error al consultar Binance P2P: ${error.message}`);
    return null;
  }
}

// Ejecutar prueba
testBinanceRate().then(result => {
  if (result) {
    console.log(`\n🎯 Tasa promedio obtenida: ${result.toFixed(2)} VES/USDT`);
    process.exit(0);
  } else {
    console.log('\n❌ No se pudo obtener la tasa');
    process.exit(1);
  }
}).catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});

