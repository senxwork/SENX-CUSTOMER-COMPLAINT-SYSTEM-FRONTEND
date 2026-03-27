import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DepartmentService } from 'src/app/shared/services/department.service';

@Component({
  selector: 'app-department-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './department-edit.html',
  styleUrl: './department-edit.scss'
})
export class DepartmentEditComponent implements OnInit {
  id!: string;
  form!: FormGroup;
  loading = false;
  loadingData = true;
  contacts: { name: string; email: string; phone: string; is_primary: boolean }[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private departmentService: DepartmentService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.form = this.fb.group({
      department_name: ['', Validators.required],
      company: ['', Validators.required],
      responsibility: ['']
    });

    this.loadData();
  }

  loadData(): void {
    this.departmentService.getAll().subscribe({
      next: (data) => {
        const item = data?.find((d: any) => d.id === this.id);
        if (item) {
          this.form.patchValue({ department_name: item.department_name, company: item.company, responsibility: item.responsibility || '' });
          this.contacts = (item.contacts || []).map((c: any) => ({
            name: c.name || '',
            email: c.email || '',
            phone: c.phone || '',
            is_primary: c.is_primary || false
          }));
        }
        this.loadingData = false;
      },
      error: (err) => {
        this.toastr.error('ไม่สามารถโหลดข้อมูลได้');
        console.error(err);
        this.router.navigate(['/pages/settings/department-list']);
      }
    });
  }

  addContact(): void {
    this.contacts.push({ name: '', email: '', phone: '', is_primary: false });
  }

  removeContact(index: number): void {
    this.contacts.splice(index, 1);
  }

  setPrimary(index: number): void {
    this.contacts.forEach((c, i) => c.is_primary = i === index);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toastr.warning('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const validContacts = this.contacts.filter(c => c.name.trim() || c.email.trim());
    if (validContacts.some(c => !c.name.trim())) {
      this.toastr.warning('กรุณากรอกชื่อผู้ติดต่อให้ครบ');
      return;
    }

    this.loading = true;
    const data = {
      ...this.form.value,
      contacts: validContacts
    };
    this.departmentService.editDepartment(this.id, data).subscribe({
      next: () => {
        this.toastr.success('บันทึกสำเร็จ');
        this.router.navigate(['/pages/settings/department-list']);
      },
      error: (err) => {
        this.toastr.error('เกิดข้อผิดพลาด');
        console.error(err);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/pages/settings/department-list']);
  }
}
