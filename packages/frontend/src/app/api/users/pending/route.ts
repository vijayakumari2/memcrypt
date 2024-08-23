import { NextRequest, NextResponse } from 'next/server';
import { getKeycloakService } from '@/services/keycloakServiceSingleton';
import { KeycloakError } from "@/utils/errorHandler";

export async function GET(request: NextRequest) {
    try {
        const keycloakService = getKeycloakService();
        const pendingUsers = await keycloakService.getPendingUsers();
        return NextResponse.json(pendingUsers, { status: 200 });
    } catch (error) {
        console.error('Error fetching pending users:', error);
        if (error instanceof KeycloakError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}