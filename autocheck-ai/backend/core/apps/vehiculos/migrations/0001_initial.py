
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Vehiculo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('placa', models.CharField(db_index=True, help_text='Identificador único del vehículo (ej. ABC-1234)', max_length=15, unique=True, verbose_name='Placa / Patente')),
                ('marca', models.CharField(help_text='Ej. Toyota', max_length=50, verbose_name='Marca')),
                ('modelo', models.CharField(help_text='Ej. Corolla', max_length=50, verbose_name='Modelo')),
                ('anio', models.PositiveIntegerField(help_text='Ej. 2020', verbose_name='Año de fabricación')),
                ('estado_inspeccion', models.CharField(choices=[('PENDIENTE', 'Pendiente'), ('INSPECCIONADO', 'Inspeccionado')], default='PENDIENTE', max_length=20, verbose_name='Estado de inspección')),
                ('fecha_registro', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de registro')),
                ('fecha_actualizacion', models.DateTimeField(auto_now=True, verbose_name='Última actualización')),
                ('propietario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vehiculos', to=settings.AUTH_USER_MODEL, verbose_name='Propietario del vehículo')),
            ],
            options={
                'verbose_name': 'Vehículo',
                'verbose_name_plural': 'Vehículos',
                'ordering': ['-fecha_registro'],
            },
        ),
    ]
