--
-- PostgreSQL database dump
--

--restrict YNOdE7sRgiG8NPQ17DTWd1XnxHSnZlxhmjO0Q6ZWwLfO30vkSLTF4PjFpE8eg7F

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.vehiculos_vehiculo DROP CONSTRAINT IF EXISTS vehiculos_vehiculo_propietario_id_8fa2d7e8_fk_usuarios_;
ALTER TABLE IF EXISTS ONLY public.usuarios_usuario_user_permissions DROP CONSTRAINT IF EXISTS usuarios_usuario_use_usuario_id_60aeea80_fk_usuarios_;
ALTER TABLE IF EXISTS ONLY public.usuarios_usuario_user_permissions DROP CONSTRAINT IF EXISTS usuarios_usuario_use_permission_id_4e5c0f2f_fk_auth_perm;
ALTER TABLE IF EXISTS ONLY public.usuarios_usuario_groups DROP CONSTRAINT IF EXISTS usuarios_usuario_groups_group_id_e77f6dcf_fk_auth_group_id;
ALTER TABLE IF EXISTS ONLY public.usuarios_usuario_groups DROP CONSTRAINT IF EXISTS usuarios_usuario_gro_usuario_id_7a34077f_fk_usuarios_;
ALTER TABLE IF EXISTS ONLY public.notificaciones_notificacion DROP CONSTRAINT IF EXISTS notificaciones_notif_usuario_id_4bc090a3_fk_usuarios_;
ALTER TABLE IF EXISTS ONLY public.imagenes_imagenvehiculo DROP CONSTRAINT IF EXISTS imagenes_imagenvehic_vehiculo_id_9ef6a8d9_fk_vehiculos;
ALTER TABLE IF EXISTS ONLY public.imagenes_imagenvehiculo DROP CONSTRAINT IF EXISTS imagenes_imagenvehic_usuario_id_17343428_fk_usuarios_;
ALTER TABLE IF EXISTS ONLY public.django_admin_log DROP CONSTRAINT IF EXISTS django_admin_log_user_id_c564eba6_fk_usuarios_usuario_id;
ALTER TABLE IF EXISTS ONLY public.django_admin_log DROP CONSTRAINT IF EXISTS django_admin_log_content_type_id_c4bce8eb_fk_django_co;
ALTER TABLE IF EXISTS ONLY public.auth_permission DROP CONSTRAINT IF EXISTS auth_permission_content_type_id_2f476e4b_fk_django_co;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissions_group_id_b120cbf9_fk_auth_group_id;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissio_permission_id_84c5c92e_fk_auth_perm;
ALTER TABLE IF EXISTS ONLY public.analisis_ia_resultadoanalisis DROP CONSTRAINT IF EXISTS analisis_ia_resultad_inspeccion_id_6b18cdf2_fk_analisis_;
ALTER TABLE IF EXISTS ONLY public.analisis_ia_resultadoanalisis DROP CONSTRAINT IF EXISTS analisis_ia_resultad_imagen_id_c94767bf_fk_imagenes_;
ALTER TABLE IF EXISTS ONLY public.analisis_ia_inspeccion DROP CONSTRAINT IF EXISTS analisis_ia_inspecci_vehiculo_id_f7520f15_fk_vehiculos;
ALTER TABLE IF EXISTS ONLY public.analisis_ia_inspeccion DROP CONSTRAINT IF EXISTS analisis_ia_inspecci_usuario_responsable__301e0dab_fk_usuarios_;
DROP INDEX IF EXISTS public.vehiculos_vehiculo_propietario_id_8fa2d7e8;
DROP INDEX IF EXISTS public.vehiculos_vehiculo_placa_37ead472_like;
DROP INDEX IF EXISTS public.usuarios_usuario_user_permissions_usuario_id_60aeea80;
DROP INDEX IF EXISTS public.usuarios_usuario_user_permissions_permission_id_4e5c0f2f;
DROP INDEX IF EXISTS public.usuarios_usuario_groups_usuario_id_7a34077f;
DROP INDEX IF EXISTS public.usuarios_usuario_groups_group_id_e77f6dcf;
DROP INDEX IF EXISTS public.usuarios_usuario_email_0a82e5f9_like;
DROP INDEX IF EXISTS public.notificaciones_notificacion_usuario_id_4bc090a3;
DROP INDEX IF EXISTS public.imagenes_imagenvehiculo_vehiculo_id_9ef6a8d9;
DROP INDEX IF EXISTS public.imagenes_imagenvehiculo_usuario_id_17343428;
DROP INDEX IF EXISTS public.django_session_session_key_c0390e0f_like;
DROP INDEX IF EXISTS public.django_session_expire_date_a5c62663;
DROP INDEX IF EXISTS public.django_admin_log_user_id_c564eba6;
DROP INDEX IF EXISTS public.django_admin_log_content_type_id_c4bce8eb;
DROP INDEX IF EXISTS public.auth_permission_content_type_id_2f476e4b;
DROP INDEX IF EXISTS public.auth_group_permissions_permission_id_84c5c92e;
DROP INDEX IF EXISTS public.auth_group_permissions_group_id_b120cbf9;
DROP INDEX IF EXISTS public.auth_group_name_a6ea08ec_like;
DROP INDEX IF EXISTS public.analisis_ia_resultadoanalisis_inspeccion_id_6b18cdf2;
DROP INDEX IF EXISTS public.analisis_ia_resultadoanalisis_imagen_id_c94767bf;
DROP INDEX IF EXISTS public.analisis_ia_inspeccion_vehiculo_id_f7520f15;
DROP INDEX IF EXISTS public.analisis_ia_inspeccion_usuario_responsable_id_301e0dab;
ALTER TABLE IF EXISTS ONLY public.vehiculos_vehiculo DROP CONSTRAINT IF EXISTS vehiculos_vehiculo_placa_key;
ALTER TABLE IF EXISTS ONLY public.vehiculos_vehiculo DROP CONSTRAINT IF EXISTS vehiculos_vehiculo_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios_usuario_user_permissions DROP CONSTRAINT IF EXISTS usuarios_usuario_user_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios_usuario_user_permissions DROP CONSTRAINT IF EXISTS usuarios_usuario_user_pe_usuario_id_permission_id_217cadcd_uniq;
ALTER TABLE IF EXISTS ONLY public.usuarios_usuario DROP CONSTRAINT IF EXISTS usuarios_usuario_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios_usuario_groups DROP CONSTRAINT IF EXISTS usuarios_usuario_groups_usuario_id_group_id_4ed5b09e_uniq;
ALTER TABLE IF EXISTS ONLY public.usuarios_usuario_groups DROP CONSTRAINT IF EXISTS usuarios_usuario_groups_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios_usuario DROP CONSTRAINT IF EXISTS usuarios_usuario_email_key;
ALTER TABLE IF EXISTS ONLY public.notificaciones_notificacion DROP CONSTRAINT IF EXISTS notificaciones_notificacion_pkey;
ALTER TABLE IF EXISTS ONLY public.imagenes_imagenvehiculo DROP CONSTRAINT IF EXISTS imagenes_imagenvehiculo_pkey;
ALTER TABLE IF EXISTS ONLY public.django_session DROP CONSTRAINT IF EXISTS django_session_pkey;
ALTER TABLE IF EXISTS ONLY public.django_migrations DROP CONSTRAINT IF EXISTS django_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.django_content_type DROP CONSTRAINT IF EXISTS django_content_type_pkey;
ALTER TABLE IF EXISTS ONLY public.django_content_type DROP CONSTRAINT IF EXISTS django_content_type_app_label_model_76bd3d3b_uniq;
ALTER TABLE IF EXISTS ONLY public.django_admin_log DROP CONSTRAINT IF EXISTS django_admin_log_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_permission DROP CONSTRAINT IF EXISTS auth_permission_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_permission DROP CONSTRAINT IF EXISTS auth_permission_content_type_id_codename_01ab375a_uniq;
ALTER TABLE IF EXISTS ONLY public.auth_group DROP CONSTRAINT IF EXISTS auth_group_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissions_group_id_permission_id_0cd325b0_uniq;
ALTER TABLE IF EXISTS ONLY public.auth_group DROP CONSTRAINT IF EXISTS auth_group_name_key;
ALTER TABLE IF EXISTS ONLY public.analisis_ia_resultadoanalisis DROP CONSTRAINT IF EXISTS analisis_ia_resultadoanalisis_pkey;
ALTER TABLE IF EXISTS ONLY public.analisis_ia_inspeccion DROP CONSTRAINT IF EXISTS analisis_ia_inspeccion_pkey;
DROP TABLE IF EXISTS public.vehiculos_vehiculo;
DROP TABLE IF EXISTS public.usuarios_usuario_user_permissions;
DROP TABLE IF EXISTS public.usuarios_usuario_groups;
DROP TABLE IF EXISTS public.usuarios_usuario;
DROP TABLE IF EXISTS public.notificaciones_notificacion;
DROP TABLE IF EXISTS public.imagenes_imagenvehiculo;
DROP TABLE IF EXISTS public.django_session;
DROP TABLE IF EXISTS public.django_migrations;
DROP TABLE IF EXISTS public.django_content_type;
DROP TABLE IF EXISTS public.django_admin_log;
DROP TABLE IF EXISTS public.auth_permission;
DROP TABLE IF EXISTS public.auth_group_permissions;
DROP TABLE IF EXISTS public.auth_group;
DROP TABLE IF EXISTS public.analisis_ia_resultadoanalisis;
DROP TABLE IF EXISTS public.analisis_ia_inspeccion;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: analisis_ia_inspeccion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analisis_ia_inspeccion (
    id bigint NOT NULL,
    fecha_inspeccion timestamp with time zone NOT NULL,
    version_modelo character varying(50) NOT NULL,
    tiempo_total_seg double precision NOT NULL,
    total_danos_detectados integer NOT NULL,
    estado character varying(20) NOT NULL,
    usuario_responsable_id bigint,
    vehiculo_id bigint NOT NULL,
    CONSTRAINT analisis_ia_inspeccion_total_danos_detectados_check CHECK ((total_danos_detectados >= 0))
);


ALTER TABLE public.analisis_ia_inspeccion OWNER TO postgres;

--
-- Name: analisis_ia_inspeccion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.analisis_ia_inspeccion ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.analisis_ia_inspeccion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: analisis_ia_resultadoanalisis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analisis_ia_resultadoanalisis (
    id bigint NOT NULL,
    categoria character varying(30) NOT NULL,
    confianza double precision NOT NULL,
    coordenadas_caja jsonb NOT NULL,
    tiempo_procesamiento_seg double precision NOT NULL,
    fecha_analisis timestamp with time zone NOT NULL,
    imagen_id bigint NOT NULL,
    inspeccion_id bigint NOT NULL
);


ALTER TABLE public.analisis_ia_resultadoanalisis OWNER TO postgres;

--
-- Name: analisis_ia_resultadoanalisis_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.analisis_ia_resultadoanalisis ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.analisis_ia_resultadoanalisis_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO postgres;

--
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_group ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO postgres;

--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_group_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


ALTER TABLE public.auth_permission OWNER TO postgres;

--
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_permission ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_admin_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_admin_log (
    id integer NOT NULL,
    action_time timestamp with time zone NOT NULL,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag smallint NOT NULL,
    change_message text NOT NULL,
    content_type_id integer,
    user_id bigint NOT NULL,
    CONSTRAINT django_admin_log_action_flag_check CHECK ((action_flag >= 0))
);


ALTER TABLE public.django_admin_log OWNER TO postgres;

--
-- Name: django_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_admin_log ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_admin_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO postgres;

--
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_content_type ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_content_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_migrations (
    id bigint NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


ALTER TABLE public.django_migrations OWNER TO postgres;

--
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_migrations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO postgres;

--
-- Name: imagenes_imagenvehiculo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.imagenes_imagenvehiculo (
    id bigint NOT NULL,
    zona character varying(30) NOT NULL,
    archivo character varying(100) NOT NULL,
    tamano_mb double precision NOT NULL,
    resolucion character varying(50) NOT NULL,
    score_nitidez double precision NOT NULL,
    estado_calidad character varying(20) NOT NULL,
    motivo_rechazo text,
    fecha_carga timestamp with time zone NOT NULL,
    usuario_id bigint,
    vehiculo_id bigint NOT NULL
);


ALTER TABLE public.imagenes_imagenvehiculo OWNER TO postgres;

--
-- Name: imagenes_imagenvehiculo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.imagenes_imagenvehiculo ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.imagenes_imagenvehiculo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notificaciones_notificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificaciones_notificacion (
    id bigint NOT NULL,
    titulo character varying(150) NOT NULL,
    mensaje text NOT NULL,
    tipo character varying(20) NOT NULL,
    leida boolean NOT NULL,
    enlace_accion character varying(100),
    metadata jsonb NOT NULL,
    fecha_creacion timestamp with time zone NOT NULL,
    usuario_id bigint NOT NULL
);


ALTER TABLE public.notificaciones_notificacion OWNER TO postgres;

--
-- Name: notificaciones_notificacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.notificaciones_notificacion ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notificaciones_notificacion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuarios_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios_usuario (
    id bigint NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean NOT NULL,
    email character varying(255) NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    rol character varying(20) NOT NULL,
    intentos_fallidos integer NOT NULL,
    bloqueado boolean NOT NULL,
    is_active boolean NOT NULL,
    is_staff boolean NOT NULL,
    fecha_creacion timestamp with time zone NOT NULL,
    CONSTRAINT usuarios_usuario_intentos_fallidos_check CHECK ((intentos_fallidos >= 0))
);


ALTER TABLE public.usuarios_usuario OWNER TO postgres;

--
-- Name: usuarios_usuario_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios_usuario_groups (
    id bigint NOT NULL,
    usuario_id bigint NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.usuarios_usuario_groups OWNER TO postgres;

--
-- Name: usuarios_usuario_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.usuarios_usuario_groups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.usuarios_usuario_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.usuarios_usuario ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.usuarios_usuario_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuarios_usuario_user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios_usuario_user_permissions (
    id bigint NOT NULL,
    usuario_id bigint NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.usuarios_usuario_user_permissions OWNER TO postgres;

--
-- Name: usuarios_usuario_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.usuarios_usuario_user_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.usuarios_usuario_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: vehiculos_vehiculo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehiculos_vehiculo (
    id bigint NOT NULL,
    placa character varying(15) NOT NULL,
    marca character varying(50) NOT NULL,
    modelo character varying(50) NOT NULL,
    anio integer NOT NULL,
    estado_inspeccion character varying(20) NOT NULL,
    fecha_registro timestamp with time zone NOT NULL,
    fecha_actualizacion timestamp with time zone NOT NULL,
    propietario_id bigint NOT NULL,
    CONSTRAINT vehiculos_vehiculo_anio_check CHECK ((anio >= 0))
);


ALTER TABLE public.vehiculos_vehiculo OWNER TO postgres;

--
-- Name: vehiculos_vehiculo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.vehiculos_vehiculo ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.vehiculos_vehiculo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: analisis_ia_inspeccion; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: analisis_ia_resultadoanalisis; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.auth_permission VALUES (1, 'Can add log entry', 1, 'add_logentry');
INSERT INTO public.auth_permission VALUES (2, 'Can change log entry', 1, 'change_logentry');
INSERT INTO public.auth_permission VALUES (3, 'Can delete log entry', 1, 'delete_logentry');
INSERT INTO public.auth_permission VALUES (4, 'Can view log entry', 1, 'view_logentry');
INSERT INTO public.auth_permission VALUES (5, 'Can add permission', 2, 'add_permission');
INSERT INTO public.auth_permission VALUES (6, 'Can change permission', 2, 'change_permission');
INSERT INTO public.auth_permission VALUES (7, 'Can delete permission', 2, 'delete_permission');
INSERT INTO public.auth_permission VALUES (8, 'Can view permission', 2, 'view_permission');
INSERT INTO public.auth_permission VALUES (9, 'Can add group', 3, 'add_group');
INSERT INTO public.auth_permission VALUES (10, 'Can change group', 3, 'change_group');
INSERT INTO public.auth_permission VALUES (11, 'Can delete group', 3, 'delete_group');
INSERT INTO public.auth_permission VALUES (12, 'Can view group', 3, 'view_group');
INSERT INTO public.auth_permission VALUES (13, 'Can add content type', 4, 'add_contenttype');
INSERT INTO public.auth_permission VALUES (14, 'Can change content type', 4, 'change_contenttype');
INSERT INTO public.auth_permission VALUES (15, 'Can delete content type', 4, 'delete_contenttype');
INSERT INTO public.auth_permission VALUES (16, 'Can view content type', 4, 'view_contenttype');
INSERT INTO public.auth_permission VALUES (17, 'Can add session', 5, 'add_session');
INSERT INTO public.auth_permission VALUES (18, 'Can change session', 5, 'change_session');
INSERT INTO public.auth_permission VALUES (19, 'Can delete session', 5, 'delete_session');
INSERT INTO public.auth_permission VALUES (20, 'Can view session', 5, 'view_session');
INSERT INTO public.auth_permission VALUES (21, 'Can add Usuario', 6, 'add_usuario');
INSERT INTO public.auth_permission VALUES (22, 'Can change Usuario', 6, 'change_usuario');
INSERT INTO public.auth_permission VALUES (23, 'Can delete Usuario', 6, 'delete_usuario');
INSERT INTO public.auth_permission VALUES (24, 'Can view Usuario', 6, 'view_usuario');
INSERT INTO public.auth_permission VALUES (25, 'Can add Veh├¡culo', 7, 'add_vehiculo');
INSERT INTO public.auth_permission VALUES (26, 'Can change Veh├¡culo', 7, 'change_vehiculo');
INSERT INTO public.auth_permission VALUES (27, 'Can delete Veh├¡culo', 7, 'delete_vehiculo');
INSERT INTO public.auth_permission VALUES (28, 'Can view Veh├¡culo', 7, 'view_vehiculo');
INSERT INTO public.auth_permission VALUES (29, 'Can add Imagen de Veh├¡culo', 8, 'add_imagenvehiculo');
INSERT INTO public.auth_permission VALUES (30, 'Can change Imagen de Veh├¡culo', 8, 'change_imagenvehiculo');
INSERT INTO public.auth_permission VALUES (31, 'Can delete Imagen de Veh├¡culo', 8, 'delete_imagenvehiculo');
INSERT INTO public.auth_permission VALUES (32, 'Can view Imagen de Veh├¡culo', 8, 'view_imagenvehiculo');
INSERT INTO public.auth_permission VALUES (33, 'Can add Inspecci├│n', 9, 'add_inspeccion');
INSERT INTO public.auth_permission VALUES (34, 'Can change Inspecci├│n', 9, 'change_inspeccion');
INSERT INTO public.auth_permission VALUES (35, 'Can delete Inspecci├│n', 9, 'delete_inspeccion');
INSERT INTO public.auth_permission VALUES (36, 'Can view Inspecci├│n', 9, 'view_inspeccion');
INSERT INTO public.auth_permission VALUES (37, 'Can add Resultado de An├ílisis IA', 10, 'add_resultadoanalisis');
INSERT INTO public.auth_permission VALUES (38, 'Can change Resultado de An├ílisis IA', 10, 'change_resultadoanalisis');
INSERT INTO public.auth_permission VALUES (39, 'Can delete Resultado de An├ílisis IA', 10, 'delete_resultadoanalisis');
INSERT INTO public.auth_permission VALUES (40, 'Can view Resultado de An├ílisis IA', 10, 'view_resultadoanalisis');
INSERT INTO public.auth_permission VALUES (41, 'Can add Notificaci├│n', 11, 'add_notificacion');
INSERT INTO public.auth_permission VALUES (42, 'Can change Notificaci├│n', 11, 'change_notificacion');
INSERT INTO public.auth_permission VALUES (43, 'Can delete Notificaci├│n', 11, 'delete_notificacion');
INSERT INTO public.auth_permission VALUES (44, 'Can view Notificaci├│n', 11, 'view_notificacion');


--
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.django_content_type VALUES (1, 'admin', 'logentry');
INSERT INTO public.django_content_type VALUES (2, 'auth', 'permission');
INSERT INTO public.django_content_type VALUES (3, 'auth', 'group');
INSERT INTO public.django_content_type VALUES (4, 'contenttypes', 'contenttype');
INSERT INTO public.django_content_type VALUES (5, 'sessions', 'session');
INSERT INTO public.django_content_type VALUES (6, 'usuarios', 'usuario');
INSERT INTO public.django_content_type VALUES (7, 'vehiculos', 'vehiculo');
INSERT INTO public.django_content_type VALUES (8, 'imagenes', 'imagenvehiculo');
INSERT INTO public.django_content_type VALUES (9, 'analisis_ia', 'inspeccion');
INSERT INTO public.django_content_type VALUES (10, 'analisis_ia', 'resultadoanalisis');
INSERT INTO public.django_content_type VALUES (11, 'notificaciones', 'notificacion');


--
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.django_migrations VALUES (1, 'contenttypes', '0001_initial', '2026-10-17 18:03:08.595436-05');
INSERT INTO public.django_migrations VALUES (2, 'contenttypes', '0002_remove_content_type_name', '2026-10-17 18:03:08.64038-05');
INSERT INTO public.django_migrations VALUES (3, 'auth', '0001_initial', '2026-10-17 18:03:08.95246-05');
INSERT INTO public.django_migrations VALUES (4, 'auth', '0002_alter_permission_name_max_length', '2026-10-17 18:03:08.976235-05');
INSERT INTO public.django_migrations VALUES (5, 'auth', '0003_alter_user_email_max_length', '2026-10-17 18:03:08.997034-05');
INSERT INTO public.django_migrations VALUES (6, 'auth', '0004_alter_user_username_opts', '2026-10-17 18:03:09.016379-05');
INSERT INTO public.django_migrations VALUES (7, 'auth', '0005_alter_user_last_login_null', '2026-10-17 18:03:09.035207-05');
INSERT INTO public.django_migrations VALUES (8, 'auth', '0006_require_contenttypes_0002', '2026-10-17 18:03:09.039919-05');
INSERT INTO public.django_migrations VALUES (9, 'auth', '0007_alter_validators_add_error_messages', '2026-10-17 18:03:09.060478-05');
INSERT INTO public.django_migrations VALUES (10, 'auth', '0008_alter_user_username_max_length', '2026-10-17 18:03:09.098638-05');
INSERT INTO public.django_migrations VALUES (11, 'auth', '0009_alter_user_last_name_max_length', '2026-10-17 18:03:09.129346-05');
INSERT INTO public.django_migrations VALUES (12, 'auth', '0010_alter_group_name_max_length', '2026-10-17 18:03:09.180486-05');
INSERT INTO public.django_migrations VALUES (13, 'auth', '0011_update_proxy_permissions', '2026-10-17 18:03:09.20122-05');
INSERT INTO public.django_migrations VALUES (14, 'auth', '0012_alter_user_first_name_max_length', '2026-10-17 18:03:09.224095-05');
INSERT INTO public.django_migrations VALUES (15, 'usuarios', '0001_initial', '2026-10-17 18:03:09.56031-05');
INSERT INTO public.django_migrations VALUES (16, 'admin', '0001_initial', '2026-10-17 18:03:09.704882-05');
INSERT INTO public.django_migrations VALUES (17, 'admin', '0002_logentry_remove_auto_add', '2026-10-17 18:03:09.75013-05');
INSERT INTO public.django_migrations VALUES (18, 'admin', '0003_logentry_add_action_flag_choices', '2026-10-17 18:03:09.785677-05');
INSERT INTO public.django_migrations VALUES (19, 'sessions', '0001_initial', '2026-10-17 18:03:09.862134-05');
INSERT INTO public.django_migrations VALUES (20, 'vehiculos', '0001_initial', '2026-10-17 18:21:55.156515-05');
INSERT INTO public.django_migrations VALUES (21, 'imagenes', '0001_initial', '2026-10-17 18:48:17.038243-05');
INSERT INTO public.django_migrations VALUES (22, 'analisis_ia', '0001_initial', '2026-10-17 19:29:59.95361-05');
INSERT INTO public.django_migrations VALUES (23, 'notificaciones', '0001_initial', '2026-10-26 17:18:06.887694-05');


--
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: imagenes_imagenvehiculo; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notificaciones_notificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.notificaciones_notificacion VALUES (3, 'Nueva unidad registrada', 'El cliente Damian Sánchez ha registrado el vehículo Chevrolet D-Max (PBX-4521). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "PBX-4521", "vehiculo_id": 1}', '2026-11-07 18:17:08.347823-05', 4);
INSERT INTO public.notificaciones_notificacion VALUES (6, 'Nueva unidad registrada', 'El cliente Damian Sánchez ha registrado el vehículo Toyota Hilux (GSK-8910). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "GSK-8910", "vehiculo_id": 2}', '2026-11-07 18:17:08.439861-05', 4);
INSERT INTO public.notificaciones_notificacion VALUES (9, 'Nueva unidad registrada', 'El cliente Damian Sánchez ha registrado el vehículo Kia Sportage (TBA-3320). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "TBA-3320", "vehiculo_id": 3}', '2026-11-07 18:17:08.530678-05', 4);
INSERT INTO public.notificaciones_notificacion VALUES (12, 'Nueva unidad registrada', 'El cliente Damian Sánchez ha registrado el vehículo Hyundai Tucson (ABM-7814). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "ABM-7814", "vehiculo_id": 4}', '2026-11-07 18:17:08.554626-05', 4);
INSERT INTO public.notificaciones_notificacion VALUES (15, 'Nueva unidad registrada', 'El cliente Oscar Heredero ha registrado el vehículo Nissan Versa (PCD-5412). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "PCD-5412", "vehiculo_id": 5}', '2026-11-07 18:17:08.574144-05', 4);
INSERT INTO public.notificaciones_notificacion VALUES (18, 'Nueva unidad registrada', 'El cliente Oscar Heredero ha registrado el vehículo Renault Duster (MDD-6321). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "MDD-6321", "vehiculo_id": 6}', '2026-11-07 18:17:08.599047-05', 4);
INSERT INTO public.notificaciones_notificacion VALUES (21, 'Nueva unidad registrada', 'El cliente Oscar Heredero ha registrado el vehículo Suzuki Grand Vitara (GYE-9041). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "GYE-9041", "vehiculo_id": 7}', '2026-11-07 18:17:08.6299-05', 4);
INSERT INTO public.notificaciones_notificacion VALUES (24, 'Nueva unidad registrada', 'El cliente Caleb Cabrera ha registrado el vehículo Mazda CX-5 (PCA-1123). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "PCA-1123", "vehiculo_id": 8}', '2026-11-07 18:17:08.676229-05', 4);
INSERT INTO public.notificaciones_notificacion VALUES (27, 'Nueva unidad registrada', 'El cliente Caleb Cabrera ha registrado el vehículo Ford F-150 (AFB-4509). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "AFB-4509", "vehiculo_id": 9}', '2026-11-07 18:17:08.698064-05', 4);
INSERT INTO public.notificaciones_notificacion VALUES (30, 'Nueva unidad registrada', 'El cliente Caleb Cabrera ha registrado el vehículo Chevrolet Sail (TBD-7788). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "TBD-7788", "vehiculo_id": 10}', '2026-11-07 18:17:08.731366-05', 4);
INSERT INTO public.notificaciones_notificacion VALUES (13, 'Vehículo registrado para inspección', 'Tu vehículo Nissan Versa (PCD-5412) ha sido ingresado al sistema. Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "PCD-5412", "vehiculo_id": 5}', '2026-11-07 18:17:08.568283-05', 7);
INSERT INTO public.notificaciones_notificacion VALUES (16, 'Vehículo registrado para inspección', 'Tu vehículo Renault Duster (MDD-6321) ha sido ingresado al sistema. Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "MDD-6321", "vehiculo_id": 6}', '2026-11-07 18:17:08.588958-05', 7);
INSERT INTO public.notificaciones_notificacion VALUES (19, 'Vehículo registrado para inspección', 'Tu vehículo Suzuki Grand Vitara (GYE-9041) ha sido ingresado al sistema. Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "GYE-9041", "vehiculo_id": 7}', '2026-11-07 18:17:08.621573-05', 7);
INSERT INTO public.notificaciones_notificacion VALUES (22, 'Vehículo registrado para inspección', 'Tu vehículo Mazda CX-5 (PCA-1123) ha sido ingresado al sistema. Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "PCA-1123", "vehiculo_id": 8}', '2026-11-07 18:17:08.665629-05', 8);
INSERT INTO public.notificaciones_notificacion VALUES (31, 'Nueva unidad registrada', 'El cliente Caleb Cabrera ha registrado el vehículo Audi A3 (ABD-478). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "ABD-478", "vehiculo_id": 11}', '2026-11-07 18:28:17.549903-05', 4);
INSERT INTO public.notificaciones_notificacion VALUES (33, 'Inspección inicial completada', 'Se completó la primera inspección técnica de tu vehículo Chevrolet Sail (TBD-7788). Se detectaron 2 daño(s) en la carrocería. Ya puedes consultar el diagnóstico base en tu historial.', 'INSPECCION', false, 'history', '{"placa": "TBD-7788", "vehiculo_id": 10, "inspeccion_id": 4, "revision_numero": 1}', '2026-11-07 20:22:28.525233-05', 8);
INSERT INTO public.notificaciones_notificacion VALUES (34, 'Nueva inspección de seguimiento completada', 'Se registró una nueva inspección técnica (revisión N° 2) de tu vehículo Chevrolet Sail (TBD-7788). No se detectaron daños (carrocería en estado óptimo). Ya puedes consultar los resultados y comparar la evolución de daños en tu historial.', 'INSPECCION', false, 'history', '{"placa": "TBD-7788", "vehiculo_id": 10, "inspeccion_id": 5, "revision_numero": 2}', '2026-11-07 22:32:13.072271-05', 8);
INSERT INTO public.notificaciones_notificacion VALUES (35, 'Nueva unidad registrada', 'El cliente Damian Sánchez ha registrado el vehículo Chevrolet D-Max (PBX-4521). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "PBX-4521", "rol_destino": "STAFF", "vehiculo_id": 1}', '2026-11-17 18:54:51.590341-05', 2);
INSERT INTO public.notificaciones_notificacion VALUES (36, 'Nueva unidad registrada', 'El cliente Damian Sánchez ha registrado el vehículo Toyota Hilux (GSK-8910). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "GSK-8910", "rol_destino": "STAFF", "vehiculo_id": 2}', '2026-11-17 18:54:51.671177-05', 2);
INSERT INTO public.notificaciones_notificacion VALUES (37, 'Nueva unidad registrada', 'El cliente Damian Sánchez ha registrado el vehículo Kia Sportage (TBA-3320). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "TBA-3320", "rol_destino": "STAFF", "vehiculo_id": 3}', '2026-11-17 18:54:51.674585-05', 2);
INSERT INTO public.notificaciones_notificacion VALUES (38, 'Nueva unidad registrada', 'El cliente Damian Sánchez ha registrado el vehículo Hyundai Tucson (ABM-7814). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "ABM-7814", "rol_destino": "STAFF", "vehiculo_id": 4}', '2026-11-17 18:54:51.677855-05', 2);
INSERT INTO public.notificaciones_notificacion VALUES (39, 'Nueva unidad registrada', 'El cliente Oscar Heredero ha registrado el vehículo Nissan Versa (PCD-5412). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "PCD-5412", "rol_destino": "STAFF", "vehiculo_id": 5}', '2026-11-17 18:54:51.681374-05', 2);
INSERT INTO public.notificaciones_notificacion VALUES (40, 'Nueva unidad registrada', 'El cliente Oscar Heredero ha registrado el vehículo Renault Duster (MDD-6321). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "MDD-6321", "rol_destino": "STAFF", "vehiculo_id": 6}', '2026-11-17 18:54:51.684656-05', 2);
INSERT INTO public.notificaciones_notificacion VALUES (41, 'Nueva unidad registrada', 'El cliente Oscar Heredero ha registrado el vehículo Suzuki Grand Vitara (GYE-9041). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "GYE-9041", "rol_destino": "STAFF", "vehiculo_id": 7}', '2026-11-17 18:54:51.68799-05', 2);
INSERT INTO public.notificaciones_notificacion VALUES (42, 'Nueva unidad registrada', 'El cliente Caleb Cabrera ha registrado el vehículo Mazda CX-5 (PCA-1123). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "PCA-1123", "rol_destino": "STAFF", "vehiculo_id": 8}', '2026-11-17 18:54:51.697108-05', 2);
INSERT INTO public.notificaciones_notificacion VALUES (43, 'Nueva unidad registrada', 'El cliente Caleb Cabrera ha registrado el vehículo Ford F-150 (AFB-4509). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "AFB-4509", "rol_destino": "STAFF", "vehiculo_id": 9}', '2026-11-17 18:54:51.700313-05', 2);
INSERT INTO public.notificaciones_notificacion VALUES (44, 'Nueva unidad registrada', 'El cliente Caleb Cabrera ha registrado el vehículo Chevrolet Sail (TBD-7788). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "TBD-7788", "rol_destino": "STAFF", "vehiculo_id": 10}', '2026-11-17 18:54:51.704722-05', 2);
INSERT INTO public.notificaciones_notificacion VALUES (45, 'Nueva unidad registrada', 'El cliente Caleb Cabrera ha registrado el vehículo Audi A3 (ABD-478). Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "ABD-478", "rol_destino": "STAFF", "vehiculo_id": 11}', '2026-11-17 18:54:51.708071-05', 2);
INSERT INTO public.notificaciones_notificacion VALUES (46, 'Vehículo registrado para inspección', 'Tu vehículo Chevrolet D-Max (PBX-4521) ha sido ingresado al sistema. Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "PBX-4521", "rol_destino": "PROPIETARIO", "vehiculo_id": 1}', '2026-11-17 18:54:51.73263-05', 5);
INSERT INTO public.notificaciones_notificacion VALUES (47, 'Vehículo registrado para inspección', 'Tu vehículo Toyota Hilux (GSK-8910) ha sido ingresado al sistema. Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "GSK-8910", "rol_destino": "PROPIETARIO", "vehiculo_id": 2}', '2026-11-17 18:54:51.735708-05', 5);
INSERT INTO public.notificaciones_notificacion VALUES (48, 'Vehículo registrado para inspección', 'Tu vehículo Kia Sportage (TBA-3320) ha sido ingresado al sistema. Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "TBA-3320", "rol_destino": "PROPIETARIO", "vehiculo_id": 3}', '2026-11-17 18:54:51.739845-05', 5);
INSERT INTO public.notificaciones_notificacion VALUES (49, 'Vehículo registrado para inspección', 'Tu vehículo Hyundai Tucson (ABM-7814) ha sido ingresado al sistema. Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "ABM-7814", "rol_destino": "PROPIETARIO", "vehiculo_id": 4}', '2026-11-17 18:54:51.743077-05', 5);
INSERT INTO public.notificaciones_notificacion VALUES (25, 'Vehículo registrado para inspección', 'Tu vehículo Ford F-150 (AFB-4509) ha sido ingresado al sistema. Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "AFB-4509", "vehiculo_id": 9}', '2026-11-07 18:17:08.690217-05', 8);
INSERT INTO public.notificaciones_notificacion VALUES (28, 'Vehículo registrado para inspección', 'Tu vehículo Chevrolet Sail (TBD-7788) ha sido ingresado al sistema. Estado: Pendiente de inspección.', 'VEHICULO', false, 'vehicles', '{"placa": "TBD-7788", "vehiculo_id": 10}', '2026-11-07 18:17:08.720905-05', 8);


--
-- Data for Name: usuarios_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuarios_usuario VALUES (8, 'pbkdf2_sha256$870000$e70QqajrEIDNOLTE8Wfsrv$MPhuruqTuXQuXBZAcN6IxMz66IklZD2X/vZd0lMpcr4=', NULL, false, 'c.cabrera@autocheck.ai', 'Caleb David Cabrera Bajaña', 'PROPIETARIO', 0, false, true, false, '2026-10-19 21:43:28.59-05');
INSERT INTO public.usuarios_usuario VALUES (7, 'pbkdf2_sha256$870000$wSx4ndNmjA0GZtY7cEUZQU$Ut7P9vwBQafbD8/wZQy6wiuFR+QgD1br5TVL6BZEgA4=', NULL, false, 'o.heredero@autocheck.ai', 'Oscar Erick Heredero Román', 'PROPIETARIO', 0, false, true, false, '2026-10-19 21:16:33.241-05');
INSERT INTO public.usuarios_usuario VALUES (2, 'pbkdf2_sha256$870000$p4dXPDYa3zdyl3yKaX8ARi$pHCSM3hXJW3SYjT7NPsWw2D3W1Bb6z0JFPdsdj/9z58=', NULL, false, 'r.mayorga@autocheck.ai', 'Rey Mayorga Vera', 'ADMINISTRADOR', 0, false, true, false, '2026-10-17 21:51:37.416-05');
INSERT INTO public.usuarios_usuario VALUES (4, 'pbkdf2_sha256$870000$3gr9rhqRozltG55xklliBo$fosm58a1XOI28ysv1gpIaszj3Vwqoq5xm2wBmO9pHfc=', NULL, false, 'a.garcia@autocheck.ai', 'María Alejandra García Roldán', 'OPERADOR', 0, false, true, false, '2026-10-18 00:27:21.153-05');
INSERT INTO public.usuarios_usuario VALUES (5, 'pbkdf2_sha256$870000$zHDh1O3qtpOj4KWsKDD71n$krCic/CvXYY+RNbyFc+p5ipPxSGZ2DjF/xuNLlxj/QU=', NULL, false, 'd.sanchez@autocheck.ai', 'Damian Fabricio Sánchez Pulla', 'PROPIETARIO', 0, false, true, false, '2026-10-19 18:25:00.503-05');


--
-- Data for Name: usuarios_usuario_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: usuarios_usuario_user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: vehiculos_vehiculo; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.vehiculos_vehiculo VALUES (1, 'PBX-4521', 'Chevrolet', 'D-Max', 2021, 'PENDIENTE', '2026-11-07 18:17:08.087763-05', '2026-11-07 18:17:08.087889-05', 5);
INSERT INTO public.vehiculos_vehiculo VALUES (2, 'GSK-8910', 'Toyota', 'Hilux', 2022, 'PENDIENTE', '2026-11-07 18:17:08.370239-05', '2026-11-07 18:17:08.370286-05', 5);
INSERT INTO public.vehiculos_vehiculo VALUES (3, 'TBA-3320', 'Kia', 'Sportage', 2020, 'PENDIENTE', '2026-11-07 18:17:08.49662-05', '2026-11-07 18:17:08.496658-05', 5);
INSERT INTO public.vehiculos_vehiculo VALUES (4, 'ABM-7814', 'Hyundai', 'Tucson', 2019, 'PENDIENTE', '2026-11-07 18:17:08.545093-05', '2026-11-07 18:17:08.545131-05', 5);
INSERT INTO public.vehiculos_vehiculo VALUES (5, 'PCD-5412', 'Nissan', 'Versa', 2023, 'PENDIENTE', '2026-11-07 18:17:08.563188-05', '2026-11-07 18:17:08.563254-05', 7);
INSERT INTO public.vehiculos_vehiculo VALUES (6, 'MDD-6321', 'Renault', 'Duster', 2018, 'PENDIENTE', '2026-11-07 18:17:08.583744-05', '2026-11-07 18:17:08.583784-05', 7);
INSERT INTO public.vehiculos_vehiculo VALUES (7, 'GYE-9041', 'Suzuki', 'Grand Vitara', 2021, 'PENDIENTE', '2026-11-07 18:17:08.616016-05', '2026-11-07 18:17:08.616055-05', 7);
INSERT INTO public.vehiculos_vehiculo VALUES (8, 'PCA-1123', 'Mazda', 'CX-5', 2022, 'PENDIENTE', '2026-11-07 18:17:08.650722-05', '2026-11-07 18:17:08.650772-05', 8);
INSERT INTO public.vehiculos_vehiculo VALUES (9, 'AFB-4509', 'Ford', 'F-150', 2020, 'PENDIENTE', '2026-11-07 18:17:08.685686-05', '2026-11-07 18:17:08.686664-05', 8);
INSERT INTO public.vehiculos_vehiculo VALUES (10, 'TBD-7788', 'Chevrolet', 'Sail', 2019, 'PENDIENTE', '2026-11-07 18:17:08.711857-05', '2026-11-07 18:17:08.711894-05', 8);


--
-- Name: analisis_ia_inspeccion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analisis_ia_inspeccion_id_seq', 5, true);


--
-- Name: analisis_ia_resultadoanalisis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analisis_ia_resultadoanalisis_id_seq', 5, true);


--
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 44, true);


--
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 1, false);


--
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 11, true);


--
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 23, true);


--
-- Name: imagenes_imagenvehiculo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.imagenes_imagenvehiculo_id_seq', 9, true);


--
-- Name: notificaciones_notificacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notificaciones_notificacion_id_seq', 49, true);


--
-- Name: usuarios_usuario_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_usuario_groups_id_seq', 1, false);


--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_usuario_id_seq', 9, true);


--
-- Name: usuarios_usuario_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_usuario_user_permissions_id_seq', 1, false);


--
-- Name: vehiculos_vehiculo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehiculos_vehiculo_id_seq', 11, true);


--
-- Name: analisis_ia_inspeccion analisis_ia_inspeccion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_ia_inspeccion
    ADD CONSTRAINT analisis_ia_inspeccion_pkey PRIMARY KEY (id);


--
-- Name: analisis_ia_resultadoanalisis analisis_ia_resultadoanalisis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_ia_resultadoanalisis
    ADD CONSTRAINT analisis_ia_resultadoanalisis_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- Name: imagenes_imagenvehiculo imagenes_imagenvehiculo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imagenes_imagenvehiculo
    ADD CONSTRAINT imagenes_imagenvehiculo_pkey PRIMARY KEY (id);


--
-- Name: notificaciones_notificacion notificaciones_notificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones_notificacion
    ADD CONSTRAINT notificaciones_notificacion_pkey PRIMARY KEY (id);


--
-- Name: usuarios_usuario usuarios_usuario_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_usuario
    ADD CONSTRAINT usuarios_usuario_email_key UNIQUE (email);


--
-- Name: usuarios_usuario_groups usuarios_usuario_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_usuario_groups
    ADD CONSTRAINT usuarios_usuario_groups_pkey PRIMARY KEY (id);


--
-- Name: usuarios_usuario_groups usuarios_usuario_groups_usuario_id_group_id_4ed5b09e_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_usuario_groups
    ADD CONSTRAINT usuarios_usuario_groups_usuario_id_group_id_4ed5b09e_uniq UNIQUE (usuario_id, group_id);


--
-- Name: usuarios_usuario usuarios_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_usuario
    ADD CONSTRAINT usuarios_usuario_pkey PRIMARY KEY (id);


--
-- Name: usuarios_usuario_user_permissions usuarios_usuario_user_pe_usuario_id_permission_id_217cadcd_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_usuario_user_permissions
    ADD CONSTRAINT usuarios_usuario_user_pe_usuario_id_permission_id_217cadcd_uniq UNIQUE (usuario_id, permission_id);


--
-- Name: usuarios_usuario_user_permissions usuarios_usuario_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_usuario_user_permissions
    ADD CONSTRAINT usuarios_usuario_user_permissions_pkey PRIMARY KEY (id);


--
-- Name: vehiculos_vehiculo vehiculos_vehiculo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos_vehiculo
    ADD CONSTRAINT vehiculos_vehiculo_pkey PRIMARY KEY (id);


--
-- Name: vehiculos_vehiculo vehiculos_vehiculo_placa_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos_vehiculo
    ADD CONSTRAINT vehiculos_vehiculo_placa_key UNIQUE (placa);


--
-- Name: analisis_ia_inspeccion_usuario_responsable_id_301e0dab; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX analisis_ia_inspeccion_usuario_responsable_id_301e0dab ON public.analisis_ia_inspeccion USING btree (usuario_responsable_id);


--
-- Name: analisis_ia_inspeccion_vehiculo_id_f7520f15; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX analisis_ia_inspeccion_vehiculo_id_f7520f15 ON public.analisis_ia_inspeccion USING btree (vehiculo_id);


--
-- Name: analisis_ia_resultadoanalisis_imagen_id_c94767bf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX analisis_ia_resultadoanalisis_imagen_id_c94767bf ON public.analisis_ia_resultadoanalisis USING btree (imagen_id);


--
-- Name: analisis_ia_resultadoanalisis_inspeccion_id_6b18cdf2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX analisis_ia_resultadoanalisis_inspeccion_id_6b18cdf2 ON public.analisis_ia_resultadoanalisis USING btree (inspeccion_id);


--
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log USING btree (content_type_id);


--
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_user_id_c564eba6 ON public.django_admin_log USING btree (user_id);


--
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- Name: imagenes_imagenvehiculo_usuario_id_17343428; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX imagenes_imagenvehiculo_usuario_id_17343428 ON public.imagenes_imagenvehiculo USING btree (usuario_id);


--
-- Name: imagenes_imagenvehiculo_vehiculo_id_9ef6a8d9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX imagenes_imagenvehiculo_vehiculo_id_9ef6a8d9 ON public.imagenes_imagenvehiculo USING btree (vehiculo_id);


--
-- Name: notificaciones_notificacion_usuario_id_4bc090a3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notificaciones_notificacion_usuario_id_4bc090a3 ON public.notificaciones_notificacion USING btree (usuario_id);


--
-- Name: usuarios_usuario_email_0a82e5f9_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX usuarios_usuario_email_0a82e5f9_like ON public.usuarios_usuario USING btree (email varchar_pattern_ops);


--
-- Name: usuarios_usuario_groups_group_id_e77f6dcf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX usuarios_usuario_groups_group_id_e77f6dcf ON public.usuarios_usuario_groups USING btree (group_id);


--
-- Name: usuarios_usuario_groups_usuario_id_7a34077f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX usuarios_usuario_groups_usuario_id_7a34077f ON public.usuarios_usuario_groups USING btree (usuario_id);


--
-- Name: usuarios_usuario_user_permissions_permission_id_4e5c0f2f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX usuarios_usuario_user_permissions_permission_id_4e5c0f2f ON public.usuarios_usuario_user_permissions USING btree (permission_id);


--
-- Name: usuarios_usuario_user_permissions_usuario_id_60aeea80; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX usuarios_usuario_user_permissions_usuario_id_60aeea80 ON public.usuarios_usuario_user_permissions USING btree (usuario_id);


--
-- Name: vehiculos_vehiculo_placa_37ead472_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vehiculos_vehiculo_placa_37ead472_like ON public.vehiculos_vehiculo USING btree (placa varchar_pattern_ops);


--
-- Name: vehiculos_vehiculo_propietario_id_8fa2d7e8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vehiculos_vehiculo_propietario_id_8fa2d7e8 ON public.vehiculos_vehiculo USING btree (propietario_id);


--
-- Name: analisis_ia_inspeccion analisis_ia_inspecci_usuario_responsable__301e0dab_fk_usuarios_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_ia_inspeccion
    ADD CONSTRAINT analisis_ia_inspecci_usuario_responsable__301e0dab_fk_usuarios_ FOREIGN KEY (usuario_responsable_id) REFERENCES public.usuarios_usuario(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: analisis_ia_inspeccion analisis_ia_inspecci_vehiculo_id_f7520f15_fk_vehiculos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_ia_inspeccion
    ADD CONSTRAINT analisis_ia_inspecci_vehiculo_id_f7520f15_fk_vehiculos FOREIGN KEY (vehiculo_id) REFERENCES public.vehiculos_vehiculo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: analisis_ia_resultadoanalisis analisis_ia_resultad_imagen_id_c94767bf_fk_imagenes_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_ia_resultadoanalisis
    ADD CONSTRAINT analisis_ia_resultad_imagen_id_c94767bf_fk_imagenes_ FOREIGN KEY (imagen_id) REFERENCES public.imagenes_imagenvehiculo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: analisis_ia_resultadoanalisis analisis_ia_resultad_inspeccion_id_6b18cdf2_fk_analisis_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_ia_resultadoanalisis
    ADD CONSTRAINT analisis_ia_resultad_inspeccion_id_6b18cdf2_fk_analisis_ FOREIGN KEY (inspeccion_id) REFERENCES public.analisis_ia_inspeccion(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log django_admin_log_user_id_c564eba6_fk_usuarios_usuario_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_usuarios_usuario_id FOREIGN KEY (user_id) REFERENCES public.usuarios_usuario(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: imagenes_imagenvehiculo imagenes_imagenvehic_usuario_id_17343428_fk_usuarios_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imagenes_imagenvehiculo
    ADD CONSTRAINT imagenes_imagenvehic_usuario_id_17343428_fk_usuarios_ FOREIGN KEY (usuario_id) REFERENCES public.usuarios_usuario(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: imagenes_imagenvehiculo imagenes_imagenvehic_vehiculo_id_9ef6a8d9_fk_vehiculos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imagenes_imagenvehiculo
    ADD CONSTRAINT imagenes_imagenvehic_vehiculo_id_9ef6a8d9_fk_vehiculos FOREIGN KEY (vehiculo_id) REFERENCES public.vehiculos_vehiculo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: notificaciones_notificacion notificaciones_notif_usuario_id_4bc090a3_fk_usuarios_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones_notificacion
    ADD CONSTRAINT notificaciones_notif_usuario_id_4bc090a3_fk_usuarios_ FOREIGN KEY (usuario_id) REFERENCES public.usuarios_usuario(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: usuarios_usuario_groups usuarios_usuario_gro_usuario_id_7a34077f_fk_usuarios_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_usuario_groups
    ADD CONSTRAINT usuarios_usuario_gro_usuario_id_7a34077f_fk_usuarios_ FOREIGN KEY (usuario_id) REFERENCES public.usuarios_usuario(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: usuarios_usuario_groups usuarios_usuario_groups_group_id_e77f6dcf_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_usuario_groups
    ADD CONSTRAINT usuarios_usuario_groups_group_id_e77f6dcf_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: usuarios_usuario_user_permissions usuarios_usuario_use_permission_id_4e5c0f2f_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_usuario_user_permissions
    ADD CONSTRAINT usuarios_usuario_use_permission_id_4e5c0f2f_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: usuarios_usuario_user_permissions usuarios_usuario_use_usuario_id_60aeea80_fk_usuarios_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_usuario_user_permissions
    ADD CONSTRAINT usuarios_usuario_use_usuario_id_60aeea80_fk_usuarios_ FOREIGN KEY (usuario_id) REFERENCES public.usuarios_usuario(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: vehiculos_vehiculo vehiculos_vehiculo_propietario_id_8fa2d7e8_fk_usuarios_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos_vehiculo
    ADD CONSTRAINT vehiculos_vehiculo_propietario_id_8fa2d7e8_fk_usuarios_ FOREIGN KEY (propietario_id) REFERENCES public.usuarios_usuario(id) DEFERRABLE INITIALLY DEFERRED;


--
-- PostgreSQL database dump complete
--

\unrestrict YNOdE7sRgiG8NPQ17DTWd1XnxHSnZlxhmjO0Q6ZWwLfO30vkSLTF4PjFpE8eg7F

