"""
USD / EUR / TL kur dönüşümü
"""


def usd_to_eur(usd: float, rate: float) -> float:
    """USD'den EUR'ya (1 USD = rate EUR)"""
    if rate <= 0:
        return 0.0
    return round(usd / rate, 2)


def eur_to_usd(eur: float, rate: float) -> float:
    """EUR'dan USD'ye"""
    if rate <= 0:
        return 0.0
    return round(eur * rate, 2)


def usd_to_tl(usd: float, usd_tl_rate: float) -> float:
    """USD'den TL'ye"""
    if usd_tl_rate <= 0:
        return 0.0
    return round(usd * usd_tl_rate, 2)


def tl_to_usd(tl: float, usd_tl_rate: float) -> float:
    """TL'den USD'ye"""
    if usd_tl_rate <= 0:
        return 0.0
    return round(tl / usd_tl_rate, 2)


def convert_line_usd_eur(usd: float, usd_eur_rate: float) -> tuple[float, float]:
    """Bir kalem için USD ve EUR değerlerini döndür (usd giriş)"""
    eur = usd_to_eur(usd, usd_eur_rate)
    return round(usd, 2), eur
