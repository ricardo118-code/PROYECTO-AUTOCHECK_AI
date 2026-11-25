from django.db import models
from django.conf import settings
from core.apps.vehiculos.models import Vehiculo
from core.apps.imagenes.models import ImagenVehiculo

class Inspeccion(models.Model):
    class Estado(models.TextChoices):
        EN_PROCESO = 'EN_PROCESO', 'En proceso'
        COMPLETADA = 'COMPLETADA', 'Completada'

    vehiculo = models.ForeignKey(
        Vehiculo,
        on_delete=models.CASCADE,
        related_name='inspecciones',
        verbose_name='Vehículo'
    )
    usuario_responsable = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inspecciones_realizadas',
        verbose_name='Inspector / Operador responsable'
    )
    fecha_inspeccion = models.DateTimeField('Fecha de inspección', auto_now_add=True)
    version_modelo = models.CharField('Versión del modelo IA', max_length=50, default='v.modelo 1.3')
    tiempo_total_seg = models.FloatField('Tiempo total de análisis (segundos)', default=0.0)
    total_danos_detectados = models.PositiveIntegerField('Total de daños detectados', default=0)
    estado = models.CharField('Estado', max_length=20, choices=Estado.choices, default=Estado.COMPLETADA)

    class Meta:
        verbose_name = 'Inspección'
        verbose_name_plural = 'Inspecciones'
        ordering = ['-fecha_inspeccion']

    def __str__(self):
        return f"Inspección {self.vehiculo.placa} - {self.fecha_inspeccion.strftime('%d/%m/%Y %H:%M')}"

class ResultadoAnalisis(models.Model):
    class CategoriaDano(models.TextChoices):
        RAYON = 'RAYON', 'Rayón'
        ABOLLADURA = 'ABOLLADURA', 'Abolladura'
        ROTURA_VIDRIO = 'ROTURA_VIDRIO', 'Rotura de vidrio'
        SIN_DANO = 'SIN_DANO', 'Sin daño'

    inspeccion = models.ForeignKey(
        Inspeccion,
        on_delete=models.CASCADE,
        related_name='resultados',
        verbose_name='Inspección asociada'
    )
    imagen = models.ForeignKey(
        ImagenVehiculo,
        on_delete=models.CASCADE,
        related_name='analisis',
        verbose_name='Imagen analizada'
    )
    categoria = models.CharField(
        'Categoría de daño detectada',
        max_length=30,
        choices=CategoriaDano.choices,
        default=CategoriaDano.SIN_DANO
    )
    confianza = models.FloatField('Nivel de confianza (0 a 1)', default=0.0)
    coordenadas_caja = models.JSONField(
        'Coordenadas de caja [x1, y1, x2, y2]',
        default=list,
        blank=True
    )
    tiempo_procesamiento_seg = models.FloatField('Tiempo de inferencia (segundos)', default=0.0)
    fecha_analisis = models.DateTimeField('Fecha de análisis', auto_now_add=True)

    class Meta:
        verbose_name = 'Resultado de Análisis IA'
        verbose_name_plural = 'Resultados de Análisis IA'
        ordering = ['-fecha_analisis']

    def __str__(self):
        return f"{self.get_categoria_display()} ({int(self.confianza * 100)}%) - {self.imagen.get_zona_display()}"
