import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function Carrousel() {
  const { data: productos, isLoading, error } = useSWR('/api/productos?hasta=20', fetcher)

  if (error) return <div className="text-red-500 text-center py-8">Error cargando imágenes</div>

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

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
        {productos?.map((prod: any) => (
          <SwiperSlide key={prod.id}>
            <div className="flex flex-col items-center bg-white p-6 min-h-[500px] justify-center">
              <img
                src={`http://localhost:3000/public/imagenes/${prod.imagen}`}
                alt={prod.titulo}
                className="max-h-80 object-contain mb-4"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=img' }}
              />
              <h3 className="font-garamond italic text-lg text-gray-700 text-center mt-2">
                {prod.titulo}
              </h3>
              <p className="text-gray-500 font-semibold mt-1">
                {Number(prod.precio).toFixed(2).replace('.', ',')} €
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default Carrousel
