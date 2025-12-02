export interface ColumnDefinition {
  field: string;              // Nombre del campo en el objeto
  header: string;             // Texto de la columna
  frozen?: boolean;           // true si debe ser pFrozenColumn
  checkbox?: boolean;         // true si esta columna es un checkbox
  width?: string;             // opcional, para dar estilo
}