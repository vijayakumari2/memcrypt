import { NextRequest, NextResponse } from 'next/server';
import { getKeycloakService } from '@/services/keycloakServiceSingleton';
import { CreateOrgWithAdminInput, CreateOrgWithAdminResult } from '@/types/keycloak';
import { KeycloakError } from "@/utils/errorHandler";

export async function POST(request: NextRequest) {
    try {
        const body: CreateOrgWithAdminInput = await request.json();
        const result = await getKeycloakService().createOrganizationAndUser(body);
        return NextResponse.json<CreateOrgWithAdminResult>(result, { status: 201 });
    } catch (error) {
        if (error instanceof KeycloakError) {
            console.error('Keycloak error:', error.message);
            return NextResponse.json<{ error: string }>({ error: error.message }, { status: 400 });
        }
        if(error instanceof SyntaxError) {
            console.error('Syntax error:', error);
            return NextResponse.json<{ error: string }>({ error: 'Invalid JSON' }, { status: 400 });
        }
        console.error('Unexpected error:', error);
        return NextResponse.json<{ error: string }>({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}