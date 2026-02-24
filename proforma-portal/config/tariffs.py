"""
Proforma Portal - Tüm tarife tabloları (el yazısı tarife dokümanlarına göre)
"""

# ============== TARİFE 1: ACENTELİK HİZMETLERİ (Euro) - NRT bazlı ==============
# Her uğrama için baz ücret, 7 güne kadar
AGENCY_BASE_FEES = [
    {"nrt_max": 500, "fee_eur": 600},
    {"nrt_max": 1000, "fee_eur": 1000},
    {"nrt_max": 2000, "fee_eur": 1500},
    {"nrt_max": 3000, "fee_eur": 1850},
    {"nrt_max": 4000, "fee_eur": 2300},
    {"nrt_max": 5000, "fee_eur": 2750},
    {"nrt_max": 7500, "fee_eur": 3200},
    {"nrt_max": 10000, "fee_eur": 4000},
]
AGENCY_EXTRA_OVER_10K = [
    {"nrt_max": 20000, "per_1000_eur": 125},
    {"nrt_max": 30000, "per_1000_eur": 100},
    {"nrt_max": 999999, "per_1000_eur": 75},
]

# ============== TARİFE 2: KORUYUCU ACENTELİK (Euro) - NRT bazlı ==============
PROTECTIVE_AGENCY_BASE = [
    {"nrt_max": 500, "fee_eur": 300},
    {"nrt_max": 1000, "fee_eur": 500},
    {"nrt_max": 2000, "fee_eur": 750},
    {"nrt_max": 3000, "fee_eur": 925},
    {"nrt_max": 4000, "fee_eur": 1150},
    {"nrt_max": 5000, "fee_eur": 1375},
    {"nrt_max": 7500, "fee_eur": 1600},
    {"nrt_max": 10000, "fee_eur": 2000},
]
PROTECTIVE_AGENCY_EXTRA_OVER_10K = [
    {"nrt_max": 20000, "per_1000_eur": 63},
    {"nrt_max": 30000, "per_1000_eur": 50},
    {"nrt_max": 999999, "per_1000_eur": 38},
]

# ============== T.1.1 KILAVUZLUK HİZMETLERİ (USD/GRT) - Liman içi ==============
# Gemi tipi: kabotaj, yolcu_feribot, konteyner, diger_yuk
# GRT: 0-1000 için base, +1000 için per_1000
PILOTAGE_T11 = {
    "kabotaj": {"base_0_1000": 63, "per_1000": 23},
    "yolcu_feribot": {"base_0_1000": 105, "per_1000": 42},
    "konteyner": {"base_0_1000": 139, "per_1000": 59},
    "diger_yuk": {"base_0_1000": 179, "per_1000": 74},
}

# ============== T.1.2 RÖMÖRKÖR HİZMETLERİ (USD/GRT) ==============
# Değişiklik Set 1 kullanılıyor (ilk sütun)
TUGBOAT_T12 = {
    "kabotaj": {"base_0_1000": 70, "per_1000": 25},
    "yolcu_feribot": {"base_0_1000": 116, "per_1000": 46},
    "konteyner": {"base_0_1000": 153, "per_1000": 65},
    "diger_yuk": {"base_0_1000": 197, "per_1000": 82},
}

# ============== T.1.3 PALAMAR HİZMETLERİ (USD/GRT) ==============
MOORING_T13 = {
    "kabotaj": {"base_0_1000": 11.29, "per_1000": 6.16},
    "diger_tum": {"base_0_1000": 22.68, "per_1000": 11.29},
}

# ============== T.2 LİMAN DIŞI KILAVUZLUK (USD) ==============
# Hizmet tipi: 1000 GRT'ye kadar base + ilave beher 1000 GRT
PILOTAGE_T2_SERVICES = {
    "halic": {"base": 605, "per_1000": 136},
    "istanbul_canakkale_gecis": {"base": 550, "per_1000": 100},
    "ahirkani_gelibolu_marmara": {"base": 550, "per_1000": 100},
    "istanbul_ic_gecis": {"base": 457, "per_1000": 55},
    "buyukdere_pasabahce_demir": {"base": 550, "per_1000": 100},
    "canakkale_ic_demir": {"base": 282, "per_1000": 48},
    "izmir_demir": {"base": 124, "per_1000": 68},
}

# ============== GÜNLÜK BARINMA (USD) - GT bazlı ==============
# <=500 GT: 10 USD; diğer: ceil(GT/1000)*25
# 81k+ GT: ek 25 USD/1000
BERTHING_BASE_500 = 10
BERTHING_PER_1000_GT = 25
BERTHING_CAP_AT_81K = 2025  # 81000/1000 * 25

# ============== LÇB / HARBOUR MASTER DUES (TL - 2026) - NRT bazlı ==============
LCB_NRT_TL = [
    {"nrt_max": 500, "tl": 1283.90},
    {"nrt_max": 2000, "tl": 3424},
    {"nrt_max": 4000, "tl": 6848.10},
    {"nrt_max": 8000, "tl": 10272.20},
    {"nrt_max": 10000, "tl": 17120.20},
    {"nrt_max": 30000, "tl": 34240.90},
    {"nrt_max": 50000, "tl": 51361.40},
    {"nrt_max": 999999, "tl": 85602.30},
]

# MESAİ DIŞI LÇB (TL)
LCB_OVERTIME_TL = [
    {"nrt_max": 500, "tl": 251},
    {"nrt_max": 2000, "tl": 628},
    {"nrt_max": 4000, "tl": 1506},
    {"nrt_max": 8000, "tl": 2259},
    {"nrt_max": 10000, "tl": 3012},
    {"nrt_max": 30000, "tl": 6024},
    {"nrt_max": 50000, "tl": 9036},
    {"nrt_max": 999999, "tl": 15059},
]

# ============== SAHİL SAĞLIK (TL) - NRT * 21.67 ==============
SAHIL_SAGLIK_PER_NRT_TL = 21.67

# ============== LİMAN HİZMET ÜCRETİ (TL - 2026) - GT bazlı ==============
LIMAN_HIZMET_GT_TL = [
    {"gt_max": 500, "turk_tl": 500, "yabanci_tl": 1400},
    {"gt_max": 1500, "turk_tl": 1120, "yabanci_tl": 2800},
    {"gt_max": 2500, "turk_tl": 2050, "yabanci_tl": 4200},
    {"gt_max": 5000, "turk_tl": 2800, "yabanci_tl": 4900},
    {"gt_max": 10000, "turk_tl": 3400, "yabanci_tl": 5600},
    {"gt_max": 25000, "turk_tl": 4000, "yabanci_tl": 6300},
    {"gt_max": 35000, "turk_tl": 4500, "yabanci_tl": 7000},
    {"gt_max": 50000, "turk_tl": 5000, "yabanci_tl": 7500},
    {"gt_max": 999999, "turk_tl": 5300, "yabanci_tl": 8000},
]

# ============== İZMİR GÜMRÜK MESAİLERİ (TL) - Tonnage MT ==============
CUSTOMS_IMPORT_TL = [
    {"mt_max": 3000, "tl": 20100},
    {"mt_max": 6000, "tl": 26350},
    {"mt_max": 9000, "tl": 32700},
    {"mt_max": 12000, "tl": 38840},
    {"mt_max": 15000, "tl": 45305},
    {"mt_max": 18000, "tl": 51585},
    {"mt_max": 21000, "tl": 57935},
    {"mt_max": 25000, "tl": 62210},
    {"mt_max": 30000, "tl": 68525},
    {"mt_max": 35000, "tl": 77205},
    {"mt_max": 999999, "tl": 106105},
]

CUSTOMS_EXPORT_TL = [
    {"mt_max": 3000, "tl": 8615},
    {"mt_max": 6000, "tl": 11230},
    {"mt_max": 9000, "tl": 13750},
    {"mt_max": 12000, "tl": 16465},
    {"mt_max": 15000, "tl": 18505},
    {"mt_max": 18000, "tl": 21345},
    {"mt_max": 21000, "tl": 24915},
    {"mt_max": 25000, "tl": 28395},
    {"mt_max": 30000, "tl": 35830},
    {"mt_max": 35000, "tl": 42335},
    {"mt_max": 999999, "tl": 46770},
]

# ============== NAVLUN HASILAT ODA PAYI (USD) - Kargo tonajı MT ==============
CHAMBER_FREIGHT_USD = [
    {"mt_max": 20000, "usd": 580},
    {"mt_max": 40000, "usd": 870},
    {"mt_max": 60000, "usd": 1130},
    {"mt_max": 100000, "usd": 1400},
    {"mt_max": 999999, "usd": 1780},
]

# ============== DAMGA PULU (TL) ==============
STAMP_SUMMARY_TL = 119.40
STAMP_ORDINO_TL = 5.71
STAMP_PORT_REQUEST_TL = 274.42

# ============== DİĞER SABİTLER (TL/USD/EUR) ==============
IZMIR_YOLLUK_TL = 3865
IZMIR_MOTOR_USD = 225
ALIAGA_MUHAFAZA_TL = 4950
ALIAGA_MUHAFAZA_X2 = True
ALIAGA_YOLLUK_TL = 4250
TRANSIT_VISA_TL = 9376.40

# Oto servis: GRT x 0.01 USD
AUTO_SERVICE_PER_GRT_USD = 0.01

# ============== ATIK ÜCRETLERİ (Euro) - GRT bazlı sabit + dahil m³ ==============
WASTE_FIXED_EUR = [
    {"grt_max": 1000, "fee": 80, "marpol1": 1, "marpol4": 2, "marpol5": 1},
    {"grt_max": 5000, "fee": 140, "marpol1": 3, "marpol4": 2, "marpol5": 1},
    {"grt_max": 10000, "fee": 210, "marpol1": 4, "marpol4": 3, "marpol5": 2},
    {"grt_max": 15000, "fee": 250, "marpol1": 5, "marpol4": 4, "marpol5": 2},
    {"grt_max": 20000, "fee": 300, "marpol1": 6, "marpol4": 5, "marpol5": 2},
    {"grt_max": 25000, "fee": 350, "marpol1": 7, "marpol4": 5, "marpol5": 3},
    {"grt_max": 35000, "fee": 400, "marpol1": 8, "marpol4": 6, "marpol5": 3},
    {"grt_max": 60000, "fee": 540, "marpol1": 10, "marpol4": 10, "marpol5": 4},
    {"grt_max": 999999, "fee": 720, "marpol1": 13, "marpol4": 15, "marpol5": 5},
]

# Atık fazlası €/m³ - hafta içi
WASTE_EXTRA_EUR_M3_WEEKDAY = {
    "marpol1_slop": 1.5,
    "marpol1_bilge": 3.5,
    "marpol4": 1.5,
    "marpol5": 2.5,
}

# Hafta sonu / mesai dışı
WASTE_EXTRA_EUR_M3_WEEKEND = {
    "marpol1_slop": 1.875,
    "marpol1_bilge": 43.75,
    "marpol4": 18.75,
    "marpol5": 31.25,
}

# Garbage zorunlu - proforma örneğinde 249 USD (~211 EUR) - sabit veya GRT'ye göre
# Waste fixed fee'den veya özel hesaplamadan
GARBAGE_FIXED_EUR = 211  # Örnek proformadan

# ============== DEMİRLEME (USD) - GRT * rate * gün ==============
ANCHORAGE_TR_RATE = 0.002
ANCHORAGE_FOREIGN_RATE = 0.004

# ============== TARİFE 8 DİĞER HİZMETLER (Euro) ==============
SPARE_PARTS_PER_KG_EUR = 1.00
SPARE_PARTS_MIN_EUR = 150
SPARE_PARTS_MAX_EUR = 500
BUNKER_SUPERVISION_EUR = 250
PERSON_JOIN_LEAVE_1_2_EUR = 175
PERSON_JOIN_LEAVE_EXTRA_EUR = 50
MEDICAL_PER_PATIENT_EUR = 175
CAPTAIN_ADVANCE_PCT = 0.015
CAPTAIN_ADVANCE_MIN_EUR = 150

# Motorboat
MOTORBOAT_USD = 500
MOTORBOAT_IZMIR_USD = 225

# VOA
VOA_UNDER_5000_EUR = 20
VOA_OVER_5000_EUR = 40

# Supervision: (cargo_centy * 0.15) * goproz_kur - cargo ton, rate ~1.19 örnek proformaya göre
SUPERVISION_CENTY_RATE = 0.15
SUPERVISION_GOPROZ_RATE = 1.19

# Chamber of shipping fee - proforma 128 USD
CHAMBER_SHIPPING_FEE_USD = 128  # veya hesaplanan

# Maritime Association
MARITIME_ASSOC_EUR = 47  # ~40 EUR proformada

# Facilities, Transport, Fiscal, Communication - proforma sabitleri
FACILITIES_EUR = 466
TRANSPORTATION_EUR = 424
FISCAL_NOTARY_EUR = 212
COMMUNICATION_STAMP_EUR = 212

# Light dues - proforma 798 USD
LIGHT_DUES_USD = 798  # veya tarife
