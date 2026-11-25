from rest_framework import serializers
from .models import ImagenVehiculo
from .validators import validar_archivo_subida, evaluar_calidad_opencv

class ImagenVehiculoSerializer(serializers.ModelSerializer):
    zona_display = serializers.CharField(source='get_zona_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_calidad_display', read_only=True)
    vehiculo_placa = serializers.ReadOnlyField(source='vehiculo.placa')
    archivo_url = serializers.SerializerMethodField()
    ya_analizada = serializers.SerializerMethodField()

    class Meta:
        model = ImagenVehiculo
        fields = [
            'id', 'vehiculo', 'vehiculo_placa', 'usuario', 'zona', 'zona_display',
            'archivo', 'archivo_url', 'tamano_mb', 'resolucion', 'score_nitidez',
            'estado_calidad', 'estado_display', 'motivo_rechazo', 'fecha_carga',
            'ya_analizada'
        ]
        read_only_fields = [
            'id', 'usuario', 'tamano_mb', 'resolucion',
            'score_nitidez', 'estado_calidad', 'motivo_rechazo', 'fecha_carga',
            'ya_analizada'
        ]

    def get_ya_analizada(self, obj):
        return obj.analisis.exists()

    def get_archivo_url(self, obj):
        request = self.context.get('request')
        if obj.archivo and hasattr(obj.archivo, 'url'):
            if request:
                return request.build_absolute_uri(obj.archivo.url)
            return obj.archivo.url
        return None

    def validate_archivo(self, value):
        validar_archivo_subida(value)
        return value

    def create(self, validated_data):
        archivo = validated_data['archivo']
        user = self.context['request'].user if 'request' in self.context else None

        tamano_mb = round(archivo.size / (1024 * 1024), 2)
        es_valida, resolucion, score_nitidez, motivo_rechazo = evaluar_calidad_opencv(archivo)

        estado_calidad = (
            ImagenVehiculo.EstadoCalidad.APROBADA
            if es_valida
            else ImagenVehiculo.EstadoCalidad.RECHAZADA
        )

        imagen = ImagenVehiculo.objects.create(
            vehiculo=validated_data['vehiculo'],
            usuario=user,
            zona=validated_data.get('zona', ImagenVehiculo.ZonaExterior.FRONTAL),
            archivo=archivo,
            tamano_mb=tamano_mb,
            resolucion=resolucion,
            score_nitidez=round(score_nitidez, 2),
            estado_calidad=estado_calidad,
            motivo_rechazo=motivo_rechazo
        )

        return imagen
