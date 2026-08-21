import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RetailCatalog } from '@/pages/RetailCatalog';
import { WholesaleCatalog } from '@/pages/WholesaleCatalog';

const AdminPage = lazy(() => import('@/pages/AdminPage'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RetailCatalog />} />
        <Route path="/mayorista" element={<WholesaleCatalog />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={null}>
              <AdminPage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
