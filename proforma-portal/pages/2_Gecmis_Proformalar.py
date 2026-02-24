"""
Geçmiş Proformalar - (İleride proforma kayıtları listelenecek)
"""
import streamlit as st
from auth.session import init_session, is_logged_in

init_session()
if not is_logged_in():
    st.warning("Giriş yapmalısınız.")
    st.stop()

st.set_page_config(page_title="Geçmiş Proformalar", page_icon="📁", layout="wide")
st.title("Geçmiş Proformalar")
st.info("Bu bölüm yakında eklenecek. Oluşturduğunuz proformalar burada listelenecek.")
