import { useState, useEffect } from 'react'

function Perritos() {
  const [imagen, setImagen] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchPerrito = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://dog.ceo/api/breeds/image/random')
      const data = await response.json()
      setImagen(data.message)
    } catch (error) {
      console.error('Error fetching perrito:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPerrito()
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl shadow-lg bg-white max-w-sm">
      <h3 className="font-montserrat text-xl font-bold text-gray-700">
        Perritos Aleatorios
      </h3>
      <div className="w-72 h-72 flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden">
        {loading ? (
          <span className="text-gray-400">Cargando...</span>
        ) : (
          <img src={imagen} alt="Perrito aleatorio" className="w-full h-full object-cover" />
        )}
      </div>
      <button
        onClick={fetchPerrito}
        className="font-bold cursor-pointer bg-amber-300 p-4 rounded-2xl hover:bg-amber-400 text-gray-600"
      >
        ¡Otro! <span>🐶</span>
      </button>
    </div>
  )
}

export default Perritos
