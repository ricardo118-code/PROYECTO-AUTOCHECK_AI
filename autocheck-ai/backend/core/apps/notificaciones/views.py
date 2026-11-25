from django.db.models import Q
from rest_framework import views, permissions, status
from rest_framework.response import Response
from .models import Notificacion
from .serializers import NotificacionSerializer

def obtener_notificaciones_usuario(user):
    qs = Notificacion.objects.filter(usuario=user)
    if user.rol in ['ADMINISTRADOR', 'OPERADOR']:
        return qs.filter(
            Q(tipo=Notificacion.Tipo.SEGURIDAD) |
            Q(tipo=Notificacion.Tipo.VEHICULO, titulo='Nueva unidad registrada') |
            Q(tipo=Notificacion.Tipo.SISTEMA) |
            Q(metadata__rol_destino='STAFF')
        )
    elif user.rol == 'PROPIETARIO':
        return qs.filter(
            Q(tipo=Notificacion.Tipo.INSPECCION) |
            Q(tipo=Notificacion.Tipo.VEHICULO, titulo__icontains='Vehículo registrado') |
            Q(tipo=Notificacion.Tipo.SISTEMA) |
            Q(metadata__rol_destino='PROPIETARIO')
        )
    return qs

class NotificacionListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notificaciones = obtener_notificaciones_usuario(request.user)
        no_leidas = notificaciones.filter(leida=False).count()
        serializer = NotificacionSerializer(notificaciones[:30], many=True)
        return Response({
            'total_no_leidas': no_leidas,
            'notificaciones': serializer.data
        })

class MarcarLeidaView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            notificacion = obtener_notificaciones_usuario(request.user).get(id=pk)
            notificacion.leida = True
            notificacion.save(update_fields=['leida'])
            return Response({'mensaje': 'Notificación marcada como leída'})
        except Notificacion.DoesNotExist:
            return Response({'detail': 'Notificación no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

class MarcarTodasLeidasView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        obtener_notificaciones_usuario(request.user).filter(leida=False).update(leida=True)
        return Response({'mensaje': 'Todas las notificaciones marcadas como leídas'})

class EliminarNotificacionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            notificacion = obtener_notificaciones_usuario(request.user).get(id=pk)
            notificacion.delete()
            return Response({'mensaje': 'Notificación eliminada'})
        except Notificacion.DoesNotExist:
            return Response({'detail': 'Notificación no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
