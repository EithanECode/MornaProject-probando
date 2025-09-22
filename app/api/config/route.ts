import { NextRequest, NextResponse } from 'next/server';

// Configuración por defecto
const defaultConfig = {
  airShippingRate: 8.50,
  seaShippingRate: 180.00,
  airDeliveryDays: { min: 15, max: 20 },
  seaDeliveryDays: { min: 35, max: 45 },
  usdRate: 166.58,
  profitMargin: 25,
  usdDiscountPercent: 5,
  maxQuotationsPerMonth: 5,
  maxModificationsPerOrder: 2,
  quotationValidityDays: 7,
  paymentDeadlineDays: 3,
  emailNotifications: true,
  whatsappNotifications: true,
  alertsAfterDays: 2,
  sessionTimeout: 60,
  requireTwoFactor: false,
  autoUpdateExchangeRate: false,
  lastUpdated: '2025-09-22T01:30:00.000Z'
};

// Configuración en memoria que se puede actualizar
let currentConfig = { ...defaultConfig };

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      config: currentConfig,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching business config:', error);
    
    return NextResponse.json({
      success: true,
      config: currentConfig,
      timestamp: new Date().toISOString(),
      warning: 'Using default config due to error'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();
    
    // Actualizar configuración en memoria
    currentConfig = {
      ...currentConfig,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      config: currentConfig,
      message: 'Configuration updated successfully (in memory)'
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