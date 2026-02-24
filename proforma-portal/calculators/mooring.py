"""
T.1.3 Palamar Hizmetleri (USD)
"""
from config.tariffs import MOORING_T13
from calculators.base import round_grt_up


def calc_mooring(
    grt: float,
    is_kabotaj: bool,
    palamar_x2: bool = False,
    overtime_pct: float = 0,
) -> float:
    """
    Palamar (mooring boat) ücreti (USD).
    Kabotaj gemileri vs diğer tüm gemiler.
    """
    vessel_key = "kabotaj" if is_kabotaj else "diger_tum"
    rates = MOORING_T13[vessel_key]
    rounded = round_grt_up(grt)

    if rounded <= 1000:
        fee = rates["base_0_1000"]
    else:
        fee = rates["base_0_1000"] + (rounded - 1000) / 1000 * rates["per_1000"]

    if palamar_x2:
        fee *= 2

    if overtime_pct > 0:
        fee *= (1 + overtime_pct / 100)

    return round(fee, 2)
