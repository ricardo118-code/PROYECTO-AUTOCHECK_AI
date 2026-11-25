from django.contrib import admin
from .models import Inspeccion, ResultadoAnalisis

class ResultadoAnalisisInline(admin.TabularInline):
    model = ResultadoAnalisis
    extra = 0
    readonly_fields = ('imagen', 'categoria', 'confianza', 'coordenadas_caja', 'tiempo_procesamiento_seg', 'fecha_analisis')

@admin.register(Inspeccion)
class InspeccionAdmin(admin.ModelAdmin):
    list_display = ('vehiculo', 'usuario_responsable', 'total_danos_detectados', 'tiempo_total_seg', 'version_modelo', 'fecha_inspeccion')
    list_filter = ('estado', 'version_modelo', 'fecha_inspeccion')
    search_fields = ('vehiculo__placa', 'usuario_responsable__email')
    inlines = [ResultadoAnalisisInline]
