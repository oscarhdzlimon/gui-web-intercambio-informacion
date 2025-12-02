import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ColumnDefinition } from '@models/columa-tabla';
import { ButtonModule } from 'primeng/button';
import { Card, CardModule } from 'primeng/card';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputText } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';


@Component({
  selector: 'app-tabla-principal',
  standalone: true,
  imports: [ CommonModule,
    ReactiveFormsModule,
    Card,
    SelectModule,
    InputText,
    TableModule,
    ButtonModule,
    ConfirmPopupModule,
    PaginatorModule,FormsModule],
  templateUrl: './tabla-principal.component.html',
  styleUrl: './tabla-principal.component.scss'
})
export class TablaPrincipalComponent {
  @Input() titulo: string = 'Consulta';
  @Input() data: any[] = [];
  @Input() columns: ColumnDefinition[] = [];

  @Input() rows: number = 10;
  @Input() first: number = 0;
  @Input() total: number = 0;

  @Output() pageChange = new EventEmitter<any>();
  @Output() checkboxChanged = new EventEmitter<{ row: any, column: ColumnDefinition }>();

  // 🔒 Columnas congeladas
  frozenColumns: ColumnDefinition[] = [];

  // 🔓 Columnas normales
  unfrozenColumns: ColumnDefinition[] = [];

  ngOnInit() {
  this.frozenColumns = this.columns.filter(c => c.frozen);
  this.unfrozenColumns = this.columns.filter(c => !c.frozen);
}


  // Detecta cambios cuando el padre cambia las columnas
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      this.splitColumns();
    }
  }

  // Divide las columnas automáticamente
  private splitColumns(): void {
    this.frozenColumns = this.columns.filter(c => c.frozen);
    this.unfrozenColumns = this.columns.filter(c => !c.frozen);
  }

  // Evento paginador
  onPageChange(event: any) {
    this.pageChange.emit(event);
  }

  // Evento checkbox
onCheckboxEvent(row: any, col: any, event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.checked;

  row[col.field] = value;
  this.checkboxChanged.emit({ row, column: col });
}

onCheckboxChange(row: any, col: ColumnDefinition) {
  this.checkboxChanged.emit({ row, column: col });
}

}
