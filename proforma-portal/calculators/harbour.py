"""
Liman hizmetleri: LÇB, Sahil Sağlık, Customs, Navlun, Ordino (TL -> USD dönüşümlü)
"""
from config.tariffs import (
    LCB_NRT_TL,
    LCB_OVERTIME_TL,
    SAHIL_SAGLIK_PER_NRT_TL,
    LIMAN_HIZMET_GT_TL,
    CUSTOMS_IMPORT_TL,
    CUSTOMS_EXPORT_TL,
    CHAMBER_FREIGHT_USD,
    STAMP_SUMMARY_TL,
    STAMP_ORDINO_TL,
    STAMP_PORT_REQUEST_TL,
    IZMIR_YOLLUK_TL,
    ALIAGA_MUHAFAZA_TL,
    ALIAGA_MUHAFAZA_X2,
    ALIAGA_YOLLUK_TL,
    TRANSIT_VISA_TL,
    AUTO_SERVICE_PER_GRT_USD,
)
from calculators.base import get_bracket_value
from utils.exchange import tl_to_usd


def calc_lcb(nrt: float, usd_tl_rate: float, overtime: bool = False) -> float:
    """LÇB / Harbour Master dues (TL -> USD)"""
    brackets = LCB_OVERTIME_TL if overtime else LCB_NRT_TL
    tl = get_bracket_value(nrt, brackets, "nrt_max", "tl")
    return round(tl_to_usd(tl, usd_tl_rate), 2)


def calc_sahil_saglik(nrt: float, usd_tl_rate: float) -> float:
    """Sahil Sağlık: NRT * 21.67 TL"""
    tl = nrt * SAHIL_SAGLIK_PER_NRT_TL
    return round(tl_to_usd(tl, usd_tl_rate), 2)


def calc_liman_hizmet(gt: float, is_turk_flag: bool, usd_tl_rate: float) -> float:
    """Liman hizmet ücreti (TL -> USD)"""
    for row in LIMAN_HIZMET_GT_TL:
        if gt <= row["gt_max"]:
            tl = row["turk_tl"] if is_turk_flag else row["yabanci_tl"]
            return round(tl_to_usd(tl, usd_tl_rate), 2)
    row = LIMAN_HIZMET_GT_TL[-1]
    tl = row["turk_tl"] if is_turk_flag else row["yabanci_tl"]
    return round(tl_to_usd(tl, usd_tl_rate), 2)


def calc_customs_overtime(
    cargo_mt: float,
    is_import: bool,
    usd_tl_rate: float,
) -> float:
    """Gümrük mesai ücreti (TL -> USD) - İzmir tarifesi"""
    brackets = CUSTOMS_IMPORT_TL if is_import else CUSTOMS_EXPORT_TL
    tl = get_bracket_value(cargo_mt, brackets, "mt_max", "tl")
    return round(tl_to_usd(tl, usd_tl_rate), 2)


def calc_chamber_freight(cargo_mt: float, is_turk_flag: bool) -> float:
    """Navlun hasılat oda payı (USD) - Türk bayraklıda yok"""
    if is_turk_flag:
        return 0.0
    return get_bracket_value(cargo_mt, CHAMBER_FREIGHT_USD, "mt_max", "usd")


def calc_ordino(lcb_usd: float) -> float:
    """Ordino: LÇB ücretinin yarısı (USD)"""
    return round(lcb_usd / 2, 2)


def calc_auto_service(grt: float) -> float:
    """Oto servis: GRT x 0.01 USD"""
    return round(grt * AUTO_SERVICE_PER_GRT_USD, 2)


def calc_stamp_duties(usd_tl_rate: float):
    """Damga pulu kalemleri (TL -> USD)"""
    return {
        "ozet_beyan": round(tl_to_usd(STAMP_SUMMARY_TL, usd_tl_rate), 2),
        "ordino": round(tl_to_usd(STAMP_ORDINO_TL, usd_tl_rate), 2),
        "liman_talepname": round(tl_to_usd(STAMP_PORT_REQUEST_TL, usd_tl_rate), 2),
    }


def calc_izmir_yolluk(usd_tl_rate: float) -> float:
    """İzmir yolluk"""
    return round(tl_to_usd(IZMIR_YOLLUK_TL, usd_tl_rate), 2)


def calc_aliaga_guards(usd_tl_rate: float) -> tuple[float, float]:
    """Aliaga muhafaza + yolluk. muhafaza X2 ise 2x"""
    muhafaza = ALIAGA_MUHAFAZA_TL * (2 if ALIAGA_MUHAFAZA_X2 else 1)
    return (
        round(tl_to_usd(muhafaza, usd_tl_rate), 2),
        round(tl_to_usd(ALIAGA_YOLLUK_TL, usd_tl_rate), 2),
    )


def calc_transit_visa(usd_tl_rate: float) -> float:
    """Transit gemicisi vize harcı"""
    return round(tl_to_usd(TRANSIT_VISA_TL, usd_tl_rate), 2)
