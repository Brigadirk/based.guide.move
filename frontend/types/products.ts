interface Product {
  id: string;
  name: string;
  type: 'member_bundle' | 'token_pack';
  price: number;
  tokenAmount?: number;
} 