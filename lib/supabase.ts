import { createClient } from "@supabase/supabase-js"

// Credenciais do Supabase
const supabaseUrl = "https://ibuqurovkcwazrektnwn.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlidXF1cm92a2N3YXpyZWt0bnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzgxOTMsImV4cCI6MjA2OTkxNDE5M30.sa9CbbvawLw6Pkz3q598IhzeaWZ_8a29uy2O6jTbU6I"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para os charutos
export interface Cigar {
  id: string
  name: string
  brand: string
  origin: string
  size: string
  wrapper: string
  strength: number
  price: number
  quantity: number
  purchase_date: string
  notes?: string
  user_id: string
  created_at: string
  updated_at: string
}

// Tipos para as sessões de degustação
export interface TastingSession {
  id: string
  cigar_id: string
  cigar_name: string
  date: string
  duration: number
  rating: number
  notes?: string
  flavors: string[]
  burn_quality: number
  draw_quality: number
  ash_quality: number
  user_id: string
  created_at: string
  updated_at: string
}

// Funções para gerenciar charutos
export const cigarService = {
  // Buscar todos os charutos do usuário
  async getCigars(userId: string) {
    const { data, error } = await supabase
      .from("cigars")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  // Adicionar novo charuto
  async addCigar(cigar: Omit<Cigar, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("cigars").insert([cigar]).select()

    if (error) throw error
    return data[0]
  },

  // Atualizar charuto
  async updateCigar(id: string, updates: Partial<Cigar>) {
    const { data, error } = await supabase
      .from("cigars")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()

    if (error) throw error
    return data[0]
  },

  // Deletar charuto
  async deleteCigar(id: string) {
    const { error } = await supabase.from("cigars").delete().eq("id", id)

    if (error) throw error
  },
}

// Funções para gerenciar sessões de degustação
export const tastingService = {
  // Buscar todas as sessões do usuário
  async getTastingSessions(userId: string) {
    const { data, error } = await supabase
      .from("tasting_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (error) throw error
    return data
  },

  // Adicionar nova sessão
  async addTastingSession(session: Omit<TastingSession, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("tasting_sessions").insert([session]).select()

    if (error) throw error
    return data[0]
  },

  // Atualizar sessão
  async updateTastingSession(id: string, updates: Partial<TastingSession>) {
    const { data, error } = await supabase
      .from("tasting_sessions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()

    if (error) throw error
    return data[0]
  },

  // Deletar sessão
  async deleteTastingSession(id: string) {
    const { error } = await supabase.from("tasting_sessions").delete().eq("id", id)

    if (error) throw error
  },
}

// Funções de autenticação
export const authService = {
  // Login com email e senha
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  // Registro de novo usuário
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) throw error
    return data
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Obter usuário atual
  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  },

  // Obter sessão atual
  async getCurrentSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  },
}
