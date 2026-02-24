export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'armator' | 'agency' | 'admin'
export type DemandStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'expired'
export type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent'
export type PdaStatus = 'pending' | 'reviewing' | 'returned' | 'approved'
export type OfferStatus = 'pending' | 'accepted' | 'rejected'

export type Offer = {
  id: string
  demand_id: string
  agency_id: string
  price: number | null
  currency: string
  notes: string | null
  file_url: string | null
  file_name: string | null
  file_size: number | null
  status: OfferStatus
  created_at: string
  updated_at: string
}

export type OfferWithAgency = Offer & {
  profiles: {
    full_name: string
    company_name: string | null
  } | null
  avg_rating?: number | null
}

export type PDA = {
  id: string
  armator_id: string
  ship_id: string | null
  title: string
  description: string | null
  file_url: string | null
  file_name: string | null
  file_size: number | null
  status: PdaStatus
  armator_notes: string | null
  admin_notes: string | null
  target_price: number | null
  target_currency: string | null
  created_at: string
  updated_at: string
}

export type PDAWithArmator = PDA & {
  profiles: {
    full_name: string
    company_name: string | null
  } | null
  ships: {
    name: string
    imo_no: string
  } | null
}

export type PdaItem = {
  id: string
  pda_id: string
  description: string
  amount: number | null
  currency: string
  note: string | null
  created_at: string
}

export type Review = {
  id: string
  demand_id: string
  armator_id: string
  agency_id: string
  rating: number
  comment: string | null
  created_at: string
}

export type Nomination = {
  id: string
  offer_id: string
  demand_id: string
  armator_id: string
  agency_id: string
  vessel_name: string | null
  vessel_imo: string | null
  port: string | null
  eta: string | null
  etd: string | null
  cargo_type: string | null
  cargo_amount: number | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  message: string | null
  is_read: boolean
  created_at: string
}

export type NominationWithDetails = Nomination & {
  demands: { port: string; details: string } | null
  profiles_armator: { full_name: string; company_name: string | null } | null
  ships: { name: string; imo_no: string } | null
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string
          phone: string | null
          company_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name: string
          phone?: string | null
          company_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          full_name?: string
          phone?: string | null
          company_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ships: {
        Row: {
          id: string
          name: string
          imo_no: string
          bayrak: string
          grt: number
          nrt: number
          dwt: number | null
          yil: number | null
          gemi_tipi: string | null
          armator_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          imo_no: string
          bayrak: string
          grt: number
          nrt: number
          dwt?: number | null
          yil?: number | null
          gemi_tipi?: string | null
          armator_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          imo_no?: string
          bayrak?: string
          grt?: number
          nrt?: number
          dwt?: number | null
          yil?: number | null
          gemi_tipi?: string | null
          armator_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ships_armator_id_fkey'
            columns: ['armator_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      demands: {
        Row: {
          id: string
          ship_id: string
          agency_id: string | null
          status: DemandStatus
          details: string
          port: string
          estimated_arrival: string | null
          estimated_departure: string | null
          cargo_type: string | null
          cargo_amount: number | null
          priority: PriorityLevel
          notes: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ship_id: string
          agency_id?: string | null
          status?: DemandStatus
          details: string
          port: string
          estimated_arrival?: string | null
          estimated_departure?: string | null
          cargo_type?: string | null
          cargo_amount?: number | null
          priority?: PriorityLevel
          notes?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ship_id?: string
          agency_id?: string | null
          status?: DemandStatus
          details?: string
          port?: string
          estimated_arrival?: string | null
          estimated_departure?: string | null
          cargo_type?: string | null
          cargo_amount?: number | null
          priority?: PriorityLevel
          notes?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'demands_ship_id_fkey'
            columns: ['ship_id']
            isOneToOne: false
            referencedRelation: 'ships'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'demands_agency_id_fkey'
            columns: ['agency_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      demand_status: DemandStatus
      priority_level: PriorityLevel
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
