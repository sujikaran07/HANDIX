import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useCheckout = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const placeOrder = (paymentMethod) => {
    // In a real app, we would send order data to the backend
    // For now, we'll simulate a successful order placement
    
    toast({
      title: "Order Placed Successfully!",
      description: `Your order has been placed with ${paymentMethod} payment method.`,
    });
    
    // Clear cart and redirect to confirmation page
    localStorage.removeItem('cartItems');
    
    // In a real app, we would have an order confirmation page
    // For now, redirect to home
    navigate('/');
  };

  return { placeOrder };
};
