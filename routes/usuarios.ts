import express from "express"
import jwt from "jsonwebtoken"
import logger from "../logger.ts"

const router = express.Router()

router.get('/login', (req, res) => {
  res.render('login.njk', { error: false })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const { prisma } = await import("../prisma/prisma.client.ts")
    const usuario = await prisma.usuario.autentifica(email, password)
    const token = jwt.sign(
      { usuario: usuario.nombre, email: usuario.email, admin: usuario.admin },
      process.env.SECRET_KEY as string
    )

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }).redirect('/')

  } catch (error: any) {
    logger.error(`Login fallido: ${error.message}`)
    res.render('login.njk', { error: true })
  }
})

router.get('/registro', (req, res) => {
  res.render('registro.njk', { error: false, success: false, nombre: '', email: '' })
})

router.post('/registro', async (req, res) => {
  const { nombre, email, password, password_confirm } = req.body

  if (password !== password_confirm) {
    return res.render('registro.njk', {
      error: 'Las contraseñas no coinciden',
      success: false, nombre, email
    })
  }

  if (password.length < 6) {
    return res.render('registro.njk', {
      error: 'La contraseña debe tener al menos 6 caracteres',
      success: false, nombre, email
    })
  }

  try {
    const { prisma } = await import("../prisma/prisma.client.ts")

    const existing = await prisma.usuario.findUnique({ where: { email } })
    if (existing) {
      return res.render('registro.njk', {
        error: 'Ya existe una cuenta con ese email',
        success: false, nombre, email
      })
    }

    await prisma.usuario.registra({ email, nombre, password })
    logger.info(`Nuevo usuario registrado: ${email}`)

    res.render('registro.njk', {
      error: false, success: true, nombre: '', email: ''
    })

  } catch (error: any) {
    logger.error(`Registro fallido: ${error.message}`)
    res.render('registro.njk', {
      error: 'Error al crear la cuenta. Inténtalo de nuevo.',
      success: false, nombre, email
    })
  }
})

router.get('/logout', (req, res) => {
  res.clearCookie("access_token").redirect('/')
})

router.get('/perfil', async (req, res) => {
  const app = req.app
  if (!app.locals.usuario) return res.redirect('/login')

  try {
    const { prisma } = await import("../prisma/prisma.client.ts")
    const token = req.cookies.access_token
    const data = jwt.verify(token, process.env.SECRET_KEY as string) as any
    const perfil = await prisma.usuario.findUnique({ where: { email: data.email } })
    if (!perfil) return res.redirect('/login')

    res.render('perfil.njk', { perfil })
  } catch (error: any) {
    logger.error(`Perfil: ${error.message}`)
    res.redirect('/login')
  }
})

router.get('/admin', async (req, res) => {
  const app = req.app
  if (!app.locals.admin) return res.redirect('/')

  try {
    const { prisma } = await import("../prisma/prisma.client.ts")
    const [productos, usuarios, total_productos, total_usuarios] = await Promise.all([
      prisma.producto.findMany({ omit: { descripcion: true }, take: 50 }),
      prisma.usuario.findMany({ omit: { password: true } }),
      prisma.producto.count(),
      prisma.usuario.count()
    ])

    res.render('admin.njk', {
      productos,
      usuarios,
      total_productos,
      total_usuarios,
      total_pedidos: 0
    })
  } catch (error: any) {
    logger.error(`Admin: ${error.message}`)
    res.status(500).send(`Error: ${error.message}`)
  }
})

export default router
