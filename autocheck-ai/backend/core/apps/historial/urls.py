from django.urls import path
from .views import HistorialVehiculoView, CompararInspeccionesView

urlpatterns = [
    path('vehiculo/<int:vehiculo_id>/', HistorialVehiculoView.as_view(), name='historial_vehiculo'),
    path('comparar/', CompararInspeccionesView.as_view(), name='historial_comparar'),
]
