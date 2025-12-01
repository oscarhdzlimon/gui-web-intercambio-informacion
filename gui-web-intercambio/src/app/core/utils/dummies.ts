import {InformacionSesion} from '@models/informacionSesion';
import {VerificacionDocumentos} from '@models/verificacion-documentos.interface';

const DUMMIE_INFORMACION_SESION: InformacionSesion = {
  curp: 'XXXXXXXXX',
  fechaIngreso: 'XXXXXXXXX',
  fechaRegistro: 'XXXXXXXXX',
  matricula: 'XXXXXXXXX',
  nombres: 'Pablo Andres',
  primerApellido: 'García',
  segundoApellido: 'Bernal',
  rfc: 'XXXXXXXXX',
}

export const DUMMIE_TABLA_VERIFICACION_DOCUMENTOS: VerificacionDocumentos[] = [
  {
    "nombre": "Pablo Andrés García Bernal",
    "matricula": "311080212",
    "correo": "pablo_bernal@gmail.com",
    "especialidad": "Cardiología",
    "estatus": 0,
    "observaciones": "Documentos incompletos",
    "modalidad": "Interno",
    "tipoModalidad": "Residencia",
    "fecha": "15/02/2025"
  },
  {
    "nombre": "Mariana Torres Delgado",
    "matricula": "311285156",
    "correo": "alejandro01@gmail.com",
    "especialidad": "Cardiología",
    "estatus": 1,
    "observaciones": "Documentos completos",
    "modalidad": "Interno",
    "tipoModalidad": "Residencia",
    "fecha": "15/02/2025"
  },
  {
    "nombre": "Javier Martínez Cruz",
    "matricula": "311089424",
    "correo": "javier01@gmail.com",
    "especialidad": "Cardiología",
    "estatus": 0,
    "observaciones": "Falta documento de residencia",
    "modalidad": "Interno",
    "tipoModalidad": "Residencia",
    "fecha": "15/02/2025"
  },
  {
    "nombre": "Laura Fernández Soto",
    "matricula": "311486512",
    "correo": "laufernandez@gmail.com",
    "especialidad": "Cardiología",
    "estatus": 2,
    "observaciones": "En proceso de revisión por comité",
    "modalidad": "Interno",
    "tipoModalidad": "Residencia",
    "fecha": "15/02/2025"
  },
  {
    "nombre": "Ricardo Gómez Herrera",
    "matricula": "311564878",
    "correo": "richard10@gmail.com",
    "especialidad": "Cardiología",
    "estatus": 1,
    "observaciones": "Documentos incompletos, falta certificado",
    "modalidad": "Interno",
    "tipoModalidad": "Residencia",
    "fecha": "15/02/2025"
  },
  {
    "nombre": "Valeria Morales Domínguez",
    "matricula": "311525658",
    "correo": "valeria01@gmail.com",
    "especialidad": "Cardiología",
    "estatus": 3,
    "observaciones": "Pendiente de revisión",
    "modalidad": "Interno",
    "tipoModalidad": "Residencia",
    "fecha": "15/02/2025"
  },
  {
    "nombre": "Antonio Vargas Castillo",
    "matricula": "311856486",
    "correo": "antoniov@gmail.com",
    "especialidad": "Cardiología",
    "estatus": 1,
    "observaciones": "Documentos completos",
    "modalidad": "Interno",
    "tipoModalidad": "Residencia",
    "fecha": "15/02/2025"
  },
  {
    "nombre": "Camila Ríos Navarro",
    "matricula": "311846528",
    "correo": "camila_rios@gmail.com",
    "especialidad": "Cardiología",
    "estatus": 2,
    "observaciones": "En proceso de revisión por comité",
    "modalidad": "Interno",
    "tipoModalidad": "Residencia",
    "fecha": "15/02/2025"
  },
  {
    "nombre": "Sebastián Ortega Mendoza",
    "matricula": "311458969",
    "correo": "sebastian01@gmail.com",
    "especialidad": "Cardiología",
    "estatus": 2,
    "observaciones": "En proceso de revisión por comité",
    "modalidad": "Interno",
    "tipoModalidad": "Residencia",
    "fecha": "15/02/2025"
  },
  {
    "nombre": "Claudia Pérez Aguirre",
    "matricula": "311094856",
    "correo": "claudia01@gmail.com",
    "especialidad": "Cardiología",
    "estatus": 0,
    "observaciones": "Falta documento de residencia",
    "modalidad": "Interno",
    "tipoModalidad": "Residencia",
    "fecha": "15/02/2025"
  }
];

export const DUMMIE_DOCS_ESPECIALIDAD: any[] = [
  {
    "idEspecialidad": 1,
    "especialidad": 'Especialidad cardiología',
    "docs": [
      {
        "idDoc": 1,
        "nombreDoc": "Título de la especialidad",
      },
      {
        "idDoc": 2,
        "nombreDoc": "Cédula profesional de la especialidad",
      },
      {
        "idDoc": 3,
        "nombreDoc": "Diploma institucional de la especialidad",
      },
      {
        "idDoc": 4,
        "nombreDoc": "Consejo de la especialidad",
      }
    ]
  },
  {
    "idEspecialidad": 2,
    "especialidad": 'Especialidad pediatría',
    "docs": [
      {
        "idDoc": 5,
        "nombreDoc": "Título de la especialidad",
      },
      {
        "idDoc": 6,
        "nombreDoc": "Cédula profesional de la especialidad",
      }
    ]
  }
]
