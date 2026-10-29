import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { UpdateBanner } from '@/components/UpdateBanner'
import { PageDemo } from '@/features/demo/PageDemo'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<PageDemo />} />
      </Routes>
      <UpdateBanner />
    </BrowserRouter>
  )
}
