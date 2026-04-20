import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
    accessToken?: string;
  }
}

export type CartItemWithProduct = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    category: string;
  };
};

export type ProductWithDetails = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  featured: boolean;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderWithItems = {
  id: string;
  total: number;
  status: string;
  createdAt: Date;
  shippingName: string | null;
  shippingEmail: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingZip: string | null;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      image: string;
    };
  }[];
};

export type SearchParams = {
  query?: string;
  category?: string;
  sort?: string;
  page?: string;
};
