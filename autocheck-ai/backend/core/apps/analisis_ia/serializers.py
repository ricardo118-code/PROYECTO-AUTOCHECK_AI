from rest_framework import serializers
from .models import Inspeccion, ResultadoAnalisis

class ResultadoAnalisisSerializer(serializers.ModelSerializer):
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    porcentaje_confianza = serializers.SerializerMethodField()
    imagen_zona = serializers.CharField(source='imagen.get_zona_display', read_only=True)
    imagen_url = serializers.SerializerMethodField()
    titulo_tarjeta = serializers.SerializerMethodField()

    class Meta:
        model = ResultadoAnalisis
        fields = [
            'id', 'categoria', 'categoria_display', 'confianza', 'porcentaje_confianza',
            'coordenadas_caja', 'tiempo_procesamiento_seg', 'imagen', 'imagen_zona',
            'imagen_url', 'titulo_tarjeta', 'fecha_analisis'
        ]

    def get_porcentaje_confianza(self, obj):
        return f"{int(obj.confianza * 100)}%"

    def get_titulo_tarjeta(self, obj):
        return f"{obj.get_categoria_display()} · {obj.imagen.get_zona_display().lower()}"

    def get_imagen_url(self, obj):
        request = self.context.get('request')
        if obj.imagen and obj.imagen.archivo and hasattr(obj.imagen.archivo, 'url'):
            if request:
                return request.build_absolute_uri(obj.imagen.archivo.url)
            return obj.imagen.archivo.url
        return None

class InspeccionSerializer(serializers.ModelSerializer):
    vehiculo_placa = serializers.ReadOnlyField(source='vehiculo.placa')
    vehiculo_marca = serializers.ReadOnlyField(source='vehiculo.marca')
    vehiculo_modelo = serializers.ReadOnlyField(source='vehiculo.modelo')
    vehiculo_anio = serializers.ReadOnlyField(source='vehiculo.anio')
    usuario_nombre = serializers.SerializerMethodField()
    banner_tiempo = serializers.SerializerMethodField()
    resultados = ResultadoAnalisisSerializer(many=True, read_only=True)

    class Meta:
        model = Inspeccion
        fields = [
            'id', 'vehiculo', 'vehiculo_placa', 'vehiculo_marca', 'vehiculo_modelo',
            'vehiculo_anio', 'usuario_responsable', 'usuario_nombre', 'fecha_inspeccion',
            'version_modelo', 'tiempo_total_seg', 'banner_tiempo', 'total_danos_detectados',
            'estado', 'resultados'
        ]

    def get_usuario_nombre(self, obj):
        if obj.usuario_responsable:
            return obj.usuario_responsable.nombre_completo or obj.usuario_responsable.email
        return "Inspector técnico"

    def get_banner_tiempo(self, obj):
        return f"Análisis completado en {obj.tiempo_total_seg:.1f}s"

class EjecutarAnalisisInputSerializer(serializers.Serializer):
    vehiculo_id = serializers.IntegerField(required=True)
    imagenes_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text='Lista opcional de IDs de imágenes a analizar. Si se omite, se analizan todas las aprobadas.'
    )
