import express from "express"
import logger  from "../logger.ts"

const router = express.Router()

function recalcCart(req: any) {
  const carrito = req.session.carrito || []
  const total = carrito.reduce((acc: number, item: any) => acc + item.cantidad, 0)
  req.session.total_carrito = total
  return total
}

router.get('/', async (req, res) => {
  try {
    const { prisma } = await import("../prisma/prisma.client.ts")
    const cards = await prisma.producto.findMany({
      omit: { descripcion: true }
    })
    res.render('portada.njk', { cards })
  } catch (error: any) {
    logger.error(`Portada: ${error.message}`)
    res.status(500).send(`Error: ${error.message}`)
  }
})

router.get('/buscar', async (req, res) => {
  try {
    const { prisma } = await import("../prisma/prisma.client.ts")
    const busqueda = String(req.query.busqueda || '')
    logger.debug(`Búsqueda: "${busqueda}"`)
    const cards = await prisma.producto.findMany({
      where: {
        OR: [
          { titulo:      { contains: busqueda, mode: 'insensitive' } },
          { descripcion: { contains: busqueda, mode: 'insensitive' } }
        ]
      },
      omit: { descripcion: true }
    })
    res.render('portada.njk', { cards, busqueda })
  } catch (error: any) {
    logger.error(`Búsqueda: ${error.message}`)
    res.status(500).send(`Error: ${error.message}`)
  }
})

router.get('/producto/:id', async (req, res) => {
  try {
    const { prisma } = await import("../prisma/prisma.client.ts")
    const id   = Number(req.params.id)
    const card = await prisma.producto.findUnique({ where: { id } })
    if (!card) return res.status(404).send('Producto no encontrado')
    const added = req.query.added === '1'
    res.render('detalle.njk', { card, added })
  } catch (error: any) {
    logger.error(`Detalle: ${error.message}`)
    res.status(500).send(`Error: ${error.message}`)
  }
})

router.post('/al-carrito/:id', async (req, res) => {
  const id       = Number(req.params.id)
  const cantidad = Number(req.body.cantidad)
  logger.debug(`Al carrito: id=${id} cantidad=${cantidad}`)

  if (cantidad > 0) {
    if (!req.session.carrito) req.session.carrito = []
    const existing = req.session.carrito.find((item: any) => item.id === id)
    if (existing) {
      existing.cantidad += cantidad
    } else {
      req.session.carrito.push({ id, cantidad })
    }
    recalcCart(req)
  }

  res.redirect(`/producto/${id}?added=1`)
})

router.post('/actualizar-carrito/:id', (req, res) => {
  const id = Number(req.params.id)
  const cantidad = Number(req.body.cantidad)

  if (req.session.carrito) {
    if (cantidad <= 0) {
      req.session.carrito = req.session.carrito.filter((item: any) => item.id !== id)
    } else {
      const item = req.session.carrito.find((item: any) => item.id === id)
      if (item) item.cantidad = cantidad
    }
    recalcCart(req)
  }
  res.redirect('/carrito')
})

// Cruza los IDs del carrito (sesión) con los datos reales de la BD
async function buildCartItems(req: any) {
  const carrito = req.session.carrito || []
  if (carrito.length === 0) return { items: [], total_precio: '0.00' }

  const { prisma } = await import("../prisma/prisma.client.ts")
  const ids = carrito.map((item: any) => item.id)
  const productos = await prisma.producto.findMany({ where: { id: { in: ids } } })

  const items = carrito.map((item: any) => {
    const prod = productos.find((p: any) => p.id === item.id)
    if (!prod) return null
    const precio = Number(prod.precio)
    const subtotal = (precio * item.cantidad).toFixed(2)
    return {
      id: prod.id,
      titulo: prod.titulo,
      imagen: prod.imagen,
      precio: precio.toFixed(2),
      cantidad: item.cantidad,
      subtotal
    }
  }).filter(Boolean)

  const total_precio = items.reduce((acc: number, item: any) => acc + Number(item.subtotal), 0).toFixed(2)
  return { items, total_precio }
}

router.get('/carrito', async (req, res) => {
  try {
    const { items, total_precio } = await buildCartItems(req)
    res.render('carrito.njk', { items, total_precio })
  } catch (error: any) {
    logger.error(`Carrito: ${error.message}`)
    res.status(500).send(`Error: ${error.message}`)
  }
})

router.post('/quitar-del-carrito/:id', (req, res) => {
  const id = Number(req.params.id)
  if (req.session.carrito) {
    req.session.carrito = req.session.carrito.filter((item: any) => item.id !== id)
    recalcCart(req)
  }
  res.redirect('/carrito')
})

router.get('/checkout', async (req, res) => {
  try {
    const carrito = req.session.carrito || []
    if (carrito.length === 0) return res.redirect('/carrito')
    const { items, total_precio } = await buildCartItems(req)
    res.render('checkout.njk', { items, total_precio, confirmado: false })
  } catch (error: any) {
    logger.error(`Checkout: ${error.message}`)
    res.status(500).send(`Error: ${error.message}`)
  }
})

router.post('/checkout', async (req, res) => {
  try {
    const { items, total_precio } = await buildCartItems(req)
    const orden = Math.floor(100000 + Math.random() * 900000)

    logger.info(`Pedido #${orden} confirmado - Total: ${total_precio}€`)
    logger.info(`Datos envío: ${req.body.nombre} ${req.body.apellidos}, ${req.body.direccion}, ${req.body.ciudad}`)

    req.session.carrito = []
    req.session.total_carrito = 0

    res.render('checkout.njk', { items, total_precio, confirmado: true, orden })
  } catch (error: any) {
    logger.error(`Checkout: ${error.message}`)
    res.status(500).send(`Error: ${error.message}`)
  }
})

export default router
