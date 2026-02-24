"""
Tarife 8 + Diğer sabit/masraflar: Motorboat, Supervision, Facilities, vb.
"""
from config.tariffs import (
    MOTORBOAT_USD,
    MOTORBOAT_IZMIR_USD,
    CHAMBER_SHIPPING_FEE_USD,
    MARITIME_ASSOC_EUR,
    FACILITIES_EUR,
    TRANSPORTATION_EUR,
    FISCAL_NOTARY_EUR,
    COMMUNICATION_STAMP_EUR,
    LIGHT_DUES_USD,
    SUPERVISION_CENTY_RATE,
    SUPERVISION_GOPROZ_RATE,
    VOA_UNDER_5000_EUR,
    VOA_OVER_5000_EUR,
)


def calc_motorboat(port: str) -> float:
    """Motorboat exp. - İzmir 225 USD, diğer 500 USD"""
    if port.upper() == "IZMIR":
        return MOTORBOAT_IZMIR_USD
    return MOTORBOAT_USD


def calc_supervision(
    cargo_mt: float,
    goproz_rate=None,
    is_domestic: bool = False,
) -> float:
    """
    Supervision fee: (cargo_mt * 0.15) * goproz_kur (USD cinsinden).
    Dahili gemilerden alınmıyor. goproz_rate None ise varsayılan kullanılır.
    """
    if is_domestic:
        return 0.0
    rate = goproz_rate if goproz_rate is not None else SUPERVISION_GOPROZ_RATE
    return round((cargo_mt * SUPERVISION_CENTY_RATE) * rate, 2)


def calc_chamber_shipping_fee() -> float:
    """Chamber of shipping fee"""
    return CHAMBER_SHIPPING_FEE_USD


def calc_maritime_assoc() -> float:
    """Maritime Association contribution"""
    return MARITIME_ASSOC_EUR


def calc_facilities() -> float:
    """Facilities & Other exp."""
    return FACILITIES_EUR


def calc_transportation() -> float:
    """Transportation exp."""
    return TRANSPORTATION_EUR


def calc_fiscal_notary() -> float:
    """Fiscal & Notary exp."""
    return FISCAL_NOTARY_EUR


def calc_communication_stamp() -> float:
    """Communication & Copy & Stamp exp."""
    return COMMUNICATION_STAMP_EUR


def calc_light_dues() -> float:
    """Light dues"""
    return LIGHT_DUES_USD


def calc_voa(value_or_qty: float) -> float:
    """VOA: <=5000 ise 20 EUR, >5000 ise 40 EUR"""
    return VOA_UNDER_5000_EUR if value_or_qty <= 5000 else VOA_OVER_5000_EUR
