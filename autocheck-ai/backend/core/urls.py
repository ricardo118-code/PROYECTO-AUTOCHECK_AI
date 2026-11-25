from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/v1/auth/', include('core.apps.usuarios.urls')),
    path('api/v1/vehiculos/', include('core.apps.vehiculos.urls')),
    path('api/v1/imagenes/', include('core.apps.imagenes.urls')),
    path('api/v1/analisis/', include('core.apps.analisis_ia.urls')),
    path('api/v1/historial/', include('core.apps.historial.urls')),
    path('api/v1/reportes/', include('core.apps.reportes.urls')),
    path('api/v1/notificaciones/', include('core.apps.notificaciones.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
