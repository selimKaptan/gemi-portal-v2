"""
Atık ücretleri - GRT bazlı sabit + Garbage zorunlu
"""
from config.tariffs import WASTE_FIXED_EUR, GARBAGE_FIXED_EUR
from calculators.base import get_bracket_value


def calc_waste_fixed(grt: float) -> float:
    """Sabit atık ücreti (Euro) - GRT bracket"""
    return get_bracket_value(grt, WASTE_FIXED_EUR, "grt_max", "fee")


def calc_garbage(grt: float = 0, use_fixed: bool = True) -> float:
    """
    Garbage zorunlu ücret (Euro).
    Proforma örneğinde sabit 211 EUR. use_fixed=True ise sabit kullan.
    """
    if use_fixed:
        return GARBAGE_FIXED_EUR
    # Alternatif: waste fixed ile aynı bracket'tan marpol5 dahil m³'e göre hesaplanabilir
    row = get_bracket_value(grt, WASTE_FIXED_EUR, "grt_max", None)
    # Basitçe fixed fee'nin bir kısmı veya ayrı tablo
    return GARBAGE_FIXED_EUR


def _get_waste_included(grt: float) -> dict:
    """GRT'ye göre dahil atık m³"""
    for row in WASTE_FIXED_EUR:
        if grt <= row["grt_max"]:
            return {"marpol1": row["marpol1"], "marpol4": row["marpol4"], "marpol5": row["marpol5"]}
    return {"marpol1": 13, "marpol4": 15, "marpol5": 5}


def calc_waste_extra(
    marpol1_slop_m3: float,
    marpol1_bilge_m3: float,
    marpol4_m3: float,
    marpol5_m3: float,
    grt: float,
    is_weekend: bool = False,
) -> float:
    """
    Dahil m³'ü aşan atık için ek ücret (Euro/m³).
    """
    from config.tariffs import WASTE_EXTRA_EUR_M3_WEEKDAY, WASTE_EXTRA_EUR_M3_WEEKEND
    rates = WASTE_EXTRA_EUR_M3_WEEKEND if is_weekend else WASTE_EXTRA_EUR_M3_WEEKDAY
    included = _get_waste_included(grt)

    extra = 0.0
    extra += max(0, marpol1_slop_m3) * rates["marpol1_slop"]
    extra += max(0, marpol1_bilge_m3 - included["marpol1"]) * rates["marpol1_bilge"]
    extra += max(0, marpol4_m3 - included["marpol4"]) * rates["marpol4"]
    extra += max(0, marpol5_m3 - included["marpol5"]) * rates["marpol5"]

    return round(extra, 2)
