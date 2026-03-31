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

export default router
