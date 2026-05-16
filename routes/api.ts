import express from "express"
import logger  from "../logger.ts"

const router = express.Router()

// GET /api/productos?desde=1&hasta=20&ordenacion=ascendente
router.get('/productos', async (req, res) => {
  try {
    const { prisma } = await import("../prisma/prisma.client.ts")

    const desde     = Number(req.query.desde)     || 0
    const hasta     = Number(req.query.hasta)     || 20
    const ordenacion = String(req.query.ordenacion || 'ascendente')

    const productos = await prisma.producto.findMany({
      skip:    desde,
      take:    hasta,
      orderBy: { precio: ordenacion === 'descendente' ? 'desc' : 'asc' }
    })

    res.json(productos)
  } catch (error: any) {
    logger.error(`API GET /productos: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/productos/:id
router.get('/productos/:id', async (req, res) => {
  try {
    const { prisma } = await import("../prisma/prisma.client.ts")
    const id = Number(req.params.id)
    const producto = await prisma.producto.findUnique({ where: { id } })
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json(producto)
  } catch (error: any) {
    logger.error(`API GET /productos/${req.params.id}: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/productos
router.post('/productos', async (req, res) => {
  try {
    const { prisma } = await import("../prisma/prisma.client.ts")
    const { titulo, descripcion, precio, imagen } = req.body

    if (!titulo || !precio) {
      return res.status(400).json({ error: 'titulo y precio son obligatorios' })
    }

    const producto = await prisma.producto.create({
      data: { titulo, descripcion: descripcion || '', precio: Number(precio), imagen: imagen || '' }
    })

    logger.info(`API: producto creado id=${producto.id}`)
    res.status(201).json(producto)
  } catch (error: any) {
    logger.error(`API POST /productos: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/producto/:id
router.put('/producto/:id', async (req, res) => {
  try {
    const { prisma } = await import("../prisma/prisma.client.ts")
    const id = Number(req.params.id)
    const { titulo, descripcion, precio } = req.body

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        ...(titulo      !== undefined && { titulo }),
        ...(descripcion !== undefined && { descripcion }),
        ...(precio      !== undefined && { precio: Number(precio) })
      }
    })

    logger.info(`API: producto actualizado id=${id}`)
    res.json(producto)
  } catch (error: any) {
    logger.error(`API PUT /producto/${req.params.id}: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/productos/:id
router.delete('/productos/:id', async (req, res) => {
  try {
    const { prisma } = await import("../prisma/prisma.client.ts")
    const id = Number(req.params.id)
    await prisma.producto.delete({ where: { id } })
    logger.info(`API: producto eliminado id=${id}`)
    res.json({ mensaje: `Producto ${id} eliminado` })
  } catch (error: any) {
    logger.error(`API DELETE /productos/${req.params.id}: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/carrito — devuelve items del carrito con datos del producto
router.get('/carrito', async (req, res) => {
  try {
    const carrito = (req.session as any).carrito || []
    if (carrito.length === 0) return res.json([])

    const { prisma } = await import("../prisma/prisma.client.ts")
    const ids = carrito.map((item: any) => item.id)
    const productos = await prisma.producto.findMany({ where: { id: { in: ids } } })

    const items = carrito.map((item: any) => {
      const prod = productos.find((p: any) => p.id === item.id)
      if (!prod) return null
      return {
        id: prod.id,
        titulo: prod.titulo,
        imagen: prod.imagen,
        precio: Number(prod.precio),
        cantidad: item.cantidad,
        subtotal: Number(prod.precio) * item.cantidad
      }
    }).filter(Boolean)

    res.json(items)
  } catch (error: any) {
    logger.error(`API GET /carrito: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/carrito/:id — quita un producto del carrito
router.delete('/carrito/:id', (req, res) => {
  const id = Number(req.params.id)
  const session = req.session as any
  if (session.carrito) {
    session.carrito = session.carrito.filter((item: any) => item.id !== id)
    session.total_carrito = session.carrito.reduce((acc: number, item: any) => acc + item.cantidad, 0)
  }
  res.json({ mensaje: `Producto ${id} eliminado del carrito` })
})

// GET /api/imagen-aleatoria — devuelve una imagen aleatoria de la tienda
router.get('/imagen-aleatoria', async (req, res) => {
  try {
    const { prisma } = await import("../prisma/prisma.client.ts")
    const count = await prisma.producto.count()
    const skip = Math.floor(Math.random() * count)
    const producto = await prisma.producto.findFirst({ skip, take: 1 })
    if (!producto) return res.status(404).json({ error: 'No hay productos' })
    res.json({
      id: producto.id,
      titulo: producto.titulo,
      imagen: `/public/imagenes/${producto.imagen}`
    })
  } catch (error: any) {
    logger.error(`API GET /imagen-aleatoria: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

export default router
