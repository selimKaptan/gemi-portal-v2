import { redirect } from 'next/navigation'
import { getUser, getUserProfile, createClient } from '@/lib/supabase/server'
import { serialize } from '@/lib/utils'
import DemandsClient from './DemandsClient'
import type { DemandWithShip, Ship } from '@/types'

// İ/ı Ş/ş Ğ/ğ Ü/ü Ö/ö Ç/ç gibi Türkçe karakterleri normalize ederek karşılaştırma yapar
function normalizeTR(str: string): string {
  return str
    .replace(/İ/g, 'I').replace(/ı/g, 'i')
    .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
    .replace(/Ş/g, 'S').replace(/ş/g, 's')
    .replace(/Ö/g, 'O').replace(/ö/g, 'o')
    .replace(/Ü/g, 'U').replace(/ü/g, 'u')
    .replace(/Ç/g, 'C').replace(/ç/g, 'c')
    .toUpperCase()
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DemandsPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>
}) {
  const params = await searchParams
  const openDemandId = params.open
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const profile = await getUserProfile(user.id)
  if (!profile) redirect('/auth/login')

  const supabase = await createClient()

  // Süresi dolmuş talepleri otomatik kapat
  await (supabase as any).rpc('expire_demands')

  let demands: DemandWithShip[] = []
  let ships: Ship[] = []
  let agencyHasPorts = true // armator/admin için önemsiz

  if (profile.role === 'armator') {
    const { data: userShips } = await supabase
      .from('ships')
      .select('*')
      .eq('armator_id', user.id)
      .order('name')

    ships = (userShips ?? []) as Ship[]

    if (ships.length > 0) {
      const shipIds = ships.map(s => s.id)
      const { data } = await supabase
        .from('demands')
        .select('*, ships(id, name, imo_no, bayrak)')
        .in('ship_id', shipIds)
        .order('created_at', { ascending: false })
      demands = (data ?? []) as DemandWithShip[]
    }
  } else if (profile.role === 'agency') {
    // Acentenin hizmet verdiği limanları getir
    const { data: portRows } = await supabase
      .from('agency_ports')
      .select('port_name')
      .eq('agency_id', user.id)

    const agencyPorts = ((portRows ?? []) as { port_name: string }[]).map(r => r.port_name)
    agencyHasPorts = agencyPorts.length > 0

    const activeStatuses = ['pending', 'reviewing', 'approved']

    // Tüm aktif talepleri çek, port filtresi JS tarafında uygula
    const { data: allActive } = await supabase
      .from('demands')
      .select('*, ships(id, name, imo_no, bayrak)')
      .in('status', activeStatuses)
      .order('created_at', { ascending: false })

    const allActiveDemands = (allActive ?? []) as DemandWithShip[]

    if (agencyPorts.length > 0) {
      // Türkçe karakter normalize edilmiş port karşılaştırması
      const normalizedAgencyPorts = agencyPorts.map(p => normalizeTR(p))
      demands = allActiveDemands.filter(dem =>
        normalizedAgencyPorts.some(p => normalizeTR(dem.port).includes(p))
      )
    } else {
      // Port kaydı yoksa tüm aktif talepleri göster (sarı uyarı çıkacak)
      demands = allActiveDemands
    }
  } else {
    const { data } = await supabase
      .from('demands')
      .select('*, ships(id, name, imo_no, bayrak)')
      .order('created_at', { ascending: false })
    demands = (data ?? []) as DemandWithShip[]
  }

  // openDemandId varsa o talebi her zaman listeye ekle (port filtresi devre dışı)
  if (openDemandId && !demands.find(d => d.id === openDemandId)) {
    const { data: specificDemand } = await supabase
      .from('demands')
      .select('*, ships(id, name, imo_no, bayrak)')
      .eq('id', openDemandId)
      .single()
    if (specificDemand) {
      demands = [specificDemand as DemandWithShip, ...demands]
    }
  }

  return (
    <DemandsClient
      initialDemands={serialize(demands)}
      ships={serialize(ships)}
      userId={user.id}
      role={profile.role}
      agencyHasPorts={agencyHasPorts}
      openDemandId={openDemandId}
    />
  )
}
