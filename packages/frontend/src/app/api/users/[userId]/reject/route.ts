import { NextRequest, NextResponse } from 'next/server';
import { getKeycloakService } from '@/services/keycloakServiceSingleton';


export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        await getKeycloakService().rejectUser(params.userId);
        return NextResponse.json({ message: 'User rejected successfully' });
    } catch (error) {
        console.error('Error rejecting user:', error);
        return NextResponse.json({ error: 'Failed to reject user' }, { status: 500 });
    }
}