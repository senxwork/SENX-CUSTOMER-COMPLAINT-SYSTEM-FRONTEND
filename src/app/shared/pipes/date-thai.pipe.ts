import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateThai',
  standalone: true
})
export class DateThaiPipe implements PipeTransform {

  private thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  private thaiMonthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  transform(value: any, format: string = 'full'): string {
    if (!value) return '';

    const date = new Date(value);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear() + 543;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    switch (format) {
      case 'short':
        return `${day} ${this.thaiMonthsShort[month]} ${year}`;
      case 'full':
        return `${day} ${this.thaiMonths[month]} ${year}`;
      case 'datetime':
        return `${day} ${this.thaiMonthsShort[month]} ${year} ${hours}:${minutes} น.`;
      default:
        return `${day} ${this.thaiMonths[month]} ${year}`;
    }
  }
}
