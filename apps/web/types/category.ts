export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imagePublicId?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
