"""
Hesap Ayarları - Kullanıcı bilgileri (İleride genişletilecek)
"""
import streamlit as st
from auth.session import init_session, is_logged_in, get_user

init_session()
if not is_logged_in():
    st.warning("Giriş yapmalısınız.")
    st.stop()

st.set_page_config(page_title="Hesap Ayarları", page_icon="⚙️", layout="wide")
st.title("Hesap Ayarları")

user = get_user()
st.subheader("Profil Bilgileri")
st.write(f"**Ad Soyad:** {user['full_name']}")
st.write(f"**Email:** {user['email']}")
st.write(f"**Şirket:** {user['company_name'] or '-'}")
st.info("Profil düzenleme yakında eklenecek.")
