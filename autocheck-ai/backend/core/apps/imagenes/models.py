from django.db import models
from django.conf import settings
from core.apps.vehiculos.models import Vehiculo

class ImagenVehiculo(models.Model):
    class ZonaExterior(models.TextChoices):
        FRONTAL = 'FRONTAL', 'Frontal'
        LATERAL_DERECHO = 'LATERAL_DERECHO', 'Lateral derecho'
        LATERAL_IZQUIERDO = 'LATERAL_IZQUIERDO', 'Lateral izquierdo'
        POSTERIOR = 'POSTERIOR', 'Posterior'
        CAPO = 'CAPO', 'Capó'
        TECHO = 'TECHO', 'Techo'
        OTRA = 'OTRA', 'Otra zona'

    class EstadoCalidad(models.TextChoices):
        PENDIENTE = 'PENDIENTE', 'Pendiente'
        APROBADA = 'APROBADA', 'Excelente / Aprobada'
        RECHAZADA = 'RECHAZADA', 'Rechazada'

    vehiculo = models.ForeignKey(
        Vehiculo,
        on_delete=models.CASCADE,
        related_name='imagenes',
        verbose_name='Vehículo'
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='imagenes_subidas',
        verbose_name='Usuario que cargó la foto'
    )
    zona = models.CharField(
        'Zona fotografiada',
        max_length=30,
        choices=ZonaExterior.choices,
        default=ZonaExterior.FRONTAL
    )
    archivo = models.ImageField(
        'Archivo de imagen',
        upload_to='inspecciones/%Y/%m/%d/'
    )
    tamano_mb = models.FloatField('Tamaño en MB', default=0.0)
    resolucion = models.CharField('Resolución (ancho x alto)', max_length=50, blank=True)
    score_nitidez = models.FloatField('Puntaje de nitidez (Laplaciano)', default=0.0)
    
    estado_calidad = models.CharField(
        'Estado de calidad (OpenCV)',
        max_length=20,
        choices=EstadoCalidad.choices,
        default=EstadoCalidad.PENDIENTE
    )
    motivo_rechazo = models.TextField('Motivo de rechazo', blank=True, null=True)

    fecha_carga = models.DateTimeField('Fecha de carga', auto_now_add=True)

    class Meta:
        verbose_name = 'Imagen de Vehículo'
        verbose_name_plural = 'Imágenes de Vehículos'
        ordering = ['-fecha_carga']

    def __str__(self):
        return f"{self.vehiculo.placa} - {self.get_zona_display()} ({self.get_estado_calidad_display()})"
