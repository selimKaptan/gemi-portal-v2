"""
Ortak hesaplama yardımcıları: GRT yuvarlama, bracket lookup
"""
import math
from typing import Any


def round_grt_up(grt: float) -> int:
    """
    GRT'yi 1000'e yukarı yuvarla (hep yüksek).
    ceil(GRT/1000) * 1000
    """
    if grt <= 0:
        return 0
    return int(math.ceil(grt / 1000) * 1000)


def round_gt_up(gt: float) -> int:
    """GT için aynı kural"""
    return round_grt_up(gt)


def get_bracket_value(value: float, brackets, key_max: str, key_value: str) -> Any:
    """
    Değeri bracket tablosunda bul (value <= nrt_max olan ilk satır).
    Örn: get_bracket_value(2196, AGENCY_BASE_FEES, "nrt_max", "fee_eur")
    """
    for row in brackets:
        if value <= row[key_max]:
            return row[key_value]
    return brackets[-1][key_value] if brackets else 0


def grt_bracket_0_1000(grt: float) -> tuple[float, float]:
    """
    GRT için 0-1000 ve +1000 hesabı.
    base: 0-1000 GRT için ücret
    extra: (rounded_grt - 1000) / 1000 * per_1000
    """
    rounded = round_grt_up(grt)
    if rounded <= 1000:
        return 0, 0  # base uygulanacak, extra yok
    extra_1000s = (rounded - 1000) / 1000
    return 1, extra_1000s  # base uygulanacak, extra_1000s * per_1000
