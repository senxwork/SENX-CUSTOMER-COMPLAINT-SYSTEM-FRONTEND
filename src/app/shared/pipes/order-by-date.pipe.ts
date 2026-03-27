import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderByDate',
  standalone: true
})
export class OrderByDatePipe implements PipeTransform {

  transform(array: any[], field: string, order: 'asc' | 'desc' = 'desc'): any[] {
    if (!array || !field) return array;

    return [...array].sort((a, b) => {
      const dateA = new Date(a[field]).getTime();
      const dateB = new Date(b[field]).getTime();

      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }
}
