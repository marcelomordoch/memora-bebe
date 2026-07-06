/**
 * Atualiza as imagens de banners e produtos para fotos reais do Flickr (loremflickr).
 * Rodar: node scripts/update-images.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bjmuhbghcndqnbfbntzj.supabase.co'
const SERVICE_ROLE  = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// loremflickr — fotos reais do Flickr, sempre a mesma por lock
const fl = (w, h, tags, lock) =>
  `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`

const BANNER_IMAGES = [
  { partner_name: 'Amazon Baby',        image_url: fl(800,280,'baby,shopping,amazon',1001) },
  { partner_name: 'Amazon Roupinhas',   image_url: fl(800,280,'baby,clothes,fashion',1002) },
  { partner_name: 'Amazon Brinquedos',  image_url: fl(800,280,'baby,toys,play',1003) },
  { partner_name: 'Amazon Higiene Baby',image_url: fl(800,280,'baby,care,skin',1004) },
  { partner_name: 'Amazon Quarto Bebê', image_url: fl(800,280,'nursery,baby,room',1005) },
]

// sort_order 0-4 = Roupinhas, 5-9 = Brinquedos, 10-14 = Higiene,
// 15-19 = Alimentação, 20-24 = Quarto, 25-29 = Passeio
const PRODUCT_IMAGES = [
  { sort_order:  0, image_url: fl(300,300,'baby,bodysuit,white',2001) },
  { sort_order:  1, image_url: fl(300,300,'baby,romper,warm',2002) },
  { sort_order:  2, image_url: fl(300,300,'baby,clothes,colorful',2003) },
  { sort_order:  3, image_url: fl(300,300,'baby,pajamas,feet',2004) },
  { sort_order:  4, image_url: fl(300,300,'baby,layette,newborn',2005) },

  { sort_order:  5, image_url: fl(300,300,'baby,teether,silicone',2006) },
  { sort_order:  6, image_url: fl(300,300,'giraffe,toy,rubber',2007) },
  { sort_order:  7, image_url: fl(300,300,'baby,playmat,activity',2008) },
  { sort_order:  8, image_url: fl(300,300,'baby,mobile,crib',2009) },
  { sort_order:  9, image_url: fl(300,300,'baby,bath,toys',2010) },

  { sort_order: 10, image_url: fl(300,300,'baby,cream,bepantol',2011) },
  { sort_order: 11, image_url: fl(300,300,'baby,shampoo,hair',2012) },
  { sort_order: 12, image_url: fl(300,300,'baby,wipes,diaper',2013) },
  { sort_order: 13, image_url: fl(300,300,'baby,lotion,moisturizer',2014) },
  { sort_order: 14, image_url: fl(300,300,'baby,soap,bath',2015) },

  { sort_order: 15, image_url: fl(300,300,'baby,spoon,feeding',2016) },
  { sort_order: 16, image_url: fl(300,300,'baby,food,container',2017) },
  { sort_order: 17, image_url: fl(300,300,'baby,bib,eating',2018) },
  { sort_order: 18, image_url: fl(300,300,'baby,bottle,feeding',2019) },
  { sort_order: 19, image_url: fl(300,300,'baby,cup,sippy',2020) },

  { sort_order: 20, image_url: fl(300,300,'baby,crib,portable',2021) },
  { sort_order: 21, image_url: fl(300,300,'baby,pillow,soft',2022) },
  { sort_order: 22, image_url: fl(300,300,'stars,projector,night',2023) },
  { sort_order: 23, image_url: fl(300,300,'baby,bedding,sheet',2024) },
  { sort_order: 24, image_url: fl(300,300,'baby,monitor,camera',2025) },

  { sort_order: 25, image_url: fl(300,300,'stroller,baby,walk',2026) },
  { sort_order: 26, image_url: fl(300,300,'baby,bag,backpack',2027) },
  { sort_order: 27, image_url: fl(300,300,'baby,carseat,infant',2028) },
  { sort_order: 28, image_url: fl(300,300,'stroller,rain,cover',2029) },
  { sort_order: 29, image_url: fl(300,300,'stroller,tray,organizer',2030) },
]

async function main() {
  console.log('Atualizando imagens de banners...')
  for (const { partner_name, image_url } of BANNER_IMAGES) {
    const { error } = await supabase
      .from('partner_banners')
      .update({ image_url })
      .eq('partner_name', partner_name)
    if (error) console.error(`  ✗ ${partner_name}:`, error.message)
    else console.log(`  ✓ ${partner_name}`)
  }

  console.log('\nAtualizando imagens de produtos...')
  for (const { sort_order, image_url } of PRODUCT_IMAGES) {
    const { error } = await supabase
      .from('partner_products')
      .update({ image_url })
      .eq('sort_order', sort_order)
    if (error) console.error(`  ✗ sort_order=${sort_order}:`, error.message)
    else console.log(`  ✓ sort_order=${sort_order}`)
  }

  console.log('\nFeito!')
}

main().catch(console.error)
