from django.urls import path
from .views import DescargarReporteIndividualView, DescargarReporteComparativoView

urlpatterns = [
    path('individual/<int:inspeccion_id>/', DescargarReporteIndividualView.as_view(), name='reporte_individual'),
    path('comparativo/', DescargarReporteComparativoView.as_view(), name='reporte_comparativo'),
]
