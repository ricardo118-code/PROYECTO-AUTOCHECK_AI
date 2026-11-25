from django.http import FileResponse
from rest_framework import views, permissions, status
from rest_framework.response import Response

from core.apps.analisis_ia.models import Inspeccion
from core.apps.vehiculos.models import Vehiculo
from .pdf_generator import generar_pdf_inspeccion_individual, generar_pdf_reporte_comparativo

class DescargarReporteIndividualView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, inspeccion_id):
        try:
            inspeccion = Inspeccion.objects.get(id=inspeccion_id)
        except Inspeccion.DoesNotExist:
            return Response(
                {"detail": "La inspección solicitada no existe."},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user.rol != 'ADMINISTRADOR':
            return Response(
                {"detail": "Acceso denegado. La generación de reportes oficiales está reservada exclusivamente al Administrador."},
                status=status.HTTP_403_FORBIDDEN
            )

        pdf_buffer = generar_pdf_inspeccion_individual(inspeccion)
        nombre_archivo = f"reporte_inspeccion_{inspeccion.vehiculo.placa}_{inspeccion.id}.pdf"

        return FileResponse(
            pdf_buffer,
            as_attachment=True,
            filename=nombre_archivo,
            content_type='application/pdf'
        )

class DescargarReporteComparativoView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        vehiculo_id = request.data.get('vehiculo_id')
        fecha_desde = request.data.get('fecha_desde')
        fecha_hasta = request.data.get('fecha_hasta')

        if not vehiculo_id:
            return Response(
                {"detail": "Se requiere el ID del vehículo."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            vehiculo = Vehiculo.objects.get(id=vehiculo_id)
        except Vehiculo.DoesNotExist:
            return Response(
                {"detail": "El vehículo no existe."},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user.rol != 'ADMINISTRADOR':
            return Response(
                {"detail": "Acceso denegado. La generación de reportes comparativos está reservada exclusivamente al Administrador."},
                status=status.HTTP_403_FORBIDDEN
            )

        if fecha_desde and fecha_hasta and fecha_desde > fecha_hasta:
            return Response(
                {"detail": "La fecha inicial de consulta no puede ser posterior a la fecha final."},
                status=status.HTTP_400_BAD_REQUEST
            )

        inspecciones = Inspeccion.objects.filter(
            vehiculo=vehiculo,
            estado=Inspeccion.Estado.COMPLETADA
        ).order_by('-fecha_inspeccion')

        if fecha_desde:
            inspecciones = inspecciones.filter(fecha_inspeccion__date__gte=fecha_desde)
        if fecha_hasta:
            inspecciones = inspecciones.filter(fecha_inspeccion__date__lte=fecha_hasta)

        if not inspecciones.exists():
            return Response(
                {"detail": "No se encontraron inspecciones en el rango de fechas seleccionado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        pdf_buffer = generar_pdf_reporte_comparativo(
            vehiculo=vehiculo,
            inspecciones=list(inspecciones),
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta
        )
        nombre_archivo = f"reporte_comparativo_{vehiculo.placa}.pdf"

        return FileResponse(
            pdf_buffer,
            as_attachment=True,
            filename=nombre_archivo,
            content_type='application/pdf'
        )
