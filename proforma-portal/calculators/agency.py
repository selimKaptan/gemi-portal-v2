"""
Tarife 1: Acentelik Hizmetleri - NRT bazlı Euro
"""
from config.tariffs import (
    AGENCY_BASE_FEES,
    AGENCY_EXTRA_OVER_10K,
)
from calculators.base import get_bracket_value


def calc_agency_fee(
    nrt: float,
    berth_days: int = 7,
    special_services: bool = False,
    passenger_discount_pct: float = 0,
    container_discount_pct: float = 0,
) -> float:
    """
    Acentelik ücreti (Euro).
    - 7 güne kadar baz ücret
    - 7 günden fazla: her 5 gün +%20
    - Özel hizmet: +%30
    - Yolcu indirimi: max %40
    - Konteyner düzenli hat: %50
    """
    # Baz ücret
    base = get_bracket_value(nrt, AGENCY_BASE_FEES, "nrt_max", "fee_eur")

    # 10000 üstü ek ücret
    if nrt > 10000:
        extra_bracket = get_bracket_value(nrt, AGENCY_EXTRA_OVER_10K, "nrt_max", "per_1000_eur")
        from math import ceil
        extra_1000s = ceil((nrt - 10000) / 1000)
        base += extra_1000s * extra_bracket

    # 7 günden fazla: her 5 gün +%20
    if berth_days > 7:
        extra_periods = (berth_days - 7) / 5
        from math import ceil
        base += base * 0.20 * ceil(extra_periods)

    # Özel hizmet +%30
    if special_services:
        base *= 1.30

    # İndirimler
    discount = max(passenger_discount_pct, container_discount_pct)  # En yüksek tek uygulanır
    base *= (1 - discount / 100)

    return round(base, 2)
