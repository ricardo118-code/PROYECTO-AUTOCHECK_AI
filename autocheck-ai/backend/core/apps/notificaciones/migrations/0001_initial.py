
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
            name='Notificacion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=150, verbose_name='Título')),
                ('mensaje', models.TextField(verbose_name='Mensaje')),
                ('tipo', models.CharField(choices=[('VEHICULO', 'Vehículo'), ('INSPECCION', 'Inspección'), ('SEGURIDAD', 'Seguridad'), ('SISTEMA', 'Sistema')], default='SISTEMA', max_length=20, verbose_name='Tipo de notificación')),
                ('leida', models.BooleanField(default=False, verbose_name='Leída')),
                ('enlace_accion', models.CharField(blank=True, max_length=100, null=True, verbose_name='Enlace de acción')),
                ('metadata', models.JSONField(blank=True, default=dict, verbose_name='Metadatos')),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notificaciones', to=settings.AUTH_USER_MODEL, verbose_name='Destinatario')),
            ],
            options={
                'verbose_name': 'Notificación',
                'verbose_name_plural': 'Notificaciones',
                'ordering': ['-fecha_creacion'],
            },
        ),
    ]
