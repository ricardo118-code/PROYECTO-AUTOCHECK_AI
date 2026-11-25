from django.db import models
from django.conf import settings

class Vehiculo(models.Model):
    class EstadoInspeccion(models.TextChoices):
        PENDIENTE = 'PENDIENTE', 'Pendiente'
        INSPECCIONADO = 'INSPECCIONADO', 'Inspeccionado'

    placa = models.CharField(
        'Placa / Patente',
        max_length=15,
        unique=True,
        db_index=True,
        help_text='Identificador único del vehículo (ej. ABC-1234)'
    )
    marca = models.CharField('Marca', max_length=50, help_text='Ej. Toyota')
    modelo = models.CharField('Modelo', max_length=50, help_text='Ej. Corolla')
    anio = models.PositiveIntegerField('Año de fabricación', help_text='Ej. 2020')

    propietario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vehiculos',
        verbose_name='Propietario del vehículo'
    )

    estado_inspeccion = models.CharField(
        'Estado de inspección',
        max_length=20,
        choices=EstadoInspeccion.choices,
        default=EstadoInspeccion.PENDIENTE
    )

    fecha_registro = models.DateTimeField('Fecha de registro', auto_now_add=True)
    fecha_actualizacion = models.DateTimeField('Última actualización', auto_now=True)

    class Meta:
        verbose_name = 'Vehículo'
        verbose_name_plural = 'Vehículos'
        ordering = ['-fecha_registro']

    def clean(self):
        if self.placa:
            self.placa = self.placa.strip().upper()

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.placa} - {self.marca} {self.modelo} ({self.anio})"
