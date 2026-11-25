from django.urls import path
from .views import SubirImagenView, ImagenesPorVehiculoView, DetalleImagenView

urlpatterns = [
    path('subir/', SubirImagenView.as_view(), name='imagen_subir'),
    path('vehiculo/<int:vehiculo_id>/', ImagenesPorVehiculoView.as_view(), name='imagenes_vehiculo'),
    path('<int:id>/', DetalleImagenView.as_view(), name='imagen_detalle'),
]
