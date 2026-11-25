
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('vehiculos', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ImagenVehiculo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('zona', models.CharField(choices=[('FRONTAL', 'Frontal'), ('LATERAL_DERECHO', 'Lateral derecho'), ('LATERAL_IZQUIERDO', 'Lateral izquierdo'), ('POSTERIOR', 'Posterior'), ('CAPO', 'Capó'), ('TECHO', 'Techo'), ('OTRA', 'Otra zona')], default='FRONTAL', max_length=30, verbose_name='Zona fotografiada')),
                ('archivo', models.ImageField(upload_to='inspecciones/%Y/%m/%d/', verbose_name='Archivo de imagen')),
                ('tamano_mb', models.FloatField(default=0.0, verbose_name='Tamaño en MB')),
                ('resolucion', models.CharField(blank=True, max_length=50, verbose_name='Resolución (ancho x alto)')),
                ('score_nitidez', models.FloatField(default=0.0, verbose_name='Puntaje de nitidez (Laplaciano)')),
                ('estado_calidad', models.CharField(choices=[('PENDIENTE', 'Pendiente'), ('APROBADA', 'Excelente / Aprobada'), ('RECHAZADA', 'Rechazada')], default='PENDIENTE', max_length=20, verbose_name='Estado de calidad (OpenCV)')),
                ('motivo_rechazo', models.TextField(blank=True, null=True, verbose_name='Motivo de rechazo')),
                ('fecha_carga', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de carga')),
                ('usuario', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='imagenes_subidas', to=settings.AUTH_USER_MODEL, verbose_name='Usuario que cargó la foto')),
                ('vehiculo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='imagenes', to='vehiculos.vehiculo', verbose_name='Vehículo')),
            ],
            options={
                'verbose_name': 'Imagen de Vehículo',
                'verbose_name_plural': 'Imágenes de Vehículos',
                'ordering': ['-fecha_carga'],
            },
        ),
    ]
