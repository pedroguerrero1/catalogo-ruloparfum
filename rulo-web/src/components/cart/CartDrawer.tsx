import type { Product } from '@/types/product';
import type { CatalogConfig } from '@/config/catalog';
import { RetailCartDrawer } from './RetailCartDrawer';
import { WholesaleCartDrawer } from './WholesaleCartDrawer';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  config: CatalogConfig;
  products: Product[];
}

export function CartDrawer(props: CartDrawerProps) {
  return props.config.variant === 'retail' ? (
    <RetailCartDrawer {...props} />
  ) : (
    <WholesaleCartDrawer {...props} />
  );
}
