import { NextResponse } from 'next/server';
import { me } from '@/lib/auth';
export async function GET() { return NextResponse.json(me()); }
