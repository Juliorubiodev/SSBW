import Carrousel from '../components/Carrousel.tsx'

function CarrouselPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2 font-garamond">
        Carrousel de Imágenes
      </h1>
      <p className="text-center text-gray-500 mb-8">
        Reproducciones del Museo del Prado
      </p>
      <Carrousel />
    </div>
  )
}

export default CarrouselPage
