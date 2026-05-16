import express      from "express"
import nunjucks     from "nunjucks"
import session      from "express-session"
import cookieParser from "cookie-parser"
import jwt          from "jsonwebtoken"
import logger       from "./logger.ts"

const app  = express()
const PORT = process.env.PORT || 3000

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

// CORS: permitir peticiones desde los servidores de desarrollo (Vite y Astro)
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:4321']
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Credentials', 'true')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.use(session({
  secret: 'ssbw-secret-key',
  resave: false,
  saveUninitialized: false
}))

// Propaga el total del carrito a todas las plantillas via res.locals
app.use((req, res, next) => {
  if (req.session.total_carrito) {
    res.locals.total_carrito = req.session.total_carrito
  }
  next()
})

app.use('/public/imagenes', express.static('imagenes'))

const env = nunjucks.configure('views', {
  autoescape: true,
  express: app,
  watch: true
})

// Formatea Decimal de Prisma a string con coma: 30 -> "30,00"
env.addFilter('precio', (val: any) => {
  return Number(val).toFixed(2).replace('.', ',')
})

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`)
  next()
})

// Verifica el JWT en cookie y expone los datos del usuario en app.locals
app.use((req, res, next) => {
  const token = req.cookies.access_token
  if (token) {
    try {
      const data = jwt.verify(token, process.env.SECRET_KEY as string) as any
      app.locals.usuario = data.usuario
      app.locals.email   = data.email
      app.locals.admin   = data.admin
    } catch {
      app.locals.usuario = undefined
      app.locals.email   = undefined
      app.locals.admin   = undefined
    }
  } else {
    app.locals.usuario = undefined
    app.locals.email   = undefined
    app.locals.admin   = undefined
  }
  next()
})

import ProductosRouter from "./routes/productos.ts"
import UsuariosRouter  from "./routes/usuarios.ts"
import ApiRouter       from "./routes/api.ts"
app.use('/', ProductosRouter)
app.use('/', UsuariosRouter)
app.use('/api', ApiRouter)

app.listen(PORT, () => {
  logger.info(`Servidor en http://localhost:${PORT}`)
})
