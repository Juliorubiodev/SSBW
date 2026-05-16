import useSWR from 'swr'

const url = '/api/imagen-aleatoria'
const fetcher = (url: string) => fetch(url).then(res => res.json())

function Cuadros() {
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)

  const Recarga = () => { mutate() }

  if (error) return <div className="text-red-500">Error cargando cuadro</div>

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl shadow-lg bg-white max-w-sm">
      <h3 className="font-montserrat text-xl font-bold text-gray-700">
        Galería de Tienda Prado
      </h3>
      <div className="w-72 h-72 flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden">
        {isLoading ? (
          <span className="text-gray-400">Cargando...</span>
        ) : (
          <img src={data?.imagen} alt={data?.titulo} className="w-full h-full object-contain p-2" />
        )}
      </div>
      {data?.titulo && (
        <p className="font-garamond italic text-gray-500 text-sm text-center px-2">
          {data.titulo}
        </p>
      )}
      <button
        onClick={Recarga}
        className="font-bold cursor-pointer bg-olive-300 p-4 rounded-2xl hover:bg-olive-400 text-gray-500"
        style={{ backgroundColor: '#b5cc8e' }}
      >
        ¡Otro! <span>🎨</span>
      </button>
    </div>
  )
}

export default Cuadros
