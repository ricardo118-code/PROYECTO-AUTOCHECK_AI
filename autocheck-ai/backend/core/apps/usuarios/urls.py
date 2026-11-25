from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegistroUsuarioView,
    LoginView,
    PerfilUsuarioView,
    ListaUsuariosView,
    ListaPropietariosView,
    ModificarRolUsuarioView
)

urlpatterns = [
    path('registro/', RegistroUsuarioView.as_view(), name='auth_registro'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('perfil/', PerfilUsuarioView.as_view(), name='auth_perfil'),
    path('usuarios/propietarios/', ListaPropietariosView.as_view(), name='usuarios_propietarios'),
    path('usuarios/', ListaUsuariosView.as_view(), name='usuarios_lista'),
    path('usuarios/<int:id>/', ModificarRolUsuarioView.as_view(), name='usuarios_modificar'),
]
