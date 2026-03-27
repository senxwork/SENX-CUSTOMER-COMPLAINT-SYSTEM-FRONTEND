import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemSettingsService } from 'src/app/shared/services/system-settings.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-settings.html',
  styleUrls: ['./system-settings.scss'],
})
export class SystemSettingsComponent implements OnInit {
  n8nWebhookUrl = '';
  repairApiUrl = '';
  repairApiGetUrl = '';
  repairApiToken = '';
  loading = true;
  saving = false;
  savingRepair: boolean = false;

  constructor(
    private settingsService: SystemSettingsService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    let loaded = 0;
    const checkDone = () => { loaded++; if (loaded >= 4) this.loading = false; };

    this.settingsService.get('n8n_webhook_url').subscribe({
      next: (res: any) => { this.n8nWebhookUrl = res.value || ''; checkDone(); },
      error: () => checkDone(),
    });
    this.settingsService.get('repair_api_url').subscribe({
      next: (res: any) => { this.repairApiUrl = res.value || ''; checkDone(); },
      error: () => checkDone(),
    });
    this.settingsService.get('repair_api_get_url').subscribe({
      next: (res: any) => { this.repairApiGetUrl = res.value || ''; checkDone(); },
      error: () => checkDone(),
    });
    this.settingsService.get('repair_api_token').subscribe({
      next: (res: any) => { this.repairApiToken = res.value || ''; checkDone(); },
      error: () => checkDone(),
    });
  }

  saveN8nUrl(): void {
    if (this.saving) return;
    this.saving = true;
    this.settingsService
      .set('n8n_webhook_url', this.n8nWebhookUrl.trim(), 'N8N Webhook URL สำหรับ AI Generate Ticket')
      .subscribe({
        next: () => {
          this.saving = false;
          this.toastr.success('บันทึกสำเร็จ');
        },
        error: () => {
          this.saving = false;
          this.toastr.error('บันทึกไม่สำเร็จ');
        },
      });
  }

  saveRepairApi(): void {
    if (this.savingRepair) return;
    this.savingRepair = true;
    let saved = 0;
    let hasError = false;
    const checkDone = () => {
      saved++;
      if (saved >= 3) {
        this.savingRepair = false;
        if (hasError) {
          this.toastr.error('บันทึกไม่สำเร็จ');
        } else {
          this.toastr.success('บันทึกสำเร็จ');
        }
      }
    };

    this.settingsService.set('repair_api_url', this.repairApiUrl.trim(), 'Repair API POST URL (สร้างแจ้งซ่อม)').subscribe({
      next: () => checkDone(),
      error: () => { hasError = true; checkDone(); },
    });
    this.settingsService.set('repair_api_get_url', this.repairApiGetUrl.trim(), 'Repair API GET URL (ดูรายละเอียด)').subscribe({
      next: () => checkDone(),
      error: () => { hasError = true; checkDone(); },
    });
    this.settingsService.set('repair_api_token', this.repairApiToken.trim(), 'Repair API Bearer Token').subscribe({
      next: () => checkDone(),
      error: () => { hasError = true; checkDone(); },
    });
  }
}
