import { NextRequest, NextResponse } from 'next/server';
import { getKeycloakService } from '@/services/keycloakServiceSingleton';


export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        await getKeycloakService().approveUser(params.userId);
        return NextResponse.json({ message: 'User approved successfully' });
    } catch (error) {
        console.error('Error approving user:', error);
        return NextResponse.json({ error: 'Failed to approve user' }, { status: 500 });
    }
}