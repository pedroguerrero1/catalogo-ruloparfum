import { CatalogPage } from './CatalogPage';
import { retailCatalogConfig } from '@/config/catalog';

export function RetailCatalog() {
  return <CatalogPage config={retailCatalogConfig} />;
}
