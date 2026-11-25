from rest_framework import serializers
from django.utils import timezone
from .models import Notificacion

class NotificacionSerializer(serializers.ModelSerializer):
    fecha_legible = serializers.SerializerMethodField()

    class Meta:
        model = Notificacion
        fields = [
            'id',
            'titulo',
            'mensaje',
            'tipo',
            'leida',
            'enlace_accion',
            'metadata',
            'fecha_creacion',
            'fecha_legible',
        ]

    def get_fecha_legible(self, obj):
        ahora = timezone.now()
        diff = ahora - obj.fecha_creacion
        segundos = int(diff.total_seconds())

        if segundos < 60:
            return 'Hace un momento'
        minutos = segundos // 60
        if minutos < 60:
            return f'Hace {minutos} min'
        horas = minutos // 60
        if horas < 24:
            return f'Hace {horas} {"hora" if horas == 1 else "horas"}'
        dias = horas // 24
        if dias < 7:
            return f'Hace {dias} {"día" if dias == 1 else "días"}'
        return obj.fecha_creacion.strftime('%d/%m/%Y %H:%M')
