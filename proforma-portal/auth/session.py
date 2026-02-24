"""
Streamlit session state yönetimi - giriş durumu
"""
import streamlit as st


def init_session():
    """session_state varsayılanlarını ayarla"""
    if "user" not in st.session_state:
        st.session_state.user = None
    if "initialized" not in st.session_state:
        st.session_state.initialized = True


def set_user(user):
    """Giriş yapmış kullanıcıyı kaydet"""
    st.session_state.user = user


def get_user():
    """Giriş yapmış kullanıcıyı döndür"""
    return st.session_state.get("user")


def is_logged_in() -> bool:
    """Kullanıcı giriş yapmış mı"""
    return st.session_state.get("user") is not None


def logout():
    """Çıkış yap"""
    st.session_state.user = None
