"""
Proforma Portal - Ana giriş noktası
Streamlit ile denizcilik acentesi proforma hesaplama portalı
"""
import streamlit as st
from auth.session import init_session, is_logged_in, set_user, get_user, logout
from auth.database import register_user, login_user

st.set_page_config(page_title="Proforma Portal", page_icon="⛵", layout="wide")
init_session()

if not is_logged_in():
    st.title("Proforma Portal - Giriş")
    tab1, tab2 = st.tabs(["Giriş Yap", "Kayıt Ol"])

    with tab1:
        with st.form("login_form"):
            login_email = st.text_input("Email")
            login_pass = st.text_input("Şifre", type="password")
            if st.form_submit_button("Giriş Yap"):
                ok, user, msg = login_user(login_email, login_pass)
                if ok:
                    set_user(user)
                    st.success(msg)
                    st.rerun()
                else:
                    st.error(msg)

    with tab2:
        with st.form("register_form"):
            reg_email = st.text_input("Email", key="reg_email")
            reg_pass = st.text_input("Şifre", type="password", key="reg_pass")
            reg_name = st.text_input("Ad Soyad")
            reg_company = st.text_input("Şirket Adı (opsiyonel)")
            if st.form_submit_button("Kayıt Ol"):
                ok, msg = register_user(reg_email, reg_pass, reg_name, reg_company)
                if ok:
                    st.success(msg)
                else:
                    st.error(msg)
else:
    user = get_user()
    st.sidebar.title("Proforma Portal")
    st.sidebar.success(f"Hoş geldiniz, {user['full_name']}")
    if st.sidebar.button("Çıkış Yap"):
        logout()
        st.rerun()

    st.title("Ana Sayfa")
    st.markdown(f"**{user['company_name'] or user['full_name']}** olarak giriş yaptınız.")
    st.markdown("---")
    st.markdown("""
    Sol menüden **Proforma Oluştur** sayfasına giderek otomatik proforma hesaplaması yapabilirsiniz.
    """)

    if st.button("Proforma Oluştur"):
        st.switch_page("pages/1_Proforma_Olustur.py")
