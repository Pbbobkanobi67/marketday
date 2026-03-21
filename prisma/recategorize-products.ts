/**
 * Recategorize products: maps old broad categories to new specific ones
 * based on product name and vendor info.
 *
 * Run: npx tsx prisma/recategorize-products.ts
 */

import dotenv from 'dotenv'
import path from 'node:path'
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

/**
 * Strategy: Use vendor name to determine the default category,
 * then use product name keywords to override for specific sub-types
 * (car freshie, soap, wax melt, etc.)
 */

// Step 1: Determine default category from vendor name
function vendorDefaultCategory(vendorName: string): string | null {
  const v = vendorName.toLowerCase()

  // Candle vendors → default to candles
  if (['candle', 'candleworks', 'light by dawn', 'ramona candle', '1976 candle', 'beehive candle'].some(k => v.includes(k))) return 'candles'

  // Soap/body vendors
  if (['tallow', 'emerald city'].some(k => v.includes(k))) return 'bath_body'

  // Jewelry
  if (['jewelry', 'linxs', 'permanent jewelry'].some(k => v.includes(k))) return 'jewelry'

  // Clothing/boutique
  if (['boutique', 'rangley', 'boujee'].some(k => v.includes(k))) return 'clothing'

  // Crochet/handmade
  if (['crochet', 'rcb crochet', 'comfy cuties'].some(k => v.includes(k))) return 'handmade'
  if (['deja vu bag', 'casa blah'].some(k => v.includes(k))) return 'handmade'

  // Plants
  if (['plant', 'gimmedem'].some(k => v.includes(k))) return 'plants'

  // Art/ceramics
  if (['ceramic', 'allison ceramic', 'create with mia', 'rooted relics'].some(k => v.includes(k))) return 'art_ceramics'

  // Pet supplies
  if (['paw', 'harlee', 'helping paw'].some(k => v.includes(k))) return 'pet_supplies'

  // Home/decor/books
  if (['book', 'books brews'].some(k => v.includes(k))) return 'home_decor'

  // Coffee/beverages
  if (['coffee', 'intergalactic', 'lemonade', 'conscious cafe'].some(k => v.includes(k))) return 'beverages'

  // Honey/preserves
  if (['bee', 'apothecary', 'bees and teas'].some(k => v.includes(k))) return 'honey_preserves'

  // Farm/produce
  if (['farm', 'harvest', 'ranch', 'scorpion', 'onofre', 'indian iron', 'cahuilla', 'pepper drive', 'big time'].some(k => v.includes(k))) return 'fresh_produce'
  if (['lovely sisters'].some(k => v.includes(k))) return 'plants'
  if (['quail'].some(k => v.includes(k))) return 'eggs_dairy'

  // Baked goods
  if (['sourdough', 'macaron', 'confection', 'sweet g'].some(k => v.includes(k))) return 'baked'

  // Hot food
  if (['taco', 'bbq', 'empanada', 'pizza', 'pierogi', 'slaw', 'surf'].some(k => v.includes(k))) return 'hot_food'
  if (['big boyz', 'on point', 'parana', 'pudz', 'rogue', "ak's sweet", 'rainbow roots'].some(k => v.includes(k))) return 'hot_food'

  // Specialty food
  if (['salsa', 'sauce', 'spice', 'herb', 'granola', 'kettle corn', 'krench', 'chafolio', 'drizzle', 'dried', 'lume', 'ninfas', 'olympus', 'ruth', 'andalucia', 'backyard bounty', 'berry stand', "jp's"].some(k => v.includes(k))) return 'specialty'

  // Nonprofit
  if (['bee the change', 'foundation'].some(k => v.includes(k))) return 'nonprofit'

  // Heart & Soul, HKC, Kendrick, Lovinity, Overnighters → general artisan
  if (['heart & soul', 'hkc', 'kendrick', 'lovinity', 'overnighters', 'bird tattoo', 'crafted by bone'].some(k => v.includes(k))) return 'handmade'

  // Refillery
  if (['refillery'].some(k => v.includes(k))) return 'bath_body'

  return null
}

// Step 2: Override based on product name keywords (only for specific sub-types)
function productNameOverride(productName: string): string | null {
  const n = productName.toLowerCase()

  // Car freshie (very specific)
  if (n.includes('car freshie') || n.includes('car freshener') || (n.includes('freshie') && !n.includes('car'))) return 'car_freshies'

  // Wax melts
  if (n.includes('wax melt') || n.includes('melt sampler') || n.includes('wax tart')) return 'wax_melts'

  // Soap/body care
  if (n.includes('soap') || n.includes('body butter') || n.includes('lotion') || n.includes('bath bomb') || n.includes('lip balm') || n.includes('goat milk') || n.includes('bar soap') || n.includes('shampoo') || n.includes('body wash') || n.includes('scrub') || n.includes('salve')) return 'bath_body'

  return null
}

function categorize(productName: string, vendorName: string, currentCategory: string): string {
  // Product name overrides always win (car freshie in a candle vendor is still a car freshie)
  const nameOverride = productNameOverride(productName)
  if (nameOverride) return nameOverride

  // Vendor default category
  const vendorDefault = vendorDefaultCategory(vendorName)
  if (vendorDefault) return vendorDefault

  // Keep current if it's already a specific (non-legacy) category
  const legacyCategories = ['certified_farmer', 'artisan_craft']
  if (!legacyCategories.includes(currentCategory)) {
    return currentCategory
  }

  // Fallback: keep as-is
  return currentCategory
}

async function main() {
  const products = await prisma.product.findMany({
    include: { vendor: { select: { name: true } } },
  })

  console.log(`Found ${products.length} products to check\n`)

  let updated = 0
  let unchanged = 0

  for (const product of products) {
    const newCategory = categorize(product.name, product.vendor.name, product.category)

    if (newCategory !== product.category) {
      await prisma.product.update({
        where: { id: product.id },
        data: { category: newCategory },
      })
      console.log(`  [UPDATED] "${product.name}": ${product.category} → ${newCategory}`)
      updated++
    } else {
      console.log(`  [OK] "${product.name}": ${product.category}`)
      unchanged++
    }
  }

  console.log(`\nDone! Updated: ${updated}, Unchanged: ${unchanged}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
