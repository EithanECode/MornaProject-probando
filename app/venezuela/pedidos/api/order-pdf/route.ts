// Esta ruta ya no es necesaria. El PDF se genera en el frontend con jsPDF y jspdf-autotable.
// Puedes eliminar este archivo si no lo necesitas para otros propósitos.

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'This endpoint is deprecated. PDF generation is now handled on the frontend.' 
  }, { status: 410 });
}