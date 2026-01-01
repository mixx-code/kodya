export interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  user_avatar: string | null;
  product_id: number;
}

export interface ProductData {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  price: string | null;
  demo_url: string | null;
  link_program: string | null;
  images: string[] | null;
  tech_stack: string[] | null;
  features: string[] | null;
  rating: number | null;
  reviews: number | null;
  sales: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SocketEvents {
  'join-product': (productId: number) => void;
  'leave-product': (productId: number) => void;
  'new-review': (data: { productId: number; review: ReviewData }) => void;
  'review-added': (data: { productId: number; review: ReviewData; timestamp: string }) => void;
  'join-products': () => void;
  'leave-products': () => void;
  'new-product': (data: { product: ProductData }) => void;
  'product-added': (data: { product: ProductData; timestamp: string }) => void;
  'product-updated': (data: { product: ProductData; timestamp: string }) => void;
  'product-deleted': (data: { productId: number; timestamp: string }) => void;
}

export class WebSocketService {
  private socket: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.connect();
  }

  private connect() {
    if (typeof window === 'undefined') return;

    try {
      // Import socket.io-client dynamically
      import('socket.io-client').then(({ io }) => {
        console.log('Connecting to WebSocket server...');
        this.socket = io(process.env.NODE_ENV === 'production' 
          ? window.location.origin 
          : 'http://localhost:3000', {
          transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
          console.log('✅ Connected to WebSocket server with ID:', this.socket.id);
          this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', () => {
          console.log('❌ Disconnected from WebSocket server');
          this.handleReconnect();
        });

        this.socket.on('connect_error', (error: any) => {
          console.error('❌ WebSocket connection error:', error);
          this.handleReconnect();
        });

        // Debug all events
        this.socket.onAny((eventName: string, ...args: any[]) => {
          console.log('🔔 WebSocket Event:', eventName, args);
        });
      });
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  public joinProductRoom(productId: number) {
    if (this.socket && this.socket.connected) {
      console.log(`🏠 Joining product room: ${productId}`);
      this.socket.emit('join-product', productId);
    } else {
      console.log('❌ Cannot join room - WebSocket not connected');
    }
  }

  public leaveProductRoom(productId: number) {
    if (this.socket && this.socket.connected) {
      console.log(`🚪 Leaving product room: ${productId}`);
      this.socket.emit('leave-product', productId);
    }
  }

  public onReviewAdded(callback: (data: { productId: number; review: ReviewData; timestamp: string }) => void) {
    if (this.socket) {
      console.log('👂 Listening for review-added events');
      this.socket.on('review-added', callback);
    }
  }

  public offReviewAdded(callback?: (data: { productId: number; review: ReviewData; timestamp: string }) => void) {
    if (this.socket) {
      console.log('🔇 Stopped listening for review-added events');
      this.socket.off('review-added', callback);
    }
  }

  public notifyNewReview(productId: number, review: ReviewData) {
    if (this.socket && this.socket.connected) {
      console.log(`📢 Notifying new review for product ${productId}:`, review);
      this.socket.emit('new-review', { productId, review });
    } else {
      console.log('❌ Cannot notify - WebSocket not connected');
    }
  }

  // Product-related methods
  public joinProductsRoom() {
    if (this.socket && this.socket.connected) {
      console.log('🏠 Joining products room');
      this.socket.emit('join-products');
    } else {
      console.log('❌ Cannot join products room - WebSocket not connected');
    }
  }

  public leaveProductsRoom() {
    if (this.socket && this.socket.connected) {
      console.log('🚪 Leaving products room');
      this.socket.emit('leave-products');
    }
  }

  public onProductAdded(callback: (data: { product: ProductData; timestamp: string }) => void) {
    if (this.socket) {
      console.log('👂 Listening for product-added events');
      this.socket.on('product-added', callback);
    }
  }

  public offProductAdded(callback?: (data: { product: ProductData; timestamp: string }) => void) {
    if (this.socket) {
      console.log('🔇 Stopped listening for product-added events');
      this.socket.off('product-added', callback);
    }
  }

  public onProductUpdated(callback: (data: { product: ProductData; timestamp: string }) => void) {
    if (this.socket) {
      console.log('👂 Listening for product-updated events');
      this.socket.on('product-updated', callback);
    }
  }

  public offProductUpdated(callback?: (data: { product: ProductData; timestamp: string }) => void) {
    if (this.socket) {
      console.log('🔇 Stopped listening for product-updated events');
      this.socket.off('product-updated', callback);
    }
  }

  public onProductDeleted(callback: (data: { productId: number; timestamp: string }) => void) {
    if (this.socket) {
      console.log('👂 Listening for product-deleted events');
      this.socket.on('product-deleted', callback);
    }
  }

  public offProductDeleted(callback?: (data: { productId: number; timestamp: string }) => void) {
    if (this.socket) {
      console.log('🔇 Stopped listening for product-deleted events');
      this.socket.off('product-deleted', callback);
    }
  }

  public notifyNewProduct(product: ProductData) {
    if (this.socket && this.socket.connected) {
      console.log('📢 Notifying new product:', product);
      this.socket.emit('new-product', { product });
    } else {
      console.log('❌ Cannot notify - WebSocket not connected');
    }
  }

  public notifyProductUpdated(product: ProductData) {
    if (this.socket && this.socket.connected) {
      console.log('📢 Notifying product updated:', product);
      this.socket.emit('product-updated', { product });
    } else {
      console.log('❌ Cannot notify - WebSocket not connected');
    }
  }

  public notifyProductDeleted(productId: number) {
    if (this.socket && this.socket.connected) {
      console.log(`📢 Notifying product deleted: ${productId}`);
      this.socket.emit('product-deleted', { productId });
    } else {
      console.log('❌ Cannot notify - WebSocket not connected');
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
