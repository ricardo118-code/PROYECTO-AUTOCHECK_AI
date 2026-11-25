import re
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Usuario

def validar_nombre_y_apellido(value: str) -> str:
    nombre_limpio = ' '.join(value.strip().split())
    palabras = nombre_limpio.split()

    if len(palabras) < 2:
        raise serializers.ValidationError(
            "Debes ingresar nombres y apellidos completos (al menos un nombre y un apellido, ej. Juan Pérez)."
        )

    for p in palabras:
        if len(p) < 2:
            raise serializers.ValidationError(
                f"La palabra '{p}' es demasiado corta. Ingresa nombres y apellidos válidos."
            )

    if not re.match(r"^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$", nombre_limpio):
        raise serializers.ValidationError(
            "El nombre completo solo puede contener letras y espacios (no se permiten números ni caracteres especiales)."
        )

    return nombre_limpio.title()

class UsuarioSerializer(serializers.ModelSerializer):
    rol_display = serializers.CharField(source='get_rol_display', read_only=True)
    total_vehiculos = serializers.SerializerMethodField()
    total_inspecciones_vehiculos = serializers.SerializerMethodField()
    total_inspecciones_realizadas = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'nombre_completo', 'rol', 'rol_display',
            'bloqueado', 'intentos_fallidos',
            'total_vehiculos', 'total_inspecciones_vehiculos', 'total_inspecciones_realizadas',
            'fecha_creacion'
        ]
        read_only_fields = [
            'id', 'bloqueado', 'intentos_fallidos',
            'total_vehiculos', 'total_inspecciones_vehiculos', 'total_inspecciones_realizadas',
            'fecha_creacion'
        ]

    def get_total_vehiculos(self, obj):
        return obj.vehiculos.count() if hasattr(obj, 'vehiculos') else 0

    def get_total_inspecciones_vehiculos(self, obj):
        try:
            from core.apps.analisis_ia.models import Inspeccion
            return Inspeccion.objects.filter(vehiculo__propietario=obj).count()
        except Exception:
            return 0

    def get_total_inspecciones_realizadas(self, obj):
        return obj.inspecciones_realizadas.count() if hasattr(obj, 'inspecciones_realizadas') else 0

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})

    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nombre_completo', 'password', 'rol']

    def validate_email(self, value):
        email = value.strip().lower()
        if Usuario.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Ya existe una cuenta registrada con este correo electrónico.")
        return email

    def validate_nombre_completo(self, value):
        return validar_nombre_y_apellido(value)

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("La contraseña debe tener al menos 6 caracteres.")
        return value

    def validate_rol(self, value):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated or request.user.rol != 'ADMINISTRADOR':
            return 'PROPIETARIO'
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Usuario.objects.create_user(password=password, **validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password')

        try:
            user = Usuario.objects.get(email__iexact=email)
        except Usuario.DoesNotExist:
            raise serializers.ValidationError({"detail": "Credenciales incorrectas. Verifica tu correo y contraseña."})

        if user.rol != Usuario.Rol.ADMINISTRADOR and user.bloqueado:
            raise serializers.ValidationError({
                "detail": "Tu cuenta ha sido bloqueada tras 3 intentos fallidos consecutivos. Contacta al administrador."
            })

        if not user.check_password(password):
            if user.rol == Usuario.Rol.ADMINISTRADOR:
                raise serializers.ValidationError({
                    "detail": "Credenciales incorrectas. Verifica tu correo y contraseña."
                })

            user.registrar_intento_fallido()
            intentos_restantes = max(0, 3 - user.intentos_fallidos)
            if user.bloqueado:
                try:
                    from core.apps.notificaciones.services import crear_notificacion
                    destinatarios = Usuario.objects.filter(rol=Usuario.Rol.ADMINISTRADOR)
                    crear_notificacion(
                        usuarios=destinatarios,
                        titulo='Alerta de seguridad: Cuenta bloqueada',
                        mensaje=f'La cuenta de {user.nombre_completo} ({user.email}) ha sido bloqueada tras 3 intentos fallidos consecutivos.',
                        tipo='SEGURIDAD',
                        enlace_accion='users',
                        metadata={'usuario_id': user.id, 'email': user.email, 'rol_destino': 'STAFF'}
                    )
                except Exception:
                    pass
                raise serializers.ValidationError({
                    "detail": "Has alcanzado el límite de 3 intentos fallidos. Tu cuenta ha sido bloqueada. Contacta al administrador."
                })
            else:
                intentos_txt = "intento" if intentos_restantes == 1 else "intentos"
                queda_txt = "queda" if intentos_restantes == 1 else "quedan"
                raise serializers.ValidationError({
                    "detail": f"Contraseña incorrecta. Te {queda_txt} {intentos_restantes} {intentos_txt} antes del bloqueo de tu cuenta."
                })

        if not user.is_active:
            raise serializers.ValidationError({"detail": "Esta cuenta está inactiva."})

        user.reiniciar_intentos()

        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['rol'] = user.rol
        refresh['nombre_completo'] = user.nombre_completo

        return {
            'user': UsuarioSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }

class ModificarRolSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=6)

    class Meta:
        model = Usuario
        fields = ['nombre_completo', 'email', 'rol', 'bloqueado', 'password']

    def validate_email(self, value):
        email = value.strip().lower()
        query = Usuario.objects.filter(email__iexact=email)
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError("Ya existe otro usuario registrado con este correo electrónico.")
        return email

    def validate_nombre_completo(self, value):
        return validar_nombre_y_apellido(value)

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.user and self.instance:
            if self.instance.id == request.user.id:
                if attrs.get('bloqueado') is True:
                    raise serializers.ValidationError({
                        'bloqueado': 'No puedes bloquear tu propia cuenta de administrador.'
                    })
                if 'rol' in attrs and attrs['rol'] != 'ADMINISTRADOR':
                    raise serializers.ValidationError({
                        'rol': 'No puedes quitarte el rol de Administrador a ti mismo.'
                    })
        if attrs.get('rol') == 'ADMINISTRADOR' or (self.instance and self.instance.rol == 'ADMINISTRADOR'):
            attrs['bloqueado'] = False
        return attrs

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if password and password.strip():
            instance.set_password(password.strip())
            instance.intentos_fallidos = 0
            instance.save()
        return instance

class ActualizarPerfilSerializer(serializers.ModelSerializer):
    password_actual = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password_nuevo = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=6)

    class Meta:
        model = Usuario
        fields = ['nombre_completo', 'email', 'password_actual', 'password_nuevo']

    def validate_email(self, value):
        email = value.strip().lower()
        query = Usuario.objects.filter(email__iexact=email)
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError("Este correo electrónico ya está en uso por otra cuenta.")
        return email

    def validate_nombre_completo(self, value):
        return validar_nombre_y_apellido(value)

    def validate(self, attrs):
        password_actual = attrs.get('password_actual')
        password_nuevo = attrs.get('password_nuevo')

        if password_nuevo:
            if not password_actual:
                raise serializers.ValidationError({
                    'password_actual': 'Debes ingresar tu contraseña actual para establecer una nueva.'
                })
            user = self.instance
            if not user.check_password(password_actual):
                raise serializers.ValidationError({
                    'password_actual': 'La contraseña actual ingresada es incorrecta.'
                })

        return attrs

    def update(self, instance, validated_data):
        password_nuevo = validated_data.pop('password_nuevo', None)
        validated_data.pop('password_actual', None)

        instance.nombre_completo = validated_data.get('nombre_completo', instance.nombre_completo)
        instance.email = validated_data.get('email', instance.email)

        if password_nuevo:
            instance.set_password(password_nuevo)

        instance.save()
        return instance
