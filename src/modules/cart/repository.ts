import { redis } from '../../config/redis';

export interface CartData {
  id: number;
  customerId: number;
  items: Array<{
    productId: number;
    quantity: number;
    priceAtAdd: number;
  }>;
}

export class CartRepository {
  private getCartKey(customerId: number) {
    return `cart:${customerId}`;
  }

  async getByCustomerId(customerId: number): Promise<CartData> {
    const data = await redis.get(this.getCartKey(customerId));
    if (data) {
      const parsed = JSON.parse(data);
      return { id: customerId, customerId, items: parsed.items || [] };
    }
    return { id: customerId, customerId, items: [] };
  }

  async createCart(customerId: number): Promise<CartData> {
    const cart: CartData = { id: customerId, customerId, items: [] };
    await redis.set(this.getCartKey(customerId), JSON.stringify({ items: [] }));
    return cart;
  }

  async addItem(customerId: number, productId: number, quantity: number, price: number) {
    const cart = await this.getByCustomerId(customerId);
    const itemIndex = cart.items.findIndex(i => i.productId === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].priceAtAdd = price;
    } else {
      cart.items.push({ productId, quantity, priceAtAdd: price });
    }

    await redis.set(this.getCartKey(customerId), JSON.stringify({ items: cart.items }));
    return cart;
  }

  async updateItemQuantity(customerId: number, productId: number, quantity: number) {
    const cart = await this.getByCustomerId(customerId);
    const itemIndex = cart.items.findIndex(i => i.productId === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await redis.set(this.getCartKey(customerId), JSON.stringify({ items: cart.items }));
    }
    return cart;
  }

  async removeItem(customerId: number, productId: number) {
    const cart = await this.getByCustomerId(customerId);
    cart.items = cart.items.filter(i => i.productId !== productId);
    await redis.set(this.getCartKey(customerId), JSON.stringify({ items: cart.items }));
    return cart;
  }

  async clearCart(customerId: number) {
    await redis.del(this.getCartKey(customerId));
  }
}

