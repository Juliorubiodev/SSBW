import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface Producto {
  título: string
  descripción?: string
  texto_precio: string
  imagen: string
}

interface Props {
  productos: Producto[]
}

function CarrouselSSG({ productos }: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        className="rounded-2xl shadow-lg"
      >
        {productos.map((prod, i) => (
          <SwiperSlide key={i}>
            <div className="flex flex-col items-center bg-white p-6 min-h-[500px] justify-center">
              <img
                src={`/imagenes/${prod.imagen}`}
                alt={prod.título}
                className="max-h-80 object-contain mb-4"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=img' }}
              />
              <h3 className="font-garamond italic text-lg text-gray-700 text-center mt-2">
                {prod.título}
              </h3>
              <p className="text-gray-500 font-semibold mt-1">
                {prod.texto_precio}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default CarrouselSSG
