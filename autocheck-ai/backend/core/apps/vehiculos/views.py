from rest_framework import generics, permissions
from django.db.models import Q
from .models import Vehiculo
from .serializers import VehiculoSerializer
from core.apps.usuarios.models import Usuario

class VehiculoListCreateView(generics.ListCreateAPIView):
    serializer_class = VehiculoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Vehiculo.objects.all()

        if user.rol == Usuario.Rol.PROPIETARIO:
            queryset = queryset.filter(propietario=user)

        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(placa__icontains=search) |
                Q(marca__icontains=search) |
                Q(modelo__icontains=search)
            )

        estado = self.request.query_params.get('estado', '').strip().upper()
        if estado in [Vehiculo.EstadoInspeccion.PENDIENTE, Vehiculo.EstadoInspeccion.INSPECCIONADO]:
            queryset = queryset.filter(estado_inspeccion=estado)

        return queryset

    def perform_create(self, serializer):
        vehiculo = serializer.save()
        try:
            from core.apps.notificaciones.services import crear_notificacion
            propietario_nombre = vehiculo.propietario.nombre_completo or vehiculo.propietario.email
            if self.request.user.rol == Usuario.Rol.PROPIETARIO:
                destinatarios = Usuario.objects.filter(
                    rol__in=[Usuario.Rol.ADMINISTRADOR, Usuario.Rol.OPERADOR]
                )
                crear_notificacion(
                    usuarios=destinatarios,
                    titulo='Nueva unidad registrada',
                    mensaje=f'El cliente {propietario_nombre} ha registrado el vehículo {vehiculo.marca} {vehiculo.modelo} ({vehiculo.placa}). Estado: Pendiente de inspección.',
                    tipo='VEHICULO',
                    enlace_accion='vehicles',
                    metadata={'vehiculo_id': vehiculo.id, 'placa': vehiculo.placa, 'rol_destino': 'STAFF'}
                )
            else:
                if vehiculo.propietario and vehiculo.propietario != self.request.user:
                    crear_notificacion(
                        usuarios=[vehiculo.propietario],
                        titulo='Vehículo registrado para inspección',
                        mensaje=f'Tu vehículo {vehiculo.marca} {vehiculo.modelo} ({vehiculo.placa}) ha sido ingresado al sistema. Estado: Pendiente de inspección.',
                        tipo='VEHICULO',
                        enlace_accion='vehicles',
                        metadata={'vehiculo_id': vehiculo.id, 'placa': vehiculo.placa, 'rol_destino': 'PROPIETARIO'}
                    )
        except Exception:
            pass

class VehiculoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.rol == Usuario.Rol.PROPIETARIO:
            return Vehiculo.objects.filter(propietario=user)
        return Vehiculo.objects.all()
