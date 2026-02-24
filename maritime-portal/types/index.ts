export type { Database, UserRole, DemandStatus, PriorityLevel, PdaStatus, PDA, PDAWithArmator, PdaItem, OfferStatus, Offer, OfferWithAgency, Review, Nomination, NominationWithDetails, Json } from './database'
export type { Database as DB } from './database'

import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Ship = Database['public']['Tables']['ships']['Row']
export type ShipInsert = Database['public']['Tables']['ships']['Insert']
export type ShipUpdate = Database['public']['Tables']['ships']['Update']

export type Demand = Database['public']['Tables']['demands']['Row']
export type DemandInsert = Database['public']['Tables']['demands']['Insert']
export type DemandUpdate = Database['public']['Tables']['demands']['Update']

export type DemandWithShip = Demand & {
  ships: Pick<Ship, 'id' | 'name' | 'imo_no' | 'bayrak'>
}
