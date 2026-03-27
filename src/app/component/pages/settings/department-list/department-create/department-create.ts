import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DepartmentService } from 'src/app/shared/services/department.service';

@Component({
  selector: 'app-department-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './department-create.html',
  styleUrl: './department-create.scss'
})
export class DepartmentCreateComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  contacts: { name: string; email: string; phone: string; is_primary: boolean }[] = [];

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      department_name: ['', Validators.required],
      company: ['', Validators.required],
      responsibility: ['']
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
    this.departmentService.createDepartment(data).subscribe({
      next: () => {
        this.toastr.success('สร้างสำเร็จ');
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
