"""
T.1.2 Römorkör Hizmetleri (USD)
"""
from config.tariffs import TUGBOAT_T12
from calculators.base import round_grt_up


def calc_tugboat(
    grt: float,
    vessel_type: str,
    four_tugs_surcharge: bool = False,
    overtime_pct: float = 0,
) -> float:
    """
    Römorkör ücreti (USD).
    vessel_type: kabotaj, yolcu_feribot, konteyner, diger_yuk
    5000+ GRT ve 4 römorkör: +%30
    Hafta sonu/özel gün: +%50 (overtime_pct=50)
    """
    if vessel_type not in TUGBOAT_T12:
        vessel_type = "diger_yuk"

    rates = TUGBOAT_T12[vessel_type]
    rounded = round_grt_up(grt)

    if rounded <= 1000:
        fee = rates["base_0_1000"]
    else:
        fee = rates["base_0_1000"] + (rounded - 1000) / 1000 * rates["per_1000"]

    if four_tugs_surcharge and rounded >= 5000:
        fee *= 1.30

    if overtime_pct > 0:
        fee *= (1 + overtime_pct / 100)

    return round(fee, 2)
