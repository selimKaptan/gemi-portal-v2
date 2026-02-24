"""
Proforma Oluştur - Form ve hesaplama
"""
import streamlit as st
from auth.session import init_session, is_logged_in, get_user, logout
from config.settings import PORTS, PORT_IN_OUT_FEES, PORT_SPECIFIC
from config.tariffs import MARITIME_ASSOC_EUR
from calculators import agency, pilotage, tugboat, mooring, berthing, harbour, waste, other, anchorage
from utils.exchange import usd_to_eur

init_session()
if not is_logged_in():
    st.warning("Proforma oluşturmak için giriş yapmalısınız.")
    st.stop()

st.set_page_config(page_title="Proforma Oluştur", page_icon="📋", layout="wide")

# Sidebar: kullanıcı bilgisi ve çıkış
with st.sidebar:
    user = get_user()
    if user:
        st.success(f"Hoş geldiniz, {user['full_name']}")
        if st.button("Çıkış Yap"):
            logout()
            st.rerun()

st.title("Proforma Oluştur")

VESSEL_TYPE_OPTIONS = {
    "kabotaj": "Kabotaj Hattında Çalışan",
    "yolcu_feribot": "Yolcu / Feribot / Ro-Ro",
    "konteyner": "Konteyner",
    "diger_yuk": "Diğer Yük Gemisi",
    "diger_tum": "Diğer Tüm Gemiler",
}

with st.form("proforma_form"):
    st.subheader("Gemi Bilgileri")
    col1, col2 = st.columns(2)
    with col1:
        vessel_name = st.text_input("Gemi Adı", value="MV SEA SPRINTER")
        nrt = st.number_input("NRT", min_value=1, value=2196)
        grt = st.number_input("GRT", min_value=1, value=5197)
        gt = st.number_input("GT (Gross Tonnage)", min_value=1, value=5197, help="Barınma için")
        flag = st.selectbox("Bayrak", ["Yabancı", "Türkiye"])
    with col2:
        port = st.selectbox("Liman", PORTS)
        purpose = st.selectbox("Uğrama Nedeni", ["Loading", "Discharging"])
        vessel_type = st.selectbox(
            "Gemi Tipi",
            list(VESSEL_TYPE_OPTIONS.keys()),
            format_func=lambda k: VESSEL_TYPE_OPTIONS[k],
        )
        kind_of_cargo = st.text_input("Yük Türü", value="SFS PELLETS")
        cargo_mt = st.number_input("Yük Miktarı (MT)", min_value=0, value=5520)
        berth_days = st.number_input("Rıhtımda Kalış (gün)", min_value=1, value=7)
        anchorage_days = st.number_input("Demirde Kalış (gün)", min_value=0, value=10, help="Demirleme ücreti için")

    st.subheader("Kurlar ve Seçenekler")
    col3, col4 = st.columns(2)
    with col3:
        usd_eur_rate = st.number_input("1 USD = ? EUR", value=1.1801, format="%.4f")
        usd_tl_rate = st.number_input("1 USD = ? TL", value=34.50, format="%.2f")
    with col4:
        overtime = st.checkbox("%50 Mesai (Hafta sonu / Bayram)", value=False)
        tanker = st.checkbox("Tanker Zammı (%0.30)", value=False)
        four_tugs = st.checkbox("4 Römorkör (5000+ GRT)", value=False)

    submitted = st.form_submit_button("Hesapla")

if submitted:
    overtime_pct = 50 if overtime else 0
    tanker_pct = 0.30 if tanker else 0
    is_turk = flag == "Türkiye"
    is_kabotaj = vessel_type == "kabotaj"
    is_import = purpose == "Discharging"
    is_domestic = is_turk and is_kabotaj  # Supervision dahili gemilerden alınmıyor

    lines = []

    # CEYPORT port in/out (Tekirdağ)
    port_in_out = PORT_IN_OUT_FEES.get(port, 0)
    if port_in_out > 0:
        eur = usd_to_eur(port_in_out, usd_eur_rate)
        lines.append(("CEYPORT port in Turkey in/out exp. (estimated)", port_in_out, eur))

    # Pilotage
    pilot_usd = pilotage.calc_port_pilotage(grt, vessel_type, port, tanker_pct)
    if overtime_pct:
        pilot_usd *= 1.50
    eur = usd_to_eur(pilot_usd, usd_eur_rate)
    lines.append(("Pilotage", pilot_usd, eur))

    # Tugboats
    tug_usd = tugboat.calc_tugboat(grt, vessel_type, four_tugs, overtime_pct)
    eur = usd_to_eur(tug_usd, usd_eur_rate)
    lines.append(("Tugboats", tug_usd, eur))

    # Wharfage / Quay dues
    wharf_usd = berthing.calc_berthing(gt, berth_days, is_turk, is_kabotaj)
    eur = usd_to_eur(wharf_usd, usd_eur_rate)
    lines.append(("Wharfage / Quay dues (For {} days)".format(berth_days), wharf_usd, eur))

    # Mooring boat
    moor_usd = mooring.calc_mooring(grt, is_kabotaj, overtime_pct=overtime_pct)
    eur = usd_to_eur(moor_usd, usd_eur_rate)
    lines.append(("Mooring boat", moor_usd, eur))

    # Garbage (compulsory)
    garb_eur = waste.calc_garbage(use_fixed=True)
    garb_usd = garb_eur * usd_eur_rate  # EUR -> USD
    lines.append(("Garbage (Compulsory charge)", round(garb_usd, 2), garb_eur))

    # Harbour Master dues
    lcb_usd = harbour.calc_lcb(nrt, usd_tl_rate)
    eur = usd_to_eur(lcb_usd, usd_eur_rate)
    lines.append(("Harbour Master dues", lcb_usd, eur))

    # Liman Hizmet Ücreti / Port Service Fee (2026 TL tarifesi)
    liman_hizmet_usd = harbour.calc_liman_hizmet(gt, is_turk, usd_tl_rate)
    lines.append(("Port Service Fee", liman_hizmet_usd, usd_to_eur(liman_hizmet_usd, usd_eur_rate)))

    # Sanitary dues
    san_usd = harbour.calc_sahil_saglik(nrt, usd_tl_rate)
    eur = usd_to_eur(san_usd, usd_eur_rate)
    lines.append(("Sanitary dues", san_usd, eur))

    # Light dues
    light_usd = other.calc_light_dues()
    eur = usd_to_eur(light_usd, usd_eur_rate)
    lines.append(("Light dues", light_usd, eur))

    # Customs Overtime
    customs_usd = harbour.calc_customs_overtime(cargo_mt or 0, is_import, usd_tl_rate)
    eur = usd_to_eur(customs_usd, usd_eur_rate)
    lines.append(("Customs Overtime", customs_usd, eur))

    # Anchorage dues
    if anchorage_days > 0:
        anch_usd = anchorage.calc_anchorage(grt, anchorage_days, is_turk)
        eur = usd_to_eur(anch_usd, usd_eur_rate)
        lines.append(("Anchorage dues (For {} days)".format(anchorage_days), anch_usd, eur))

    # Chamber of shipping fee
    chamber_fee_usd = other.calc_chamber_shipping_fee()
    eur = usd_to_eur(chamber_fee_usd, usd_eur_rate)
    lines.append(("Chamber of shipping fee", chamber_fee_usd, eur))

    # Chamber of shipping share on freight
    chamber_share_usd = harbour.calc_chamber_freight(cargo_mt or 0, is_turk)
    if chamber_share_usd > 0:
        eur = usd_to_eur(chamber_share_usd, usd_eur_rate)
        lines.append(("Chamber of shipping share on freight", chamber_share_usd, eur))

    # Maritime Association
    mar_eur = other.calc_maritime_assoc()
    mar_usd = mar_eur / usd_eur_rate
    lines.append(("Contr. to Maritime Association fee", round(mar_usd, 2), mar_eur))

    # Motorboat (port'a göre: İzmir 225 USD, diğer 500 USD)
    motor_usd = other.calc_motorboat(port)
    eur = usd_to_eur(motor_usd, usd_eur_rate)
    lines.append(("Motorboat exp.", motor_usd, eur))

    # Port bazlı ek kalemler
    port_cfg = PORT_SPECIFIC.get(port.upper(), {})
    if port_cfg.get("yolluk") and port.upper() == "IZMIR":
        yolluk_usd = harbour.calc_izmir_yolluk(usd_tl_rate)
        lines.append(("İzmir Yolluk", yolluk_usd, usd_to_eur(yolluk_usd, usd_eur_rate)))
    if port_cfg.get("muhafaza") and port.upper() == "ALIAGA":
        muh_usd, yolluk_usd = harbour.calc_aliaga_guards(usd_tl_rate)
        lines.append(("Aliaga Muhafaza Mesai", muh_usd, usd_to_eur(muh_usd, usd_eur_rate)))
        lines.append(("Aliaga Muhafaza Yolluk", yolluk_usd, usd_to_eur(yolluk_usd, usd_eur_rate)))

    # Facilities, Transportation, Fiscal, Communication
    fac_eur = other.calc_facilities()
    fac_usd = fac_eur / usd_eur_rate
    lines.append(("Facilities & Other exp.", round(fac_usd, 2), fac_eur))

    trans_eur = other.calc_transportation()
    trans_usd = trans_eur / usd_eur_rate
    lines.append(("Transportation exp.", round(trans_usd, 2), trans_eur))

    fisc_eur = other.calc_fiscal_notary()
    fisc_usd = fisc_eur / usd_eur_rate
    lines.append(("Fiscal & Notary exp.", round(fisc_usd, 2), fisc_eur))

    comm_eur = other.calc_communication_stamp()
    comm_usd = comm_eur / usd_eur_rate
    lines.append(("Communication & Copy & Stamp exp.", round(comm_usd, 2), comm_eur))

    # Supervision (USD cinsinden hesaplanır, proforma örneğine göre)
    superv_usd = other.calc_supervision(cargo_mt or 0, goproz_rate=None, is_domestic=is_domestic)
    if superv_usd > 0:
        superv_eur = usd_to_eur(superv_usd, usd_eur_rate)
        lines.append(("Supervision fee (as per official tariff)", round(superv_usd, 2), round(superv_eur, 2)))

    # Agency fee
    agency_eur = agency.calc_agency_fee(nrt, berth_days)
    agency_usd = agency_eur / usd_eur_rate
    lines.append(("Agency fee (as per official tariff)", round(agency_usd, 2), round(agency_eur, 2)))

    # Total
    total_usd = sum(l[1] for l in lines)
    total_eur = sum(l[2] for l in lines)

    st.subheader("Proforma Sonucu")
    st.markdown(f"**{vessel_name}** - {port} - {purpose}")
    st.markdown("---")

    import pandas as pd
    df = pd.DataFrame(lines, columns=["Açıklama", "USD", "EUR"])
    st.dataframe(df, use_container_width=True, hide_index=True)

    st.markdown("---")
    st.metric("Toplam Port Masrafları (USD)", f"{total_usd:,.2f}")
    st.metric("Toplam Port Masrafları (EUR)", f"{total_eur:,.2f}")

    st.caption("E. & O.E. - All items are subject to final verification against official tariffs.")
