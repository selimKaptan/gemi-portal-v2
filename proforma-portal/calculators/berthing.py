"""
Günlük barınma / Wharfage / Quay dues (USD)
"""
import math
from config.tariffs import BERTHING_BASE_500, BERTHING_PER_1000_GT


def calc_berthing(
    gt: float,
    days: int,
    is_turk_flag: bool = False,
    is_cabotage: bool = False,
) -> float:
    """
    Günlük barınma ücreti (USD).
    - <=500 GT: 10 USD/gün
    - Diğer: ceil(GT/1000)*25 USD/gün
    - 81k+ GT: 81k hesabı + her ek 1000 GT için +25 USD
    - Kabotaj: %50 indirim
    - Türk bayraklı uluslararası: %25 indirim
    """
    if gt <= 500:
        daily = BERTHING_BASE_500
    else:
        rounded = math.ceil(gt / 1000) * 1000
        if rounded <= 81000:
            daily = (rounded / 1000) * BERTHING_PER_1000_GT
        else:
            # 81k hesabı + ek
            base_81k = 81 * BERTHING_PER_1000_GT
            extra_1000s = (rounded - 81000) / 1000
            daily = base_81k + extra_1000s * BERTHING_PER_1000_GT

    total = daily * days

    if is_cabotage:
        total *= 0.50
    elif is_turk_flag:
        total *= 0.75

    return round(total, 2)
