import { chromium } from "playwright"
import fs   from 'node:fs'
import path from 'node:path'

// --- Directorios ---
const directorio_actual   = import.meta.dirname
const directorio_imagenes = path.join(directorio_actual, 'imagenes')
if (!fs.existsSync(directorio_imagenes)) {
  fs.mkdirSync(directorio_imagenes)
}

// --- Función auxiliar para crear pausas ---
const esperar = (mili_segundos) => new Promise(resolve => setTimeout(resolve, mili_segundos))

// --- Nombre de archivo desde el título ---
const nombre_archivo_desde = (título) => título.replace(/[^a-z0-9]/gi, '_').toLowerCase()

// --- Lanzar navegador ---
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.3'
})

const page = await context.newPage()

console.log('Cargando listado de productos...')
try {
  await page.goto('https://tiendaprado.com/es/385-impresiones?resultsPerPage=999', { timeout: 15000 })
} catch (error) {
  console.error('Error cargando la página:', error.message)
  process.exit(1)
}

page.once('load', () => console.log('Página cargada'))
await page.waitForTimeout(3000)

// --- Recoger links de cada producto ---
const locators_páginas = page.locator('.thumbnail-container > a')
const lista_páginas = []

for (const loc of await locators_páginas.all()) {
  const href = await loc.getAttribute('href')
  if (href) lista_páginas.push(href)
}

console.log(`Encontrados ${lista_páginas.length} productos`)

// --- Recorrer cada página de producto ---
const productos = []

for (let i = 0; i < lista_páginas.length; i++) {
  const url = lista_páginas[i]
  console.log(`[${i + 1}/${lista_páginas.length}] Scrapeando: ${url}`)

  try {
    await page.goto(url, { timeout: 10000 })
    await esperar(1000)  // pausa para simular comportamiento humano

    // Título
    const título = (await page.locator('h1').first().innerText()).trim()

    // Descripción
    let descripción = ''
    const desc_loc = page.locator('.product-description')
    if (await desc_loc.count() > 0) {
      descripción = (await desc_loc.first().innerText()).trim()
    }

    // Precio
    let texto_precio = ''
    const precio_loc = page.locator('.current-price span')
    if (await precio_loc.count() > 0) {
      texto_precio = (await precio_loc.first().innerText()).trim()
    }

    // Imagen
    const nombre_imagen = nombre_archivo_desde(título) + '.jpg'
    let url_imagen = ''
    const img_loc = page.locator('.product-cover img')
    if (await img_loc.count() > 0) {
      url_imagen = await img_loc.first().getAttribute('src') || ''
    }

    // Descargar imagen
    if (url_imagen) {
      try {
        const ruta_imagen = path.join(directorio_imagenes, nombre_imagen)
        if (!fs.existsSync(ruta_imagen)) {
          const response = await page.request.get(url_imagen)
          fs.writeFileSync(ruta_imagen, await response.body())
          console.log(`  Imagen guardada: ${nombre_imagen}`)
        }
      } catch (e) {
        console.warn(`  No se pudo descargar la imagen: ${e.message}`)
      }
    }

    productos.push({ título, descripción, texto_precio, imagen: nombre_imagen })

  } catch (error) {
    console.warn(`  Error en ${url}: ${error.message}`)
  }
}

await browser.close()

// --- Guardar productos.json ---
const ruta_json = path.join(directorio_actual, 'productos.json')
fs.writeFileSync(ruta_json, JSON.stringify(productos, null, 2), 'utf-8')
console.log(`\nGuardados ${productos.length} productos en productos.json`)
