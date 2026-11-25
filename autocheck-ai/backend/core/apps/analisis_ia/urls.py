from django.urls import path
from .views import (
    EjecutarAnalisisView,
    DetalleInspeccionView,
    ListaInspeccionesVehiculoView
)

urlpatterns = [
    path('ejecutar/', EjecutarAnalisisView.as_view(), name='analisis_ejecutar'),
    path('inspeccion/<int:id>/', DetalleInspeccionView.as_view(), name='analisis_detalle_inspeccion'),
    path('vehiculo/<int:vehiculo_id>/', ListaInspeccionesVehiculoView.as_view(), name='analisis_vehiculo'),
]
