from .models import Notificacion

def crear_notificacion(usuarios, titulo, mensaje, tipo=Notificacion.Tipo.SISTEMA, enlace_accion=None, metadata=None):
    if metadata is None:
        metadata = {}
    if not hasattr(usuarios, '__iter__'):
        usuarios = [usuarios]

    registros = []
    for u in usuarios:
        if u and getattr(u, 'is_active', True):
            registros.append(
                Notificacion(
                    usuario=u,
                    titulo=titulo,
                    mensaje=mensaje,
                    tipo=tipo,
                    enlace_accion=enlace_accion,
                    metadata=metadata
                )
            )

    if registros:
        return Notificacion.objects.bulk_create(registros)
    return []
