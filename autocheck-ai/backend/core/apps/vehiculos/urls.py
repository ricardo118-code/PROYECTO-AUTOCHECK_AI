from django.urls import path
from .views import VehiculoListCreateView, VehiculoDetailView

urlpatterns = [
    path('', VehiculoListCreateView.as_view(), name='vehiculos_list_create'),
    path('<int:id>/', VehiculoDetailView.as_view(), name='vehiculo_detail'),
]
