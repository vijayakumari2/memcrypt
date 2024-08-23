import { NextRequest, NextResponse } from 'next/server';
import { getKeycloakService } from '@/services/keycloakServiceSingleton';
import { UserWithOrg } from '@/types/keycloak';
import { KeycloakError } from "@/utils/errorHandler";
import {PaginatedResult} from "@/types/pagination";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '1000', 10);

        const result = await getKeycloakService().getUsersWithOrgInfo({ page, pageSize });
        return NextResponse.json<PaginatedResult<UserWithOrg>>(result, { status: 200 });
    } catch (error) {
        if (error instanceof KeycloakError) {
            console.error('Keycloak error:', error.message);
            return NextResponse.json<{ error: string }>({ error: error.message }, { status: 400 });
        }
        console.error('Unexpected error:', error);
        return NextResponse.json<{ error: string }>({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}

export async function PUT() {
    return NextResponse.json<{ message: string }>({ message: 'PUT method not implemented' }, { status: 501 });
}

export async function DELETE() {
    return NextResponse.json<{ message: string }>({ message: 'DELETE method not implemented' }, { status: 501 });
}