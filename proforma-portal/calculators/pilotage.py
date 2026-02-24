"""
T.1.1 Liman içi kılavuzluk + T.2 Liman dışı kılavuzluk (USD)
"""
from config.tariffs import PILOTAGE_T11, PILOTAGE_T2_SERVICES
from calculators.base import round_grt_up, grt_bracket_0_1000


def calc_pilotage_t11(
    grt: float,
    vessel_type: str,
    tanker_surcharge_pct: float = 0,
) -> float:
    """
    T.1.1 Liman içi kılavuzluk (USD).
    vessel_type: kabotaj, yolcu_feribot, konteyner, diger_yuk
    """
    if vessel_type not in PILOTAGE_T11:
        vessel_type = "diger_yuk"

    rates = PILOTAGE_T11[vessel_type]
    rounded = round_grt_up(grt)

    if rounded <= 1000:
        fee = rates["base_0_1000"]
    else:
        fee = rates["base_0_1000"] + (rounded - 1000) / 1000 * rates["per_1000"]

    if tanker_surcharge_pct > 0:
        fee *= (1 + tanker_surcharge_pct / 100)

    return round(fee, 2)


def calc_pilotage_t2(
    grt: float,
    service_key: str,
    tanker_surcharge_pct: float = 0,
) -> float:
    """
    T.2 Liman dışı kılavuzluk (USD).
    service_key: halic, istanbul_canakkale_gecis, izmir_demir vb.
    """
    if service_key not in PILOTAGE_T2_SERVICES:
        return 0.0

    rates = PILOTAGE_T2_SERVICES[service_key]
    _, extra_1000s = grt_bracket_0_1000(grt)

    fee = rates["base"] + extra_1000s * rates["per_1000"]

    if tanker_surcharge_pct > 0:
        fee *= (1 + tanker_surcharge_pct / 100)

    return round(fee, 2)


def calc_port_pilotage(
    grt: float,
    vessel_type: str,
    port: str,
    tanker_surcharge_pct: float = 0,
) -> float:
    """
    Porta göre uygun kılavuzluk hesabı.
    Tekirdağ/İzmir için T.1.1 + gerekiyorsa T.2 (izmir_demir vb.)
    """
    fee = calc_pilotage_t11(grt, vessel_type, tanker_surcharge_pct)

    # Port özel: İzmir demirleme eklenebilir
    if port.upper() == "IZMIR":
        fee += calc_pilotage_t2(grt, "izmir_demir", tanker_surcharge_pct)

    return round(fee, 2)
