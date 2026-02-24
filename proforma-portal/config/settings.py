"""
Proforma Portal - Port ve genel ayarlar
Port bazlı farklar: İzmir, Tekirdağ, Aliaga, Mersin
"""

PORTS = ["TEKIRDAG", "IZMIR", "ALIAGA", "MERSIN"]

VESSEL_TYPES = [
    "kabotaj",
    "yolcu_feribot",
    "konteyner",
    "diger_yuk",
    "diger_tum",
]

# CEYPORT gibi özel liman giriş/çıkış sabit ücretleri (port bazlı - USD)
PORT_IN_OUT_FEES = {
    "TEKIRDAG": 1005,  # CEYPORT in/out
    "IZMIR": 0,
    "ALIAGA": 0,
    "MERSIN": 0,
}

# Port bazlı özel kalemler: hangi portta hangi ek ücretler uygulanır
PORT_SPECIFIC = {
    "TEKIRDAG": {
        "vts_fee": 0,  # Tekirdağ'da VTS ücreti yok
        "ceyport_in_out": True,
    },
    "IZMIR": {
        "yolluk": True,   # İzmir yolluk
        "motor_usd": 225,  # İzmir motor servisi (customs overtime)
        "vts_fee": 0,
    },
    "ALIAGA": {
        "muhafaza": True,  # Aliaga muhafaza mesai (X2)
        "yolluk": True,    # Aliaga yolluk
    },
    "MERSIN": {},
}
