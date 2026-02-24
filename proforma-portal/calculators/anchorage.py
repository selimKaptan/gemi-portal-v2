"""
Demirleme ücretleri - GRT * rate * gün (USD)
"""
from config.tariffs import ANCHORAGE_TR_RATE, ANCHORAGE_FOREIGN_RATE


def calc_anchorage(grt: float, days: int, is_turk_flag: bool) -> float:
    """
    Demirleme ücreti (USD).
    Türk: GRT * 0.002 * gün
    Yabancı: GRT * 0.004 * gün
    """
    rate = ANCHORAGE_TR_RATE if is_turk_flag else ANCHORAGE_FOREIGN_RATE
    return round(grt * rate * days, 2)
