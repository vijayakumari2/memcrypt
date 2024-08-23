import { getKeycloakService } from '@/services/keycloakServiceSingleton';
import {NextRequest, NextResponse} from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();
        await getKeycloakService().verifyEmail(token);
        return NextResponse.json({ message: 'User activated successfully' });
    } catch (error) {
        console.error('Error approving user:', error);
        return NextResponse.json({ error: 'Failed to approve user' }, { status: 500 });
    }
}