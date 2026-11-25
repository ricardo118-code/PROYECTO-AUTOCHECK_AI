from django.db import models
from django.conf import settings

class Notificacion(models.Model):
    class Tipo(models.TextChoices):
        VEHICULO = 'VEHICULO', 'Vehículo'
        INSPECCION = 'INSPECCION', 'Inspección'
        SEGURIDAD = 'SEGURIDAD', 'Seguridad'
        SISTEMA = 'SISTEMA', 'Sistema'

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notificaciones',
        verbose_name='Destinatario'
    )
    titulo = models.CharField('Título', max_length=150)
    mensaje = models.TextField('Mensaje')
    tipo = models.CharField('Tipo de notificación', max_length=20, choices=Tipo.choices, default=Tipo.SISTEMA)
    leida = models.BooleanField('Leída', default=False)
    enlace_accion = models.CharField('Enlace de acción', max_length=100, blank=True, null=True)
    metadata = models.JSONField('Metadatos', default=dict, blank=True)
    fecha_creacion = models.DateTimeField('Fecha de creación', auto_now_add=True)

    class Meta:
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"{self.titulo} - {self.usuario.email} ({'Leída' if self.leida else 'Nueva'})"
