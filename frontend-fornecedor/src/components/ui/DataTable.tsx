import type { ReactNode } from 'react';
import './ui.css';
export interface DataColumn<Row> { key: string; label: string; render?: (row: Row) => ReactNode; }
interface DataTableProps<Row> { columns: DataColumn<Row>[]; rows: Row[]; getRowKey: (row: Row) => string; renderCard?: (row: Row) => ReactNode; }
export function DataTable<Row>({ columns, rows, getRowKey, renderCard }: DataTableProps<Row>) { return <div className="ui-data-table">{renderCard && <div className="ui-data-cards">{rows.map((row) => <div key={getRowKey(row)}>{renderCard(row)}</div>)}</div>}<div className="ui-data-table-scroll"><table><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={getRowKey(row)}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : String(row[column.key as keyof Row] ?? '-')}</td>)}</tr>)}</tbody></table></div></div>; }
