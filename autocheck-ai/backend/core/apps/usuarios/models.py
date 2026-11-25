from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone

class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El correo electrónico es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('rol', Usuario.Rol.ADMINISTRADOR)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class Usuario(AbstractBaseUser, PermissionsMixin):
    class Rol(models.TextChoices):
        PROPIETARIO = 'PROPIETARIO', 'Propietario'
        OPERADOR = 'OPERADOR', 'Operador'
        ADMINISTRADOR = 'ADMINISTRADOR', 'Administrador'

    email = models.EmailField(
        'Correo electrónico',
        unique=True,
        max_length=255,
        help_text='Correo utilizado para iniciar sesión'
    )
    nombre_completo = models.CharField(
        'Nombre completo',
        max_length=150
    )
    rol = models.CharField(
        'Rol de usuario',
        max_length=20,
        choices=Rol.choices,
        default=Rol.PROPIETARIO
    )

    intentos_fallidos = models.PositiveIntegerField(
        'Intentos fallidos',
        default=0
    )
    bloqueado = models.BooleanField(
        'Cuenta bloqueada',
        default=False,
        help_text='Indica si la cuenta se bloqueó por exceder 3 intentos fallidos'
    )

    is_active = models.BooleanField('Activo', default=True)
    is_staff = models.BooleanField('Staff', default=False)
    fecha_creacion = models.DateTimeField('Fecha de creación', default=timezone.now)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre_completo']

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"{self.nombre_completo} ({self.get_rol_display()}) - {self.email}"

    def save(self, *args, **kwargs):
        if self.rol == self.Rol.ADMINISTRADOR:
            self.bloqueado = False
            self.intentos_fallidos = 0
        super().save(*args, **kwargs)

    def registrar_intento_fallido(self):
        if self.rol == self.Rol.ADMINISTRADOR:
            return
        self.intentos_fallidos += 1
        if self.intentos_fallidos >= 3:
            self.bloqueado = True
        self.save(update_fields=['intentos_fallidos', 'bloqueado'])

    def reiniciar_intentos(self):
        if self.intentos_fallidos > 0:
            self.intentos_fallidos = 0
            self.save(update_fields=['intentos_fallidos'])
