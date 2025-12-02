export interface ColumnDefinition {
  field: string;              // Nombre del campo en el objeto
  header: string;             // Texto de la columna
  checkbox?: boolean;         // true si esta columna es un checkbox
  width: string;             // opcional, para dar estilo
}