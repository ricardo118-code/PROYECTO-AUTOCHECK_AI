from django.urls import path
from .views import (
    NotificacionListView,
    MarcarLeidaView,
    MarcarTodasLeidasView,
    EliminarNotificacionView,
)

urlpatterns = [
    path('', NotificacionListView.as_view(), name='notificaciones-list'),
    path('<int:pk>/leer/', MarcarLeidaView.as_view(), name='notificacion-leer'),
    path('marcar-todas-leidas/', MarcarTodasLeidasView.as_view(), name='notificaciones-marcar-todas'),
    path('<int:pk>/', EliminarNotificacionView.as_view(), name='notificacion-eliminar'),
]
