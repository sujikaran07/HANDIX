import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useCheckout = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const placeOrder = (paymentMethod) => {
    // Display success notification to user
    toast({
      title: "Order Placed Successfully!",
      description: `Your order has been placed with ${paymentMethod} payment method.`,
    });
    
    // Remove all items from shopping cart
    localStorage.removeItem('cartItems');
    
    // Return user to homepage after successful checkout
    navigate('/');
  };

  return { placeOrder };
};
