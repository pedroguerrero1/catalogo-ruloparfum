import { CatalogPage } from './CatalogPage';
import { wholesaleCatalogConfig } from '@/config/catalog';

export function WholesaleCatalog() {
  return <CatalogPage config={wholesaleCatalogConfig} />;
}
