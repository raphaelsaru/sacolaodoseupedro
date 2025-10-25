export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'staff'
export type OrderStatus = 'new' | 'picking' | 'out_for_delivery' | 'delivered' | 'canceled'
export type PaymentMethod = 'pix' | 'cash' | 'card_on_delivery' | 'other'
export type OrderChannel = 'whatsapp' | 'counter' | 'web'
export type InventoryMoveType = 'in' | 'out' | 'adjust'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          full_name?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      units: {
        Row: {
          id: string
          name: string
          step: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          step?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          step?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          category_id: string | null
          unit_id: string | null
          price: number
          sku: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category_id?: string | null
          unit_id?: string | null
          price?: number
          sku?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category_id?: string | null
          unit_id?: string | null
          price?: number
          sku?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      baskets: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      basket_items: {
        Row: {
          id: string
          basket_id: string
          product_id: string
          qty: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          basket_id: string
          product_id: string
          qty?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          basket_id?: string
          product_id?: string
          qty?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          full_name: string
          phone: string
          email: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone: string
          email?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          email?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          customer_id: string
          label: string | null
          street: string
          number: string | null
          complement: string | null
          neighborhood: string | null
          city: string
          state: string
          zip: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          label?: string | null
          street: string
          number?: string | null
          complement?: string | null
          neighborhood?: string | null
          city: string
          state: string
          zip?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          label?: string | null
          street?: string
          number?: string | null
          complement?: string | null
          neighborhood?: string | null
          city?: string
          state?: string
          zip?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string | null
          address_id: string | null
          status: OrderStatus
          subtotal: number
          discount: number
          total: number
          payment_method: PaymentMethod | null
          paid: boolean
          channel: OrderChannel
          notes: string | null
          placed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          address_id?: string | null
          status?: OrderStatus
          subtotal?: number
          discount?: number
          total?: number
          payment_method?: PaymentMethod | null
          paid?: boolean
          channel?: OrderChannel
          notes?: string | null
          placed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          address_id?: string | null
          status?: OrderStatus
          subtotal?: number
          discount?: number
          total?: number
          payment_method?: PaymentMethod | null
          paid?: boolean
          channel?: OrderChannel
          notes?: string | null
          placed_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          name: string
          unit_id: string | null
          qty: number
          unit_price: number
          total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          name: string
          unit_id?: string | null
          qty?: number
          unit_price?: number
          total?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          name?: string
          unit_id?: string | null
          qty?: number
          unit_price?: number
          total?: number
          created_at?: string
          updated_at?: string
        }
      }
      inventory_moves: {
        Row: {
          id: string
          product_id: string
          type: InventoryMoveType
          qty: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          type: InventoryMoveType
          qty?: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          type?: InventoryMoveType
          qty?: number
          note?: string | null
          created_at?: string
        }
      }
    }
  }
}

