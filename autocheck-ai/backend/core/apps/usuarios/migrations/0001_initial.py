
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Usuario',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('email', models.EmailField(help_text='Correo utilizado para iniciar sesión', max_length=255, unique=True, verbose_name='Correo electrónico')),
                ('nombre_completo', models.CharField(max_length=150, verbose_name='Nombre completo')),
                ('rol', models.CharField(choices=[('PROPIETARIO', 'Propietario'), ('OPERADOR', 'Operador'), ('ADMINISTRADOR', 'Administrador')], default='PROPIETARIO', max_length=20, verbose_name='Rol de usuario')),
                ('intentos_fallidos', models.PositiveIntegerField(default=0, verbose_name='Intentos fallidos')),
                ('bloqueado', models.BooleanField(default=False, help_text='Indica si la cuenta se bloqueó por exceder 3 intentos fallidos', verbose_name='Cuenta bloqueada')),
                ('is_active', models.BooleanField(default=True, verbose_name='Activo')),
                ('is_staff', models.BooleanField(default=False, verbose_name='Staff')),
                ('fecha_creacion', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Fecha de creación')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'Usuario',
                'verbose_name_plural': 'Usuarios',
                'ordering': ['-fecha_creacion'],
            },
        ),
    ]
