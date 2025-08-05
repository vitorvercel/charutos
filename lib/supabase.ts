import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para os produtos
export interface Produto {
  id: number
  nome: string
  descricao: string
  preco: number
  categoria: string
  marca: string
  origem: string
  imagem_url: string
  estoque: number
  ativo: boolean
  created_at: string
}

export interface Categoria {
  id: number
  nome: string
  descricao: string
  ativo: boolean
}
