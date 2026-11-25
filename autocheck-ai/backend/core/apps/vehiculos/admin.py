from django.contrib import admin
from .models import Vehiculo

@admin.register(Vehiculo)
class VehiculoAdmin(admin.ModelAdmin):
    list_display = ('placa', 'marca', 'modelo', 'anio', 'propietario', 'estado_inspeccion', 'fecha_registro')
    list_filter = ('estado_inspeccion', 'marca', 'anio')
    search_fields = ('placa', 'marca', 'modelo', 'propietario__nombre_completo', 'propietario__email')
    ordering = ('-fecha_registro',)
