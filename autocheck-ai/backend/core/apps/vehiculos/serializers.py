import re
from datetime import datetime
from rest_framework import serializers
from .models import Vehiculo

class VehiculoSerializer(serializers.ModelSerializer):
    propietario_nombre = serializers.ReadOnlyField(source='propietario.nombre_completo')
    propietario_email = serializers.ReadOnlyField(source='propietario.email')
    estado_display = serializers.CharField(source='get_estado_inspeccion_display', read_only=True)
    total_inspecciones = serializers.SerializerMethodField()

    class Meta:
        model = Vehiculo
        fields = [
            'id', 'placa', 'marca', 'modelo', 'anio',
            'propietario', 'propietario_nombre', 'propietario_email',
            'estado_inspeccion', 'estado_display', 'total_inspecciones',
            'fecha_registro', 'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'total_inspecciones', 'fecha_registro', 'fecha_actualizacion']
        extra_kwargs = {
            'propietario': {'required': False}
        }

    def get_total_inspecciones(self, obj):
        return obj.inspecciones.count() if hasattr(obj, 'inspecciones') else 0

    def validate_placa(self, value):
        placa_limpia = value.strip().upper().replace(' ', '')
        if re.match(r'^[A-Z]{2,3}\d{3,4}$', placa_limpia):
            letras_match = re.match(r'^[A-Z]+', placa_limpia)
            if letras_match:
                letras = letras_match.group(0)
                numeros = placa_limpia[len(letras):]
                placa_limpia = f"{letras}-{numeros}"

        if not re.match(r'^[A-Z]{2,3}-\d{3,4}$', placa_limpia):
            raise serializers.ValidationError(
                "Formato de placa inválido. Debe contener 3 letras, guion y 3 o 4 números (ejemplo: ABC-1234)."
            )

        query = Vehiculo.objects.filter(placa=placa_limpia)
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError(
                "Ya existe un vehículo registrado con esta placa. Evita duplicados."
            )
        return placa_limpia

    def validate_marca(self, value):
        marca = value.strip()
        if len(marca) < 2:
            raise serializers.ValidationError("La marca debe tener al menos 2 caracteres.")
        if not re.match(r'^[A-Za-zÁÉÍÓÚáéíóúñÑ\s.-]{2,50}$', marca) or not any(c.isalpha() for c in marca):
            raise serializers.ValidationError(
                "La marca debe contener un nombre vehicular válido (ejemplo: Toyota, Kia, Chevrolet)."
            )
        return marca.title()

    def validate_modelo(self, value):
        modelo = value.strip()
        if len(modelo) < 2:
            raise serializers.ValidationError("El modelo debe tener al menos 2 caracteres.")
        if not re.match(r'^[A-Za-z0-9ÁÉÍÓÚáéíóúñÑ\s.-]{2,50}$', modelo):
            raise serializers.ValidationError(
                "El modelo contiene caracteres no válidos (ejemplo: Corolla, Sportage, D-Max)."
            )
        return modelo.title()

    def validate_anio(self, value):
        anio_actual = datetime.now().year
        if value < 1960 or value > (anio_actual + 1):
            raise serializers.ValidationError(
                f"El año de fabricación debe estar entre 1960 y {anio_actual + 1}."
            )
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user = request.user
            if user.rol != 'PROPIETARIO':
                if not attrs.get('propietario') and not (self.instance and self.instance.propietario):
                    raise serializers.ValidationError({
                        'propietario': 'Debe seleccionar el propietario al que se asignará el vehículo.'
                    })
                if attrs.get('propietario') and attrs['propietario'].rol != 'PROPIETARIO':
                    raise serializers.ValidationError({
                        'propietario': 'El usuario asignado debe tener el rol de Propietario.'
                    })
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        if user.rol == 'PROPIETARIO':
            validated_data['propietario'] = user
        return super().create(validated_data)
