import { useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

type Tab = 'destacados' | 'novedades' | 'mas-vendidos'

const tabConfig: Record<Tab, { label: string; url: string }> = {
  'destacados':   { label: 'Destacados',   url: '/api/productos?hasta=8&ordenacion=ascendente' },
  'novedades':    { label: 'Novedades',     url: '/api/productos?hasta=8&desde=0&ordenacion=descendente' },
  'mas-vendidos': { label: 'Más vendidos',  url: '/api/productos?hasta=8&ordenacion=descendente' },
}

function Portada() {
  const [activeTab, setActiveTab] = useState<Tab>('destacados')
  const { data: productos, isLoading } = useSWR(tabConfig[activeTab].url, fetcher)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-2 font-garamond">
        Tienda Prado
      </h1>
      <p className="text-center text-gray-500 mb-8">
        Galería de arte y reproducciones del Museo del Prado
      </p>

      {/* Tabs DaisyUI funcionales */}
      <div role="tablist" className="tabs tabs-boxed justify-center mb-8">
        {(Object.keys(tabConfig) as Tab[]).map(tab => (
          <a key={tab} role="tab"
             className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
             onClick={() => setActiveTab(tab)}>
            {tabConfig[tab].label}
          </a>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productos?.map((prod: any) => (
            <div key={prod.id} className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
              <figure className="h-48 bg-gray-100 p-2">
                <img
                  src={`http://localhost:3000/public/imagenes/${prod.imagen}`}
                  alt={prod.titulo}
                  className="h-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=img' }}
                />
              </figure>
              <div className="card-body p-4">
                <h2 className="card-title text-sm">{prod.titulo}</h2>
                <p className="text-right font-semibold">
                  {Number(prod.precio).toFixed(2).replace('.', ',')} €
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Portada
