export interface CreateProductDTO {
  vendorId: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
}

export interface ProductQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  vendorId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  order?: string;
  isActive?: boolean;
}
