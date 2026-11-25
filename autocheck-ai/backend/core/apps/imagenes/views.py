from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import ImagenVehiculo
from .serializers import ImagenVehiculoSerializer

class SubirImagenView(generics.CreateAPIView):
    queryset = ImagenVehiculo.objects.all()
    serializer_class = ImagenVehiculoSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        imagen = serializer.save()

        data = ImagenVehiculoSerializer(imagen, context={'request': request}).data
        
        status_code = status.HTTP_201_CREATED
        return Response({
            "mensaje": "Imagen procesada correctamente por OpenCV",
            "es_valida": imagen.estado_calidad == ImagenVehiculo.EstadoCalidad.APROBADA,
            "imagen": data
        }, status=status_code)


class ImagenesPorVehiculoView(generics.ListAPIView):
    serializer_class = ImagenVehiculoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        vehiculo_id = self.kwargs.get('vehiculo_id')
        return ImagenVehiculo.objects.filter(vehiculo_id=vehiculo_id).order_by('-fecha_carga')


class DetalleImagenView(generics.RetrieveDestroyAPIView):
    queryset = ImagenVehiculo.objects.all()
    serializer_class = ImagenVehiculoSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
