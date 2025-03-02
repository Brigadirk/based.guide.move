interface Product {
  id: string;
  name: string;
  type: 'member_bundle' | 'banana_pack';
  price: number;
  bananaAmount?: number;
} 