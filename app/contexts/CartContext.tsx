"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase-client";

interface CartContextType {
  cartCount: number;
  addToCart: (productId: number) => Promise<void>;
  removeFromCart: (cartId: string) => Promise<void>;
  updateCartCount: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const updateCartCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setCartCount(0);
        return;
      }

      const { data: cartItems, error } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart:', error);
        setCartCount(0);
      } else {
        setCartCount(cartItems?.length || 0);
      }
    } catch (error) {
      console.error('Error:', error);
      setCartCount(0);
    }
  };

  const addToCart = async (productId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Optimistic update - increment count immediately
      setCartCount(prev => prev + 1);

      // Check if already in cart
      const { data: existingCart } = await supabase
        .from('cart')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingCart) {
        // Update quantity if already in cart
        const { error: updateError } = await supabase
          .from('cart')
          .update({
            quantity: existingCart.quantity + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCart.id);

        if (updateError) {
          // Revert optimistic update on error
          setCartCount(prev => prev - 1);
          throw updateError;
        }
      } else {
        // Insert new cart item
        const { error: insertError } = await supabase
          .from('cart')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1
          });

        if (insertError) {
          // Revert optimistic update on error
          setCartCount(prev => prev - 1);
          throw insertError;
        }
      }

    } catch (error) {
      console.error('Error adding to cart:', error);
      // Revert optimistic update on error
      setCartCount(prev => Math.max(0, prev - 1));
      throw error;
    }
  };

  const removeFromCart = async (cartId: string) => {
    try {
      // Optimistic update - decrement count immediately
      setCartCount(prev => Math.max(0, prev - 1));

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartId);

      if (error) {
        // Revert optimistic update on error
        setCartCount(prev => prev + 1);
        throw error;
      }

    } catch (error) {
      console.error('Error removing from cart:', error);
      // Revert optimistic update on error
      setCartCount(prev => prev + 1);
      throw error;
    }
  };

  useEffect(() => {
    const initializeCart = async () => {
      setIsLoading(true);
      await updateCartCount();
      setIsLoading(false);
    };

    initializeCart();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          await updateCartCount();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <CartContext.Provider value={{ 
      cartCount, 
      addToCart, 
      removeFromCart, 
      updateCartCount, 
      isLoading 
    }}>
      {children}
    </CartContext.Provider>
  );
}
