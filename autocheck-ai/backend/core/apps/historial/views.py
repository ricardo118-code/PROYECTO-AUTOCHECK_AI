from django.utils import timezone
from rest_framework import views, permissions, status
from rest_framework.response import Response
from core.apps.analisis_ia.models import Inspeccion, ResultadoAnalisis
from core.apps.analisis_ia.serializers import InspeccionSerializer
from core.apps.vehiculos.models import Vehiculo

class HistorialVehiculoView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, vehiculo_id):
        try:
            vehiculo = Vehiculo.objects.get(id=vehiculo_id)
        except Vehiculo.DoesNotExist:
            return Response({"detail": "Vehículo no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        inspecciones = Inspeccion.objects.filter(
            vehiculo=vehiculo,
            estado=Inspeccion.Estado.COMPLETADA
        ).order_by('-fecha_inspeccion', '-id')

        datos = []
        for insp in inspecciones:
            meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"]
            f = timezone.localtime(insp.fecha_inspeccion)
            hora = f.strftime("%H:%M")
            fecha_formateada = f"{f.day:02d} {meses[f.month - 1]} {f.year} · {hora}"

            categorias_unicas = insp.resultados.exclude(
                categoria=ResultadoAnalisis.CategoriaDano.SIN_DANO
            ).values_list('categoria', flat=True).distinct()
            
            num_categorias = len(categorias_unicas)
            subtitulo = f"{num_categorias} categoría{'s' if num_categorias != 1 else ''} detectada{'s' if num_categorias != 1 else ''}"

            u_resp = insp.usuario_responsable
            nombre_inspector = u_resp.nombre_completo if u_resp and u_resp.nombre_completo else (u_resp.email if u_resp else "Inspector técnico")

            datos.append({
                "id": insp.id,
                "fecha_legible": fecha_formateada,
                "subtitulo": subtitulo,
                "total_danos": insp.total_danos_detectados,
                "tiempo_seg": insp.tiempo_total_seg,
                "version_modelo": insp.version_modelo or "v1.3",
                "usuario_responsable": nombre_inspector,
                "inspeccion_completa": InspeccionSerializer(insp, context={'request': request}).data
            })

        return Response({
            "vehiculo": {
                "id": vehiculo.id,
                "placa": vehiculo.placa,
                "marca_modelo": f"{vehiculo.marca} {vehiculo.modelo}",
                "anio": vehiculo.anio
            },
            "total_inspecciones": len(datos),
            "historial": datos
        })

class CompararInspeccionesView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        id_1 = request.data.get('inspeccion_1_id')
        id_2 = request.data.get('inspeccion_2_id')

        if not id_1 or not id_2:
            return Response(
                {"detail": "Se requieren los IDs de las dos inspecciones a comparar."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if str(id_1) == str(id_2):
            return Response(
                {"detail": "Debes seleccionar dos inspecciones distintas para contrastar la evolución de la carrocería."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            insp_reciente = Inspeccion.objects.get(id=id_1)
            insp_anterior = Inspeccion.objects.get(id=id_2)
        except Inspeccion.DoesNotExist:
            return Response({"detail": "Una o ambas inspecciones no existen."}, status=status.HTTP_404_NOT_FOUND)

        if insp_reciente.vehiculo_id != insp_anterior.vehiculo_id:
            return Response(
                {"detail": "Las inspecciones seleccionadas deben pertenecer al mismo vehículo."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if insp_reciente.fecha_inspeccion < insp_anterior.fecha_inspeccion or (
            insp_reciente.fecha_inspeccion == insp_anterior.fecha_inspeccion and insp_reciente.id < insp_anterior.id
        ):
            insp_reciente, insp_anterior = insp_anterior, insp_reciente

        meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"]
        f1 = timezone.localtime(insp_reciente.fecha_inspeccion)
        f2 = timezone.localtime(insp_anterior.fecha_inspeccion)
        hora_1 = f1.strftime("%H:%M")
        hora_2 = f2.strftime("%H:%M")
        fecha_1_str = f"{f1.day:02d} {meses[f1.month - 1]} {f1.year} · {hora_1}"
        fecha_2_str = f"{f2.day:02d} {meses[f2.month - 1]} {f2.year} · {hora_2}"

        def obtener_danos(insp):
            res_list = []
            for r in insp.resultados.all():
                if r.categoria != ResultadoAnalisis.CategoriaDano.SIN_DANO:
                    zona = r.imagen.get_zona_display() if r.imagen else ""
                    cat_display = r.get_categoria_display()
                    item_texto = f"{cat_display} ({zona})" if zona else cat_display
                    res_list.append({
                        "categoria": cat_display,
                        "zona": zona,
                        "item_texto": item_texto,
                        "confianza": f"{int(r.confianza * 100)}%",
                        "es_dano": True
                    })
            return res_list

        danos_recientes = obtener_danos(insp_reciente)
        danos_anteriores = obtener_danos(insp_anterior)

        zonas_anteriores_con_dano = {
            f"{d['categoria']} en {d['zona'].lower()}" for d in danos_anteriores if d['es_dano']
        }
        
        nuevos_danos = []
        for d in danos_recientes:
            clave = f"{d['categoria']} en {d['zona'].lower()}"
            if d['es_dano'] and clave not in zonas_anteriores_con_dano:
                nuevos_danos.append(clave)

        if nuevos_danos:
            alerta_diferencial = f"Nuevo daño detectado: {', '.join(nuevos_danos)}"
        else:
            alerta_diferencial = "No se detectaron nuevos daños entre estas dos inspecciones."

        return Response({
            "vehiculo_placa": insp_reciente.vehiculo.placa,
            "inspeccion_reciente": {
                "id": insp_reciente.id,
                "fecha": fecha_1_str,
                "fecha_iso": f1.strftime("%Y-%m-%d"),
                "hora": hora_1,
                "items": [d["item_texto"] for d in danos_recientes]
            },
            "inspeccion_anterior": {
                "id": insp_anterior.id,
                "fecha": fecha_2_str,
                "fecha_iso": f2.strftime("%Y-%m-%d"),
                "hora": hora_2,
                "items": [d["item_texto"] for d in danos_anteriores]
            },
            "fecha_desde": f2.strftime("%Y-%m-%d"),
            "fecha_hasta": f1.strftime("%Y-%m-%d"),
            "alerta_diferencial": alerta_diferencial,
            "tiene_danos_nuevos": len(nuevos_danos) > 0,
            "nuevos_danos": nuevos_danos
        })
