from django.contrib import admin
from .models import ImagenVehiculo

@admin.register(ImagenVehiculo)
class ImagenVehiculoAdmin(admin.ModelAdmin):
    list_display = ('vehiculo', 'zona', 'tamano_mb', 'resolucion', 'score_nitidez', 'estado_calidad', 'fecha_carga')
    list_filter = ('estado_calidad', 'zona', 'fecha_carga')
    search_fields = ('vehiculo__placa', 'motivo_rechazo')
    ordering = ('-fecha_carga',)
