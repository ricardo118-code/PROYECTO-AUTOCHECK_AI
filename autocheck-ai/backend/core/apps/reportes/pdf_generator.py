import io
import os
from PIL import Image as PILImage, ImageDraw, ImageFont
from django.utils import timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether, Image as RLImage
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.graphics.shapes import Drawing, Rect, Path

def crear_logo_autocheck(tamano=38):
    d = Drawing(tamano, tamano)
    r = tamano * 0.22
    d.add(Rect(0, 0, tamano, tamano, rx=r, ry=r, fillColor=colors.HexColor('#0F172A'), strokeColor=None))

    scale = (tamano * 0.58) / 24.0
    off_x = (tamano - 24.0 * scale) / 2.0
    off_y = (tamano - 24.0 * scale) / 2.0

    def tx(x):
        return off_x + x * scale

    def ty(y):
        return off_y + (24.0 - y) * scale

    p = Path(
        strokeColor=colors.HexColor('#3B82F6'),
        fillColor=None,
        strokeWidth=max(1.8, tamano * 0.05),
        strokeLineCap=1,
        strokeLineJoin=1
    )
    p.moveTo(tx(20), ty(13))
    p.curveTo(tx(20), ty(18), tx(16.5), ty(20.5), tx(12.34), ty(21.95))
    p.lineTo(tx(11.67), ty(21.94))
    p.curveTo(tx(7.5), ty(20.5), tx(4), ty(18), tx(4), ty(13))
    p.lineTo(tx(4), ty(6))
    p.curveTo(tx(4), ty(5.4), tx(4.4), ty(5), tx(5), ty(5))
    p.curveTo(tx(7), ty(5), tx(9.5), ty(3.8), tx(11.24), ty(2.28))
    p.curveTo(tx(11.8), ty(1.9), tx(12.2), ty(1.9), tx(12.76), ty(2.28))
    p.curveTo(tx(14.51), ty(3.81), tx(17), ty(5), tx(19), ty(5))
    p.curveTo(tx(19.6), ty(5), tx(20), ty(5.4), tx(20), ty(6))
    p.closePath()
    d.add(p)

    chk = Path(
        strokeColor=colors.HexColor('#3B82F6'),
        fillColor=None,
        strokeWidth=max(2.0, tamano * 0.055),
        strokeLineCap=1,
        strokeLineJoin=1
    )
    chk.moveTo(tx(9), ty(12))
    chk.lineTo(tx(11), ty(14))
    chk.lineTo(tx(15), ty(10))
    d.add(chk)

    return d

def procesar_imagen_reporte(img_obj, dets=None, max_ancho=250, max_alto=160):
    ruta_archivo = img_obj.archivo.path if hasattr(img_obj.archivo, 'path') else ""
    if not ruta_archivo or not os.path.exists(ruta_archivo):
        return None, 0, 0
    try:
        orig = PILImage.open(ruta_archivo).convert('RGB')
        orig_w, orig_h = orig.size

        aspect = orig_h / orig_w
        target_w = max_ancho
        target_h = target_w * aspect
        if target_h > max_alto:
            target_h = max_alto
            target_w = target_h / aspect

        render_w = int(target_w * 2)
        render_h = int(target_h * 2)
        pil_img = orig.resize((render_w, render_h), PILImage.Resampling.LANCZOS)

        danos = [d for d in (dets or []) if getattr(d, 'categoria', '') != 'SIN_DANO']
        if danos:
            draw = ImageDraw.Draw(pil_img)
            sx = render_w / orig_w
            sy = render_h / orig_h

            try:
                font = ImageFont.truetype("arialbd.ttf", 13)
            except Exception:
                try:
                    font = ImageFont.truetype("arial.ttf", 13)
                except Exception:
                    font = ImageFont.load_default()

            for d in danos:
                caja = getattr(d, 'coordenadas_caja', []) or []
                if isinstance(caja, (list, tuple)) and len(caja) == 4:
                    x1 = max(0, min(render_w - 1, float(caja[0]) * sx))
                    y1 = max(0, min(render_h - 1, float(caja[1]) * sy))
                    x2 = max(0, min(render_w, float(caja[2]) * sx))
                    y2 = max(0, min(render_h, float(caja[3]) * sy))
                    if (x2 - x1) < 8 or (y2 - y1) < 8:
                        x1, y1 = render_w * 0.25, render_h * 0.25
                        x2, y2 = render_w * 0.75, render_h * 0.75
                else:
                    x1, y1 = render_w * 0.25, render_h * 0.25
                    x2, y2 = render_w * 0.75, render_h * 0.75

                box_color = "#E11D48"
                draw.rectangle([x1, y1, x2, y2], outline=box_color, width=2)

                cat_txt = getattr(d, 'get_categoria_display', lambda: d.categoria)()
                conf_pct = int(getattr(d, 'confianza', 0.8) * 100)
                label = f"{cat_txt} {conf_pct}%"

                bbox = draw.textbbox((0, 0), label, font=font)
                tw = bbox[2] - bbox[0]
                th = bbox[3] - bbox[1]

                pad_x, pad_y = 5, 2
                tag_w = tw + pad_x * 2
                tag_h = th + pad_y * 2

                tag_x1 = max(2, min(render_w - tag_w - 2, x1))
                tag_y1 = y1 - tag_h - 2
                if tag_y1 < 2:
                    tag_y1 = y1 + 2

                tag_x2 = tag_x1 + tag_w
                tag_y2 = tag_y1 + tag_h

                draw.rounded_rectangle([tag_x1, tag_y1, tag_x2, tag_y2], radius=3, fill=box_color)
                draw.text((tag_x1 + pad_x, tag_y1 + pad_y - 1), label, fill="#FFFFFF", font=font)

        buf = io.BytesIO()
        pil_img.save(buf, format='JPEG', quality=92)
        buf.seek(0)
        return buf, target_w, target_h
    except Exception:
        return None, 0, 0

def generar_pdf_inspeccion_individual(inspeccion):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    titulo_brand_style = ParagraphStyle(
        'TituloBrand',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=17,
        textColor=colors.HexColor('#0F172A')
    )
    subtitulo_brand_style = ParagraphStyle(
        'SubtituloBrand',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#475569')
    )
    subtitulo_doc_style = ParagraphStyle(
        'SubtituloDoc',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#2563EB')
    )
    doc_type_style = ParagraphStyle(
        'DocType',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1E40AF'),
        alignment=TA_RIGHT
    )
    meta_style = ParagraphStyle(
        'MetaRight',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#64748B'),
        alignment=TA_RIGHT
    )
    seccion_style = ParagraphStyle(
        'SeccionTitulo',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=colors.HexColor('#1E40AF'),
        spaceBefore=8,
        spaceAfter=5
    )
    normal_style = ParagraphStyle(
        'TextoNormal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1F2937')
    )
    caption_style = ParagraphStyle(
        'TextoCaption',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#374151'),
        alignment=TA_CENTER
    )
    firmas_style = ParagraphStyle(
        'TextoFirmas',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1F2937'),
        alignment=TA_CENTER
    )
    disclaimer_style = ParagraphStyle(
        'TextoDisclaimer',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#64748B')
    )

    elementos = []

    v = inspeccion.vehiculo
    u = inspeccion.usuario_responsable
    f_insp_local = timezone.localtime(inspeccion.fecha_inspeccion)

    logo_rl = crear_logo_autocheck(38)

    left_brand_cell = Table([
        [
            logo_rl,
            [
                Paragraph("<b>AutoCheck AI</b>", titulo_brand_style),
                Paragraph("Sistema Inteligente de Inspección Vehicular", subtitulo_brand_style),
                Paragraph("INFORME TÉCNICO OFICIAL DE INSPECCIÓN", subtitulo_doc_style)
            ]
        ]
    ], colWidths=[44, 300])
    left_brand_cell.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))

    right_meta_cell = [
        Paragraph("<b>CERTIFICADO DE INSPECCIÓN</b>", doc_type_style),
        Paragraph(f"<b>Folio:</b> #CHK-{inspeccion.id:04d}", meta_style),
        Paragraph(f"<b>Fecha:</b> {f_insp_local.strftime('%d/%m/%Y %H:%M')}", meta_style),
        Paragraph(f"<b>Estado:</b> {inspeccion.get_estado_display().upper()}", meta_style)
    ]

    header_table = Table([[left_brand_cell, right_meta_cell]], colWidths=[350, 180])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    elementos.append(header_table)
    elementos.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#2563EB'), spaceBefore=6, spaceAfter=10))

    datos_resumen = [
        [
            Paragraph(f"<b>Placa / Patente:</b> {v.placa}", normal_style),
            Paragraph(f"<b>Fecha de Inspección:</b> {f_insp_local.strftime('%d/%m/%Y %H:%M')}", normal_style)
        ],
        [
            Paragraph(f"<b>Marca y Modelo:</b> {v.marca} {v.modelo}", normal_style),
            Paragraph(f"<b>Usuario Responsable:</b> {u.nombre_completo if u else 'N/A'}", normal_style)
        ],
        [
            Paragraph(f"<b>Año de Fabricación:</b> {v.anio}", normal_style),
            Paragraph(f"<b>Sistema de Diagnóstico:</b> AutoCheck AI Vision ({inspeccion.version_modelo or 'v1.3'})", normal_style)
        ],
        [
            Paragraph(f"<b>Propietario:</b> {v.propietario.nombre_completo}", normal_style),
            Paragraph(f"<b>Tiempo de Análisis:</b> {inspeccion.tiempo_total_seg:.1f} s", normal_style)
        ]
    ]

    tabla_datos = Table(datos_resumen, colWidths=[260, 270])
    tabla_datos.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    elementos.append(tabla_datos)
    elementos.append(Spacer(1, 8))

    elementos.append(Paragraph("Resultados del Análisis Visual de Carrocería", seccion_style))

    resultados = list(inspeccion.resultados.select_related('imagen').all())
    filas_tabla = [
        [
            Paragraph("<b>#</b>", normal_style),
            Paragraph("<b>Zona Evaluada</b>", normal_style),
            Paragraph("<b>Diagnóstico IA</b>", normal_style),
            Paragraph("<b>Confianza</b>", normal_style),
            Paragraph("<b>Tiempo (s)</b>", normal_style),
        ]
    ]

    for idx, r in enumerate(resultados, start=1):
        es_dano = r.categoria != 'SIN_DANO'
        diag_color = '#DC2626' if es_dano else '#16A34A'
        diag_p = Paragraph(f"<font color='{diag_color}'><b>{r.get_categoria_display()}</b></font>", normal_style)

        filas_tabla.append([
            str(idx),
            r.imagen.get_zona_display() if r.imagen else "Zona general",
            diag_p,
            f"{int(r.confianza * 100)}%",
            f"{r.tiempo_procesamiento_seg:.2f}s"
        ])

    tabla_resultados = Table(filas_tabla, colWidths=[30, 150, 160, 100, 90])
    tabla_resultados.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('PADDING', (0, 0), (-1, -1), 4.5),
    ]))
    elementos.append(tabla_resultados)
    elementos.append(Spacer(1, 8))

    imagenes_dict = {}
    for r in resultados:
        if r.imagen:
            if r.imagen not in imagenes_dict:
                imagenes_dict[r.imagen] = []
            imagenes_dict[r.imagen].append(r)

    if imagenes_dict:
        elementos.append(Paragraph("Evidencia Fotográfica y Detección de Anomalías", seccion_style))
        celdas_fotos = []
        fila_actual = []

        max_w = 250 if len(imagenes_dict) > 1 else 360
        max_h = 155 if len(imagenes_dict) > 1 else 215

        for img_obj, dets in imagenes_dict.items():
            buf_img, tw, th = procesar_imagen_reporte(img_obj, dets, max_ancho=max_w, max_alto=max_h)
            if buf_img:
                rl_img = RLImage(buf_img, width=tw, height=th)
                danos_texto = []
                for d in dets:
                    if d.categoria != 'SIN_DANO':
                        danos_texto.append(f"{d.get_categoria_display()} ({int(d.confianza * 100)}%)")

                if danos_texto:
                    caption_content = f"<b>Zona:</b> {img_obj.get_zona_display()}<br/><font color='#DC2626'><b>Anomalía(s):</b> {', '.join(danos_texto)}</font>"
                else:
                    caption_content = f"<b>Zona:</b> {img_obj.get_zona_display()}<br/><font color='#16A34A'><b>Estado:</b> Superficie óptima sin anomalías</font>"

                card_items = [
                    rl_img,
                    Spacer(1, 3),
                    Paragraph(caption_content, caption_style)
                ]
                card_tabla = Table([[card_items]], colWidths=[tw + 10])
                card_tabla.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
                    ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
                    ('PADDING', (0, 0), (-1, -1), 3.5),
                ]))

                if len(imagenes_dict) == 1:
                    celdas_fotos.append([card_tabla])
                else:
                    fila_actual.append(card_tabla)
                    if len(fila_actual) == 2:
                        celdas_fotos.append(fila_actual)
                        fila_actual = []

        if fila_actual:
            fila_actual.append(Paragraph("", normal_style))
            celdas_fotos.append(fila_actual)

        if celdas_fotos:
            col_widths = [530] if len(imagenes_dict) == 1 else [265, 265]
            grid_fotos = Table(celdas_fotos, colWidths=col_widths)
            grid_fotos.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ]))
            elementos.append(grid_fotos)
            elementos.append(Spacer(1, 8))

    total_danos = inspeccion.total_danos_detectados
    estado_texto = (
        f"Se detectaron <b>{total_danos} anomalía(s)</b> visuales en la carrocería del vehículo."
        if total_danos > 0
        else "No se detectaron daños visibles en las zonas inspeccionadas (Óptimo estado)."
    )

    bloque_cierre = []
    bloque_cierre.append(Paragraph(f"<b>Dictamen de Inspección:</b> {estado_texto}", normal_style))
    bloque_cierre.append(Spacer(1, 3))
    bloque_cierre.append(Paragraph(
        "<b>Certificación de Conformidad:</b> El propietario o responsable técnico certifica haber presenciado o recibido a conformidad "
        "el diagnóstico visual computarizado emitido por AutoCheck AI, validando las anomalías registradas en este documento oficial.",
        disclaimer_style
    ))
    bloque_cierre.append(Spacer(1, 40))

    nombre_inspector = u.nombre_completo if u else "Inspector Autorizado"
    nombre_propietario = v.propietario.nombre_completo if v.propietario else "Cliente / Propietario"

    datos_firmas = [
        [
            Paragraph(
                "_________________________________________<br/>"
                "<b>Firma del Responsable Técnico</b><br/>"
                f"<font size='8' color='#334155'>{nombre_inspector}</font><br/>"
                "<font size='7' color='#64748B'>AutoCheck AI Technical Staff</font>",
                firmas_style
            ),
            Paragraph(
                "_________________________________________<br/>"
                "<b>Firma de Conformidad del Propietario</b><br/>"
                f"<font size='8' color='#334155'>{nombre_propietario}</font><br/>"
                "<font size='7' color='#64748B'>Cliente / Propietario del Vehículo</font>",
                firmas_style
            )
        ]
    ]
    tabla_firmas = Table(datos_firmas, colWidths=[260, 270])
    tabla_firmas.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    bloque_cierre.append(tabla_firmas)

    elementos.append(KeepTogether(bloque_cierre))

    doc.build(elementos)
    buffer.seek(0)
    return buffer

def generar_pdf_reporte_comparativo(vehiculo, inspecciones, fecha_desde=None, fecha_hasta=None):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    titulo_brand_style = ParagraphStyle(
        'TituloBrandComp',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=17,
        textColor=colors.HexColor('#0F172A')
    )
    subtitulo_brand_style = ParagraphStyle(
        'SubtituloBrandComp',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#475569')
    )
    subtitulo_doc_style = ParagraphStyle(
        'SubtituloDocComp',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#2563EB')
    )
    doc_type_style = ParagraphStyle(
        'DocTypeComp',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1E40AF'),
        alignment=TA_RIGHT
    )
    meta_style = ParagraphStyle(
        'MetaRightComp',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#64748B'),
        alignment=TA_RIGHT
    )
    seccion_style = ParagraphStyle(
        'SeccionComp',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=colors.HexColor('#2563EB'),
        spaceBefore=10,
        spaceAfter=5
    )
    normal_style = ParagraphStyle(
        'TextoNormalComp',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1F2937')
    )
    firmas_style = ParagraphStyle(
        'TextoFirmasComp',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1F2937'),
        alignment=TA_CENTER
    )
    disclaimer_style = ParagraphStyle(
        'TextoDisclaimerComp',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#64748B')
    )

    normal_bold_center = ParagraphStyle(
        'TextoNormalBoldCenterComp',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1F2937'),
        alignment=TA_CENTER
    )
    normal_bold_left = ParagraphStyle(
        'TextoNormalBoldLeftComp',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1F2937'),
        alignment=TA_LEFT
    )
    normal_center = ParagraphStyle(
        'TextoCenterComp',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1F2937'),
        alignment=TA_CENTER
    )

    elementos = []

    logo_rl = crear_logo_autocheck(38)

    left_brand_cell = Table([
        [
            logo_rl,
            [
                Paragraph("<b>AutoCheck AI</b>", titulo_brand_style),
                Paragraph("Sistema Inteligente de Inspección Vehicular", subtitulo_brand_style),
                Paragraph("INFORME COMPARATIVO Y EVOLUTIVO DE DAÑOS", subtitulo_doc_style)
            ]
        ]
    ], colWidths=[44, 300])
    left_brand_cell.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))

    total_insp = len(inspecciones)
    ahora_local = timezone.localtime()

    right_meta_cell = [
        Paragraph("<b>AUDITORÍA TÉCNICA VEHICULAR</b>", doc_type_style),
        Paragraph(f"<b>Placa:</b> {vehiculo.placa}", meta_style),
        Paragraph(f"<b>Revisiones:</b> {total_insp} inspecciones", meta_style),
        Paragraph(f"<b>Emisión:</b> {ahora_local.strftime('%d/%m/%Y')}", meta_style)
    ]

    header_table = Table([[left_brand_cell, right_meta_cell]], colWidths=[350, 180])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    elementos.append(header_table)
    elementos.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#2563EB'), spaceBefore=6, spaceAfter=10))

    periodo_str = f"Desde {fecha_desde or 'Ingreso inicial'} hasta {fecha_hasta or 'Fecha actual'}"

    datos_vehiculo = [
        [
            Paragraph(f"<b>Placa / Patente:</b> {vehiculo.placa}", normal_style),
            Paragraph(f"<b>Período Evaluado:</b> {periodo_str}", normal_style)
        ],
        [
            Paragraph(f"<b>Marca y Modelo:</b> {vehiculo.marca} {vehiculo.modelo}", normal_style),
            Paragraph(f"<b>Total de Revisiones:</b> {total_insp} inspección(es)", normal_style)
        ],
        [
            Paragraph(f"<b>Año de Fabricación:</b> {vehiculo.anio}", normal_style),
            Paragraph("<b>Plataforma:</b> AutoCheck AI (v1.3)", normal_style)
        ],
        [
            Paragraph(f"<b>Propietario Registrado:</b> {vehiculo.propietario.nombre_completo}", normal_style),
            Paragraph(f"<b>Fecha de Reporte:</b> {ahora_local.strftime('%d/%m/%Y %H:%M')}", normal_style)
        ]
    ]
    tabla_vehiculo = Table(datos_vehiculo, colWidths=[260, 270])
    tabla_vehiculo.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    elementos.append(tabla_vehiculo)
    elementos.append(Spacer(1, 10))

    elementos.append(Paragraph("1. Resumen Cronológico de Inspecciones en el Período", seccion_style))

    inspecciones_cronologicas = sorted(inspecciones, key=lambda x: x.fecha_inspeccion)
    inspecciones_recientes_primero = list(reversed(inspecciones_cronologicas))

    filas_cronologia = [
        [
            Paragraph("<b>Fecha</b>", normal_bold_center),
            Paragraph("<b>Usuario Responsable</b>", normal_bold_center),
            Paragraph("<b>Daños Detectados</b>", normal_bold_center),
            Paragraph("<b>Tecnología</b>", normal_bold_center),
            Paragraph("<b>Tiempo</b>", normal_bold_center),
        ]
    ]

    for insp in inspecciones_recientes_primero:
        f_local = timezone.localtime(insp.fecha_inspeccion)
        insp_usuario = insp.usuario_responsable
        nombre_insp = insp_usuario.nombre_completo if insp_usuario else 'Responsable Técnico'
        danos_count = insp.total_danos_detectados
        if danos_count == 0:
            danos_p = Paragraph("<font color='#16A34A'><b>0 daño(s)</b></font>", normal_center)
        else:
            danos_p = Paragraph(f"<font color='#DC2626'><b>{danos_count} daño(s)</b></font>", normal_center)

        filas_cronologia.append([
            Paragraph(f_local.strftime('%d/%m/%Y %H:%M'), normal_center),
            Paragraph(nombre_insp, normal_center),
            danos_p,
            Paragraph(f"AutoCheck AI ({insp.version_modelo or 'v1.3'})", normal_center),
            Paragraph(f"{insp.tiempo_total_seg:.1f}s", normal_center)
        ])

    tabla_crono = Table(filas_cronologia, colWidths=[110, 150, 110, 92, 70])
    tabla_crono.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EBF2FE')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    elementos.append(tabla_crono)
    elementos.append(Spacer(1, 10))

    elementos.append(Paragraph("2. Matriz de Variación y Evolución por Zona Exterior", seccion_style))

    insp_inicial = inspecciones_cronologicas[0]
    insp_reciente = inspecciones_cronologicas[-1]

    fecha_ini_str = timezone.localtime(insp_inicial.fecha_inspeccion).strftime('%d/%m/%Y')
    fecha_rec_str = timezone.localtime(insp_reciente.fecha_inspeccion).strftime('%d/%m/%Y')

    filas_matriz = [
        [
            Paragraph("<b>Zona de Carrocería</b>", normal_bold_left),
            Paragraph(f"<b>Estado Inicial ({fecha_ini_str})</b>", normal_bold_left),
            Paragraph(f"<b>Estado Reciente ({fecha_rec_str})</b>", normal_bold_left),
            Paragraph("<b>Evolución / Variación</b>", normal_bold_left),
        ]
    ]

    zonas_map = {
        'FRONTAL': 'Frontal',
        'POSTERIOR': 'Posterior',
        'LATERAL_IZQUIERDO': 'Lateral Izquierdo',
        'LATERAL_DERECHO': 'Lateral Derecho',
        'TECHO': 'Techo',
    }

    total_nuevos = 0
    total_reparados = 0
    es_primera_inspeccion = (len(inspecciones_cronologicas) == 1)

    for z_code, z_name in zonas_map.items():
        danos_ini = []
        if insp_inicial:
            for r in insp_inicial.resultados.select_related('imagen').all():
                if r.imagen and r.imagen.zona == z_code and r.categoria != 'SIN_DANO':
                    danos_ini.append(r.get_categoria_display())

        danos_rec = []
        if not es_primera_inspeccion and insp_reciente:
            for r in insp_reciente.resultados.select_related('imagen').all():
                if r.imagen and r.imagen.zona == z_code and r.categoria != 'SIN_DANO':
                    danos_rec.append(r.get_categoria_display())

        if es_primera_inspeccion:
            if danos_ini:
                txt_ini = ", ".join(danos_ini)
                txt_rec = ", ".join(danos_ini)
                evolucion = "<font color='#2563EB'><b>RECEPCIÓN TÉCNICA</b></font>"
                filas_matriz.append([
                    Paragraph(f"<b>{z_name}</b>", normal_style),
                    Paragraph(txt_ini, normal_style),
                    Paragraph(txt_rec, normal_style),
                    Paragraph(evolucion, normal_style)
                ])
        else:
            if danos_ini and not danos_rec:
                txt_ini = ", ".join(danos_ini)
                txt_rec = "Sin daño (Óptimo)"
                daños_rep_str = ", ".join(sorted(set(danos_ini)))
                evolucion = f"<font color='#16A34A'><b>REPARADO ({daños_rep_str})</b></font>"
                total_reparados += len(danos_ini)
                filas_matriz.append([
                    Paragraph(f"<b>{z_name}</b>", normal_style),
                    Paragraph(txt_ini, normal_style),
                    Paragraph(txt_rec, normal_style),
                    Paragraph(evolucion, normal_style)
                ])
            elif danos_ini and danos_rec:
                txt_ini = ", ".join(danos_ini)
                txt_rec = ", ".join(danos_rec)
                daños_rec_str = ", ".join(sorted(set(danos_rec)))
                evolucion = f"<font color='#D97706'><b>PERSISTE ({daños_rec_str})</b></font>"
                filas_matriz.append([
                    Paragraph(f"<b>{z_name}</b>", normal_style),
                    Paragraph(txt_ini, normal_style),
                    Paragraph(txt_rec, normal_style),
                    Paragraph(evolucion, normal_style)
                ])
            elif not danos_ini and danos_rec:
                txt_ini = "Sin daño previo"
                txt_rec = ", ".join(danos_rec)
                daños_rec_str = ", ".join(sorted(set(danos_rec)))
                evolucion = f"<font color='#DC2626'><b>NUEVO DAÑO ({daños_rec_str})</b></font>"
                total_nuevos += len(danos_rec)
                filas_matriz.append([
                    Paragraph(f"<b>{z_name}</b>", normal_style),
                    Paragraph(txt_ini, normal_style),
                    Paragraph(txt_rec, normal_style),
                    Paragraph(evolucion, normal_style)
                ])

    if len(filas_matriz) == 1:
        filas_matriz.append([
            Paragraph("<b>Carrocería exterior</b>", normal_style),
            Paragraph("Sin anomalías previas", normal_style),
            Paragraph("Sin daño (Óptimo)", normal_style),
            Paragraph("<font color='#16A34A'><b>SIN VARIACIÓN (ÓPTIMO)</b></font>", normal_style)
        ])

    tabla_matriz = Table(filas_matriz, colWidths=[120, 130, 130, 152])
    tabla_matriz.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EBF2FE')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    elementos.append(tabla_matriz)
    elementos.append(Spacer(1, 10))

    bloque_cierre_comp = []
    bloque_cierre_comp.append(Paragraph("3. Dictamen Técnico y Auditoría", seccion_style))
    dictamen_texto = (
        f"Durante el período analizado se registraron <b>{total_nuevos} nuevo(s) daño(s)</b> en la carrocería y "
        f"<b>{total_reparados} daño(s) reparado(s)</b>. Este reporte constituye evidencia objetiva y formal para "
        f"control de calidad vehicular y auditorías técnicas según los estándares de AutoCheck AI."
    )
    bloque_cierre_comp.append(Paragraph(dictamen_texto, normal_style))
    bloque_cierre_comp.append(Spacer(1, 3))
    bloque_cierre_comp.append(Paragraph(
        "<b>Auditoría y Validación Técnica:</b> El presente informe comparativo acredita la trazabilidad histórica de carrocería del vehículo, "
        "respaldando el dictamen técnico para aseguradoras, empresas del sector y propietarios de acuerdo con la normativa vigente.",
        disclaimer_style
    ))
    bloque_cierre_comp.append(Spacer(1, 40))

    nombre_propietario_comp = vehiculo.propietario.nombre_completo if vehiculo.propietario else "Cliente / Propietario"

    datos_firmas = [
        [
            Paragraph(
                "_________________________________________<br/>"
                "<b>Firma del Auditor / Responsable Técnico</b><br/>"
                "<font size='8' color='#334155'>AutoCheck AI Technical Staff</font><br/>"
                "<font size='7' color='#64748B'>Control de Calidad y Peritaje Vehicular</font>",
                firmas_style
            ),
            Paragraph(
                "_________________________________________<br/>"
                "<b>Firma de Conformidad del Propietario</b><br/>"
                f"<font size='8' color='#334155'>{nombre_propietario_comp}</font><br/>"
                "<font size='7' color='#64748B'>Cliente / Propietario del Vehículo</font>",
                firmas_style
            )
        ]
    ]
    tabla_firmas = Table(datos_firmas, colWidths=[260, 270])
    tabla_firmas.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    bloque_cierre_comp.append(tabla_firmas)

    elementos.append(KeepTogether(bloque_cierre_comp))

    doc.build(elementos)
    buffer.seek(0)
    return buffer
