import { NextResponse } from 'next/server'

// This endpoint was left empty and caused build to fail because it's not a module.
// Provide minimal handlers to keep the route valid until real implementation is added.

export async function GET() {
	return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}

export async function POST(request: Request) {
	return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}

export async function PATCH(request: Request) {
	return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}

