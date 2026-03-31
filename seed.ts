import prisma from "./prisma/prisma.client.ts"

type Producto = {
  título: string
  descripción: string
  texto_precio: string
  imagen: string
}
type Productos = Producto[]

import productos_raw from "./productos.json" with { type: 'json' }
const productos = productos_raw as Productos

await prisma.producto.deleteMany({})
console.log('Tabla limpiada')

await Guardar_en_DB(productos)

console.log('\n--- Consultas de comprobación ---')

// Láminas ordenadas por precio (verificación de datos insertados)
const laminas = await prisma.producto.findMany({
  where: {
    titulo: { startsWith: 'Lámina', mode: 'insensitive' }
  },
  orderBy: { precio: 'asc' }
})
console.log(`Láminas ordenadas por precio (${laminas.length} resultados):`)
laminas.slice(0, 5).forEach(p => console.log(`  ${p.titulo} - ${p.precio}€`))

await prisma.$disconnect()

async function Guardar_en_DB(productos: Productos): Promise<void> {
  for (const producto of productos) {
    const titulo      = producto.título
    const descripcion = producto.descripción
    const imagen      = producto.imagen
    const precio_str  = producto.texto_precio.replace(/[^\d,]/g, '').replace(',', '.')
    const precio      = Number(precio_str) || 0

    try {
      const prod = await prisma.producto.create({
        data: { titulo, descripcion, imagen, precio }
      })
      console.log('Creado:', prod.titulo)
    } catch (error: any) {
      console.error('Error:', error.message)
    }
  }
}
