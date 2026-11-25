import cv2
import numpy as np
from rest_framework.exceptions import ValidationError

TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024
EXTENSIONES_PERMITIDAS = ['jpg', 'jpeg', 'png']
RESOLUCION_MINIMA_ANCHO = 800
RESOLUCION_MINIMA_ALTO = 600
UMBRAL_DESENFOQUE_LAPLACIANO = 80.0


def validar_archivo_subida(archivo):
    if archivo.size > TAMANO_MAXIMO_BYTES:
        raise ValidationError(
            f"El archivo excede el tamaño máximo permitido de 10 MB ({archivo.size / (1024*1024):.2f} MB)."
        )

    extension = archivo.name.split('.')[-1].lower()
    if extension not in EXTENSIONES_PERMITIDAS:
        raise ValidationError(
            f"Formato no permitido (. {extension}). Únicamente se aceptan imágenes JPG o PNG."
        )


def evaluar_calidad_opencv(archivo):
    archivo.seek(0)
    bytes_imagen = archivo.read()
    archivo.seek(0)

    np_arr = np.frombuffer(bytes_imagen, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        return False, "0x0", 0.0, "El archivo de imagen está dañado o no se pudo decodificar."

    alto, ancho = img.shape[:2]
    resolucion_str = f"{ancho}x{alto}"

    if ancho < RESOLUCION_MINIMA_ANCHO or alto < RESOLUCION_MINIMA_ALTO:
        return (
            False,
            resolucion_str,
            0.0,
            f"Resolución insuficiente ({resolucion_str}). Se requiere un mínimo de {RESOLUCION_MINIMA_ANCHO}x{RESOLUCION_MINIMA_ALTO} píxeles."
        )

    gris = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    score_nitidez = float(cv2.Laplacian(gris, cv2.CV_64F).var())

    if score_nitidez < UMBRAL_DESENFOQUE_LAPLACIANO:
        return (
            False,
            resolucion_str,
            score_nitidez,
            f"Desenfoque severo detectado (Nitidez: {score_nitidez:.1f}). La fotografía debe ser nítida y bien enfocada."
        )

    return True, resolucion_str, score_nitidez, None
