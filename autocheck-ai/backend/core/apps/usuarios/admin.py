from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    list_display = ('email', 'nombre_completo', 'rol', 'bloqueado', 'intentos_fallidos', 'is_active', 'is_staff')
    list_filter = ('rol', 'bloqueado', 'is_active')
    search_fields = ('email', 'nombre_completo')
    ordering = ('-fecha_creacion',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información Personal', {'fields': ('nombre_completo', 'rol')}),
        ('Seguridad y Acceso', {'fields': ('bloqueado', 'intentos_fallidos')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nombre_completo', 'rol', 'password'),
        }),
    )
