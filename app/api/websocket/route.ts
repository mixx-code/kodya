import { NextRequest, NextResponse } from 'next/server';
import { websocketService } from '@/lib/websocket';

export async function POST(request: NextRequest) {
  try {
    const { product, action } = await request.json();

    if (!product || !action) {
      return NextResponse.json(
        { error: 'Missing product data or action' },
        { status: 400 }
      );
    }

    console.log(`📢 WebSocket API: ${action} for product`, product);

    switch (action) {
      case 'created':
        websocketService.notifyNewProduct(product);
        break;
      case 'updated':
        websocketService.notifyProductUpdated(product);
        break;
      case 'deleted':
        websocketService.notifyProductDeleted(product.id);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ WebSocket API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
