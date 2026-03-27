import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateDifference',
  standalone: true
})
export class DateDifferencePipe implements PipeTransform {

  transform(startDate: any, endDate?: any): string {
    if (!startDate) return '';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'วันนี้';
    if (diffDays === 1) return '1 วัน';
    if (diffDays < 30) return `${diffDays} วัน`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} เดือน`;
    }

    const years = Math.floor(diffDays / 365);
    return `${years} ปี`;
  }
}
