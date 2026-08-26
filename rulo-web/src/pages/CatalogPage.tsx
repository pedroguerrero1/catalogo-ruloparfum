import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';
import { ScrollTopButton } from '@/components/layout/ScrollTopButton';
import { Hero } from '@/components/catalog/Hero';
import { CategoryNav } from '@/components/catalog/CategoryNav';
import { CatalogSection } from '@/components/catalog/CatalogSection';
import { GroupedByLineAndBrand } from '@/components/catalog/GroupedByLineAndBrand';
import { GroupedByMl } from '@/components/catalog/GroupedByMl';
import { BrandFilterSelect } from '@/components/catalog/BrandFilterSelect';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { EmptyState } from '@/components/catalog/EmptyState';
import { CartFloatingButton } from '@/components/cart/CartFloatingButton';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductModal } from '@/components/product/ProductModal';
import { useCatalogData } from '@/hooks/useCatalogData';
import { useCartCount } from '@/hooks/useCartCount';
import { applyFilters, type FilterOption } from '@/utils/filters';
import { uniqueBrands } from '@/utils/grouping';
import type { CatalogConfig } from '@/config/catalog';
import type { Product } from '@/types/product';

export function CatalogPage({ config }: { config: CatalogConfig }) {
  const data = useCatalogData(config);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [perfumeBrand, setPerfumeBrand] = useState<string | null>(null);
  const [decantBrand, setDecantBrand] = useState<string | null>(null);

  // Safety net: if a query hangs (some in-app browsers stall network requests
  // instead of erroring), stop blocking the whole page after a few seconds
  // and show whatever sections did load.
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  useEffect(() => {
    if (!data.isLoading) return;
    const timer = setTimeout(() => setLoadingTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [data.isLoading]);
  const showLoadingState = data.isLoading && !loadingTimedOut;

  const getPrice = (p: Product) => config.getDisplayPrice(p).current;
  const filterState = { query, filter };

  const perfumes = useMemo(
    () => applyFilters(data.perfumes, filterState, getPrice, { applyGenderAndSort: true }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.perfumes, query, filter],
  );
  const decants = useMemo(
    () => applyFilters(data.decants, filterState, getPrice, { applyGenderAndSort: false }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.decants, query],
  );
  const promos = useMemo(
    () => applyFilters(data.promos, filterState, getPrice, { applyGenderAndSort: false }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.promos, query],
  );
  const desodorantes = useMemo(
    () => applyFilters(data.desodorantes, filterState, getPrice, { applyGenderAndSort: false }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.desodorantes, query],
  );
  const bodysplash = useMemo(
    () => applyFilters(data.bodysplash, filterState, getPrice, { applyGenderAndSort: false }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.bodysplash, query],
  );
  const cremas = useMemo(
    () => applyFilters(data.cremas, filterState, getPrice, { applyGenderAndSort: false }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.cremas, query],
  );
  const vapers = useMemo(
    () => applyFilters(data.vapers, filterState, getPrice, { applyGenderAndSort: false }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.vapers, query],
  );

  const perfumeBrands = useMemo(() => uniqueBrands(perfumes), [perfumes]);
  const effectivePerfumeBrand =
    perfumeBrand && perfumeBrands.includes(perfumeBrand) ? perfumeBrand : null;
  const perfumesForDisplay = effectivePerfumeBrand
    ? perfumes.filter((p) => (p.marca || 'Otros') === effectivePerfumeBrand)
    : perfumes;

  const decantBrands = useMemo(() => uniqueBrands(decants), [decants]);
  const effectiveDecantBrand =
    decantBrand && decantBrands.includes(decantBrand) ? decantBrand : null;
  const decantsForDisplay = effectiveDecantBrand
    ? decants.filter((p) => (p.marca || 'Otros') === effectiveDecantBrand)
    : decants;

  const allProducts = [
    ...data.perfumes,
    ...data.decants,
    ...data.promos,
    ...data.desodorantes,
    ...data.bodysplash,
    ...data.cremas,
    ...data.vapers,
  ];
  const totalResults =
    perfumes.length +
    decants.length +
    promos.length +
    desodorantes.length +
    bodysplash.length +
    cremas.length +
    vapers.length;
  const noResults = query.trim() !== '' && totalResults === 0;

  const cartCount = useCartCount(config.variant);
  const sortWithinBrand = config.variant === 'wholesale';
  const isWholesale = config.variant === 'wholesale';

  return (
    <div className="min-h-screen pb-28">
      <Header
        variant={config.variant}
        query={query}
        onQueryChange={setQuery}
        filter={filter}
        onFilterChange={setFilter}
      />

      <main className="mx-auto max-w-6xl px-4">
        <Hero
          title={isWholesale ? 'Catálogo Mayorista' : 'Catálogo de Perfumes Árabes'}
          subtitle={
            isWholesale ? (
              'Precios mayoristas exclusivos · Consultá disponibilidad por WhatsApp'
            ) : (
              <>
                Elegí tu fragancia • Mirá precio
                <br />
                Tocá "Consultar" y te respondemos por WhatsApp
              </>
            )
          }
        />

        {isWholesale ? (
          <div className="mb-6 rounded-2xl border border-gold/30 bg-gold-bg px-4 py-3 text-center text-xs font-semibold text-gold sm:text-sm">
            🔒 Este catálogo es exclusivo para clientes mayoristas. Los precios son confidenciales.
          </div>
        ) : null}

        <CategoryNav
          availability={
            showLoadingState
              ? undefined
              : {
                  perfumes: data.perfumes.length > 0,
                  decants: data.decants.length > 0,
                  promos: data.promos.length > 0,
                  desodorantes: data.desodorantes.length > 0,
                  bodysplash: data.bodysplash.length > 0,
                  cremas: data.cremas.length > 0,
                  vapers: data.vapers.length > 0,
                }
          }
        />

        {showLoadingState ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-gold" />
            <p className="text-sm text-muted">Cargando catálogo...</p>
          </div>
        ) : noResults ? (
          <EmptyState message="No se encontraron productos con esos filtros." />
        ) : (
          <div className="space-y-10 py-4">
            {perfumes.length > 0 ? (
              <CatalogSection
                id="perfumes"
                title="Perfumes"
                action={
                  <BrandFilterSelect
                    brands={perfumeBrands}
                    selected={effectivePerfumeBrand}
                    onSelect={setPerfumeBrand}
                  />
                }
              >
                <GroupedByLineAndBrand
                  products={perfumesForDisplay}
                  config={config}
                  onOpenModal={setActiveProduct}
                  sortWithinBrand={sortWithinBrand}
                />
              </CatalogSection>
            ) : null}

            {decants.length > 0 ? (
              <CatalogSection
                id="decants"
                title="Decants"
                action={
                  <BrandFilterSelect
                    brands={decantBrands}
                    selected={effectiveDecantBrand}
                    onSelect={setDecantBrand}
                  />
                }
              >
                <GroupedByMl
                  products={decantsForDisplay}
                  config={config}
                  onOpenModal={setActiveProduct}
                  sortWithinBrand={sortWithinBrand}
                />
              </CatalogSection>
            ) : null}

            {promos.length > 0 ? (
              <CatalogSection id="promos" title="Kits">
                <ProductGrid products={promos} config={config} onOpenModal={setActiveProduct} />
              </CatalogSection>
            ) : null}

            {desodorantes.length > 0 ? (
              <CatalogSection id="desodorantes" title="Desodorantes">
                <ProductGrid
                  products={desodorantes}
                  config={config}
                  onOpenModal={setActiveProduct}
                />
              </CatalogSection>
            ) : null}

            {bodysplash.length > 0 ? (
              <CatalogSection id="bodysplash" title="Body Splash">
                <ProductGrid products={bodysplash} config={config} onOpenModal={setActiveProduct} />
              </CatalogSection>
            ) : null}

            {cremas.length > 0 ? (
              <CatalogSection id="cremas" title="Crema/Serum">
                <ProductGrid products={cremas} config={config} onOpenModal={setActiveProduct} />
              </CatalogSection>
            ) : null}

            {vapers.length > 0 ? (
              <CatalogSection id="vapers" title="Vapers">
                <ProductGrid products={vapers} config={config} onOpenModal={setActiveProduct} />
              </CatalogSection>
            ) : null}
          </div>
        )}

        <div className="py-6 text-center text-xs font-semibold text-wa">
          🟢 Atención por WhatsApp activa
        </div>
      </main>

      <Footer variant={config.variant} />

      <FloatingWhatsApp />
      <ScrollTopButton />
      <CartFloatingButton count={cartCount} onClick={() => setCartOpen(true)} />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        config={config}
        products={allProducts}
      />
      <ProductModal product={activeProduct} config={config} onClose={() => setActiveProduct(null)} />
    </div>
  );
}
