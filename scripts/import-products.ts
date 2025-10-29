import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Carregar variáveis de ambiente do .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Usar service role key para bypass do RLS, ou anon key como fallback
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e (SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY) são obrigatórias')
  console.error('\n💡 Para importações em massa, recomenda-se usar SUPABASE_SERVICE_ROLE_KEY para bypass do RLS.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface CSVRow {
  name: string
  category_id: string
  unit_id: string
  price: string
  cost: string
  quantity: string
  sku: string
  image_url: string
  is_active: string
}

function parseCSV(filePath: string): CSVRow[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  
  const rows: CSVRow[] = []
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue // Pula linhas vazias
    
    // Parse CSV considerando aspas
    const values: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    
    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    rows.push(row as CSVRow)
  }
  
  return rows
}

async function getCategoryId(name: string, createdCategories: Map<string, string>): Promise<string | null> {
  // Verifica se já foi criada nesta sessão
  if (createdCategories.has(name)) {
    return createdCategories.get(name)!
  }
  
  // Primeiro tenta busca exata (case-insensitive)
  let { data, error } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', name)
    .maybeSingle()
  
  if (!error && data) {
    createdCategories.set(name, data.id)
    return data.id
  }
  
  // Se não encontrou, tenta buscar por substring
  // Ex: "Limpeza - Sabão e Detergente" pode não existir, mas "Limpeza" pode existir
  const { data: allCategories, error: fetchError } = await supabase
    .from('categories')
    .select('id, name')
  
  if (fetchError || !allCategories) {
    console.warn(`⚠️  Erro ao buscar categorias: ${fetchError?.message}`)
    return null
  }
  
  // Tenta encontrar correspondência parcial
  const matched = allCategories.find(cat => 
    name.toLowerCase().includes(cat.name.toLowerCase()) ||
    cat.name.toLowerCase().includes(name.toLowerCase())
  )
  
  if (matched) {
    console.log(`  🔗 Mapeamento parcial: "${name}" -> "${matched.name}" (${matched.id})`)
    createdCategories.set(name, matched.id)
    return matched.id
  }
  
  // Se não encontrou, cria a categoria
  console.log(`  ➕ Criando categoria: "${name}"`)
  
  // Busca a maior posição atual
  const { data: maxPosData } = await supabase
    .from('categories')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  const maxPosition = maxPosData?.position || 0
  
  const { data: newCategory, error: createError } = await supabase
    .from('categories')
    .insert({
      name,
      position: maxPosition + 1
    })
    .select('id')
    .single()
  
  if (createError || !newCategory) {
    console.warn(`⚠️  Erro ao criar categoria "${name}": ${createError?.message}`)
    return null
  }
  
  console.log(`  ✅ Categoria criada: "${name}" -> ${newCategory.id}`)
  createdCategories.set(name, newCategory.id)
  return newCategory.id
}

async function getUnitId(name: string, createdUnits: Map<string, string>): Promise<string | null> {
  // Verifica se já foi criada nesta sessão
  if (createdUnits.has(name)) {
    return createdUnits.get(name)!
  }
  
  // Busca unidade por nome exato
  const { data, error } = await supabase
    .from('units')
    .select('id')
    .eq('name', name)
    .maybeSingle()
  
  if (!error && data) {
    createdUnits.set(name, data.id)
    return data.id
  }
  
  // Se não encontrou, cria a unidade
  console.log(`  ➕ Criando unidade: "${name}"`)
  
  // Define step padrão baseado no tipo de unidade
  let step = 1
  if (name === 'kg' || name === 'l') {
    step = 0.1
  }
  
  const { data: newUnit, error: createError } = await supabase
    .from('units')
    .insert({
      name,
      step
    })
    .select('id')
    .single()
  
  if (createError || !newUnit) {
    console.warn(`⚠️  Erro ao criar unidade "${name}": ${createError?.message}`)
    return null
  }
  
  console.log(`  ✅ Unidade criada: "${name}" -> ${newUnit.id}`)
  createdUnits.set(name, newUnit.id)
  return newUnit.id
}

async function importProducts() {
  const csvPath = path.join(process.cwd(), 'docs', 'produtos-importacao-massa (1).csv')
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Arquivo não encontrado: ${csvPath}`)
    process.exit(1)
  }
  
  console.log('📄 Lendo arquivo CSV...')
  const rows = parseCSV(csvPath)
  console.log(`✅ ${rows.length} produtos encontrados no CSV\n`)
  
  // Primeiro, vamos criar um mapa de categorias e unidades
  const categoryMap = new Map<string, string | null>()
  const unitMap = new Map<string, string | null>()
  
  // Buscar todas as categorias e unidades únicas
  const uniqueCategories = [...new Set(rows.map(r => r.category_id))]
  const uniqueUnits = [...new Set(rows.map(r => r.unit_id))]
  
  console.log('🔍 Mapeando categorias e unidades...')
  const createdCategories = new Map<string, string>()
  const createdUnits = new Map<string, string>()
  
  for (const categoryName of uniqueCategories) {
    const categoryId = await getCategoryId(categoryName, createdCategories)
    categoryMap.set(categoryName, categoryId)
  }
  
  for (const unitName of uniqueUnits) {
    const unitId = await getUnitId(unitName, createdUnits)
    unitMap.set(unitName, unitId)
  }
  
  console.log('\n📦 Preparando produtos para importação...\n')
  
  // Preparar dados para inserção
  const productsToInsert = []
  const errors: string[] = []
  
  for (const row of rows) {
    const categoryId = categoryMap.get(row.category_id)
    const unitId = unitMap.get(row.unit_id)
    
    // Validações
    if (!row.name || !row.name.trim()) {
      errors.push(`Produto sem nome: ${JSON.stringify(row)}`)
      continue
    }
    
    const price = parseFloat(row.price) || 0
    const cost = parseFloat(row.cost) || 0
    const quantity = parseFloat(row.quantity) || 0
    const isActive = row.is_active?.toLowerCase() === 'true'
    
    productsToInsert.push({
      name: row.name.trim(),
      category_id: categoryId || null,
      unit_id: unitId || null,
      price,
      cost,
      quantity,
      sku: row.sku?.trim() || null,
      image_url: row.image_url?.trim() || null,
      is_active: isActive,
    })
  }
  
  if (errors.length > 0) {
    console.log('⚠️  Erros encontrados:')
    errors.forEach(err => console.log(`  - ${err}`))
    console.log()
  }
  
  console.log(`🚀 Inserindo ${productsToInsert.length} produtos no Supabase...\n`)
  
  // Inserir em lotes de 100 para evitar problemas de tamanho
  const batchSize = 100
  let imported = 0
  let failed = 0
  
  for (let i = 0; i < productsToInsert.length; i += batchSize) {
    const batch = productsToInsert.slice(i, i + batchSize)
    
    const { data, error } = await supabase
      .from('products')
      .insert(batch)
      .select()
    
    if (error) {
      console.error(`❌ Erro ao importar lote ${Math.floor(i / batchSize) + 1}:`, error.message)
      failed += batch.length
    } else {
      imported += batch.length
      console.log(`✅ Lote ${Math.floor(i / batchSize) + 1}: ${batch.length} produtos importados`)
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log(`✅ Importação concluída!`)
  console.log(`   Importados: ${imported}`)
  console.log(`   Falhas: ${failed}`)
  console.log('='.repeat(50))
}

// Executar importação
importProducts()
  .then(() => {
    console.log('\n✨ Processo finalizado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  })

