
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('imagenes', '0001_initial'),
        ('vehiculos', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Inspeccion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha_inspeccion', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de inspección')),
                ('version_modelo', models.CharField(default='v.modelo 1.3', max_length=50, verbose_name='Versión del modelo IA')),
                ('tiempo_total_seg', models.FloatField(default=0.0, verbose_name='Tiempo total de análisis (segundos)')),
                ('total_danos_detectados', models.PositiveIntegerField(default=0, verbose_name='Total de daños detectados')),
                ('estado', models.CharField(choices=[('EN_PROCESO', 'En proceso'), ('COMPLETADA', 'Completada')], default='COMPLETADA', max_length=20, verbose_name='Estado')),
                ('usuario_responsable', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='inspecciones_realizadas', to=settings.AUTH_USER_MODEL, verbose_name='Inspector / Operador responsable')),
                ('vehiculo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inspecciones', to='vehiculos.vehiculo', verbose_name='Vehículo')),
            ],
            options={
                'verbose_name': 'Inspección',
                'verbose_name_plural': 'Inspecciones',
                'ordering': ['-fecha_inspeccion'],
            },
        ),
        migrations.CreateModel(
            name='ResultadoAnalisis',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('categoria', models.CharField(choices=[('RAYON', 'Rayón'), ('ABOLLADURA', 'Abolladura'), ('ROTURA_VIDRIO', 'Rotura de vidrio'), ('SIN_DANO', 'Sin daño')], default='SIN_DANO', max_length=30, verbose_name='Categoría de daño detectada')),
                ('confianza', models.FloatField(default=0.0, verbose_name='Nivel de confianza (0 a 1)')),
                ('coordenadas_caja', models.JSONField(blank=True, default=list, verbose_name='Coordenadas de caja [x1, y1, x2, y2]')),
                ('tiempo_procesamiento_seg', models.FloatField(default=0.0, verbose_name='Tiempo de inferencia (segundos)')),
                ('fecha_analisis', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de análisis')),
                ('imagen', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='analisis', to='imagenes.imagenvehiculo', verbose_name='Imagen analizada')),
                ('inspeccion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='resultados', to='analisis_ia.inspeccion', verbose_name='Inspección asociada')),
            ],
            options={
                'verbose_name': 'Resultado de Análisis IA',
                'verbose_name_plural': 'Resultados de Análisis IA',
                'ordering': ['-fecha_analisis'],
            },
        ),
    ]
