import prisma from "./prisma/prisma.client.ts"

// Registrar usuarios de prueba
const usuarios = [
  { email: "admin@tiendaprado.com", nombre: "Admin", password: "admin123", admin: true },
  { email: "juan@correo.com",       nombre: "Juan",  password: "juan123",  admin: false },
  { email: "maria@correo.com",      nombre: "María", password: "maria123", admin: false },
]

console.log("--- Registrando usuarios ---")
for (const u of usuarios) {
  try {
    const usuario = await prisma.usuario.registra(u)
    console.log(`Registrado: ${usuario.nombre} (${usuario.email}) admin:${usuario.admin}`)
  } catch (error: any) {
    console.error(`Error registrando ${u.email}: ${error.message}`)
  }
}

// Comprobar autentificación
console.log("\n--- Comprobación de autentificación ---")
try {
  const user = await prisma.usuario.autentifica("admin@tiendaprado.com", "admin123")
  console.log(`Login OK: ${user.nombre} (admin: ${user.admin})`)
} catch (error: any) {
  console.error(`Login fallido: ${error.message}`)
}

try {
  await prisma.usuario.autentifica("admin@tiendaprado.com", "wrongpassword")
  console.log("ERROR: no debería haber llegado aquí")
} catch (error: any) {
  console.log(`Login rechazado correctamente: ${error.message}`)
}

await prisma.$disconnect()
