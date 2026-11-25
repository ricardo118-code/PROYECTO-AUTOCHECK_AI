from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Usuario
from .serializers import (
    UsuarioSerializer,
    RegistroUsuarioSerializer,
    LoginSerializer,
    ModificarRolSerializer,
    ActualizarPerfilSerializer
)

class EsAdministrador(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.rol == Usuario.Rol.ADMINISTRADOR
        )

class EsAdminUOperador(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.rol in [Usuario.Rol.ADMINISTRADOR, Usuario.Rol.OPERADOR]
        )

class RegistroUsuarioView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = RegistroUsuarioSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "mensaje": "Usuario registrado exitosamente",
            "usuario": UsuarioSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class PerfilUsuarioView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ActualizarPerfilSerializer
        return UsuarioSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            "mensaje": "Perfil actualizado exitosamente",
            "usuario": UsuarioSerializer(instance).data
        })

class ListaUsuariosView(generics.ListAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, EsAdministrador]

class ListaPropietariosView(generics.ListAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, EsAdminUOperador]

    def get_queryset(self):
        return Usuario.objects.filter(
            rol=Usuario.Rol.PROPIETARIO,
            is_active=True
        ).order_by('nombre_completo')

class ModificarRolUsuarioView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = ModificarRolSerializer
    permission_classes = [IsAuthenticated, EsAdministrador]
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        if 'bloqueado' in request.data and not request.data['bloqueado']:
            instance.intentos_fallidos = 0
            
        usuario_actualizado = serializer.save()

        return Response({
            "mensaje": "Usuario actualizado exitosamente",
            "usuario": UsuarioSerializer(usuario_actualizado).data
        })

    def perform_destroy(self, instance):
        if instance == self.request.user:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "No puedes eliminar tu propia cuenta de administrador."})
        instance.delete()
