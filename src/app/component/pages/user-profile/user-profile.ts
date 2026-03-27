import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Auth } from 'src/app/classes/auth';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserService } from 'src/app/shared/services/user.service';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile {

files: any[] = [];
  infoForm: FormGroup;
  passwordForm: FormGroup;
  user: any;
  loading: boolean;
  loadingText: string;
  password = "password";
  show = false;
  showEdit = false;
  showEditPassword = false;
  showLineQR = false;
  confirmResut: string;
  endpointProfileImage: any;
  endpointSignature_imageImage: any;
  url: any;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.endpointProfileImage = this.userService.endpointProfileImage;
    this.endpointSignature_imageImage =
      this.userService.endpointSignature_imageImage;

    this.router.events.subscribe((event:any) => {
      if (
        event instanceof RouteConfigLoadStart ||
        event instanceof ResolveStart
      ) {
        this.loadingText = "Loading Dashboard Module...";

        this.loading = true;
      }
      if (event instanceof RouteConfigLoadEnd || event instanceof ResolveEnd) {
        this.loading = false;
      }
    });
    const user = Auth.user;
    this.user = user;
    if (this.user?.user_id) {
      this.load();
    }
    Auth.userEmitter.subscribe((res: any) => {
      this.user = res;
      if (!user && this.user?.user_id) {
        this.load();
      }
    });

    this.infoForm = this.formBuilder.group({
      first_name_last_name: "",
      nickname: "",
      mobile: "",
      title: "",
      email: "",
    });

    this.passwordForm = this.formBuilder.group({
      password: "",
      password_confirm: "",
    });
  }
  load() {
    this.userService.get(this.user.user_id).subscribe((res:any) => {
      this.user = res;
    });
  }
  onCheckboxChange(event: any) {
    if (this.password === "password") {
      this.password = "text";
      this.show = true;
    } else {
      this.password = "password";
      this.show = false;
    }
  }
  resetTheForm(): void {
    this.passwordForm.reset();
  }
  resetTheinfoForm(): void {
    this.infoForm.reset();
    window.location.reload();
  }
  passwordSubmit() {
    this.loading = true;
    this.loadingText = "บันทึกเปลี่ยนรหัสผ่าน...";
    this.authService.updatePassword(this.passwordForm.getRawValue()).subscribe({
      next: (beers:any) => {
        this.toastr.success("เปลี่ยนรหัสผ่าน เสร็จสิ้น", "แจ้งเตือน", {
          timeOut: 5000,
          closeButton: true,
          progressBar: true,
        });
        this.resetTheForm();
        return beers;
      },
      error: (e:any) => {
        console.log(e.error.message);
        this.toastr.error(e.error.message, "แจ้งเตือน", {
          timeOut: 5000,
          closeButton: true,
          progressBar: true,
        });
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.resetTheForm();
      },
    });
  }
  infoSubmit(): void {
    this.loading = true;
    this.loadingText = "บันทึกเปลี่ยนแปลงข้อมูลส่วนตัว...";

    this.authService
      .updateInfo(this.infoForm.getRawValue())

      .subscribe({
        next: (user:any) => {
          Auth.userEmitter.emit(user);
          this.toastr.success(
            "เปลี่ยนแปลงข้อมูลส่วนตัว เสร็จสิ้น",
            "แจ้งเตือน",
            { timeOut: 1000, closeButton: true, progressBar: true }
          );
          this.resetTheForm();
          return user;
        },
        error: (e:any) => {
          console.log(e.error.message);
          this.toastr.error(e.error.message, "แจ้งเตือน", {
            timeOut: 1000,
            closeButton: true,
            progressBar: true,
          });
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          setTimeout(() => {
            this.resetTheinfoForm();
          }, 1000);
        },
      });
    this.authService
      .updateInfo(this.infoForm.getRawValue())
      .subscribe((user:any) => Auth.userEmitter.emit(user));
  }

  openModalConfirm(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: "modal-basic-title", centered: true })
      .result.then(
        (result:any) => {
          if (result === "Ok") {
            this.infoSubmit();
          }
        },
        (reason:any) => {
          console.log(reason);
        }
      );
  }
  openModalUploadImage(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: "modal-basic-title", centered: false })
      .result.then(
        (result:any) => {
          if (result === "Ok") {
          }
        },
        (reason:any) => {
          console.log(reason);
        }
      );
  }
  editDataUser() {
    this.showEdit = true;
    this.showEditPassword = false;
  }

  editDataPassword() {
    this.showEdit = false;
    this.showEditPassword = true;
  }

  /**
   * แสดง QR Code สำหรับเชื่อมต่อ LINE
   */
  showLineQRCode() {
    this.showLineQR = true;
  }

  /**
   * สร้าง LIFF URL สำหรับเปิดหน้าเชื่อมต่อ LINE
   * QR Code จะแสดงเฉพาะ user_id (ตัวเลข)
   * เพื่อให้ Scan ด้วย LIFF Scanner ได้
   */
  getLineOADeepLink(): string {
    // Return เฉพาะ user_id เป็นตัวเลข
    // เพื่อให้สามารถ Scan ได้
    return String(this.user.user_id);
  }

  /**
   * เปิด Modal ยืนยันการยกเลิกการเชื่อมต่อ LINE
   */
  openModalDisconnectLine(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then(
        (result: any) => {
          if (result === 'Ok') {
            this.disconnectLine();
          }
        },
        (reason: any) => {
          console.log(reason);
        }
      );
  }

  /**
   * ยกเลิกการเชื่อมต่อกับ LINE OA
   */
  disconnectLine(): void {
    this.loading = true;
    this.loadingText = 'กำลังยกเลิกการเชื่อมต่อ LINE...';

    this.userService
      .deactivateLine(this.user.user_id)
      .subscribe({
        next: (response: any) => {
          this.toastr.success('ยกเลิกการเชื่อมต่อ LINE สำเร็จ', 'แจ้งเตือน', {
            timeOut: 5000,
            closeButton: true,
            progressBar: true,
          });
          // อัพเดทข้อมูลผู้ใช้
          this.user.line_user_status = false;
          this.user.line_user_id = null;
          Auth.userEmitter.emit(this.user);
        },
        error: (error: any) => {
          console.error('Error disconnecting LINE:', error);
          this.toastr.error(
            error.error?.message || 'เกิดข้อผิดพลาดในการยกเลิกการเชื่อมต่อ',
            'แจ้งเตือน',
            {
              timeOut: 5000,
              closeButton: true,
              progressBar: true,
            }
          );
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  onSelectFile(event: any) {
    const file = event.target.files[0];

    // ตรวจสอบว่ามีไฟล์หรือไม่
    if (!file) {
      return;
    }

    // ตรวจสอบว่าเป็นไฟล์รูปภาพหรือไม่
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!validImageTypes.includes(file.type)) {
      this.toastr.warning("ไม่รองรับไฟล์นี้", "แจ้งเตือน", {
        timeOut: 5000,
        closeButton: true,
        progressBar: true,
      });
      return;
    }

    // หากเป็นไฟล์รูปภาพ ดำเนินการต่อ
    var reader = new FileReader();
    this.files = file;
    reader.readAsDataURL(file);

    reader.onload = (event:any) => {
      this.url = event.target.result;
    };
  }

  uploadImageProfile() {
    if (this.url) {
      this.userService
        .uploadImageFileProfile(this.user.user_id, this.files)
        .subscribe({
          next: (beers:any) => {
            this.toastr.success("อัพเดตอัพโหลดไฟล์ เสร็จสิ้น", "แจ้งเตือน", {
              timeOut: 5000,
              closeButton: true,
              progressBar: true,
            });
            this.resetTheForm();

            return beers;
          },
          error: (e:any) => {
            console.log(e.error.message);
            this.toastr.error(e.error.message, "แจ้งเตือน", {
              timeOut: 5000,
              closeButton: true,
              progressBar: true,
            });
            this.loading = false;
          },
          complete: () => {
            location.reload();
            this.load();
            this.modalService.dismissAll();
          },
        });
    }
  }
  uploadSignatureImage() {
    if (this.url) {
      this.userService
        .uploadSignatureImage(this.user.user_id, this.files)
        .subscribe({
          next: (beers:any) => {
            this.toastr.success("อัพเดตอัพโหลดไฟล์ เสร็จสิ้น", "แจ้งเตือน", {
              timeOut: 5000,
              closeButton: true,
              progressBar: true,
            });
            this.resetTheForm();

            return beers;
          },
          error: (e:any) => {
            console.log(e.error.message);
            this.toastr.error(e.error.message, "แจ้งเตือน", {
              timeOut: 5000,
              closeButton: true,
              progressBar: true,
            });
            this.loading = false;
          },
          complete: () => {
            location.reload();
            this.load();
            this.modalService.dismissAll();
          },
        });
    }
  }
}

