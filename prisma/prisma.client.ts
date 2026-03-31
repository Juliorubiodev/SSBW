import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const buf = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${buf.toString('hex')}`
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':')
  const buf = (await scryptAsync(password, salt, 64)) as Buffer
  const keyBuf = Buffer.from(key, 'hex')
  return timingSafeEqual(buf, keyBuf)
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const basePrisma = new PrismaClient({ adapter })

// basePrisma se necesita separado porque $extends devuelve un tipo distinto
const prisma = basePrisma.$extends({
  model: {
    usuario: {
      async registra(data: { email: string; nombre: string; password: string; admin?: boolean }) {
        const hash = await hashPassword(data.password)
        return basePrisma.usuario.create({
          data: { email: data.email, nombre: data.nombre, password: hash, admin: data.admin ?? false }
        })
      },

      async autentifica(email: string, password: string) {
        const usuario = await basePrisma.usuario.findUnique({ where: { email } })
        if (!usuario) throw new Error('Usuario no encontrado')
        const valid = await verifyPassword(password, usuario.password)
        if (!valid) throw new Error('Contraseña incorrecta')
        return usuario
      }
    }
  }
})

export { prisma }
export default prisma
