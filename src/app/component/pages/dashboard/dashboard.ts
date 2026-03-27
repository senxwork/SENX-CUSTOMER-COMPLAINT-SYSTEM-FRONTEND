import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';
import { Auth } from 'src/app/classes/auth';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { ProjectService } from 'src/app/shared/services/project.service';
import { BusinessUnitService } from 'src/app/shared/services/business-unit.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgApexchartsModule, NgMultiSelectDropDownModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  user: any;
  complaints: any[] = [];
  projects: any[] = [];
  filteredProjects: any[] = [];
  businessUnits: any[] = [];
  loading = true;

  // Filters
  filterYear: number = new Date().getFullYear();
  filterMonth: string = '';
  selectedBUs: any[] = [];
  selectedProjects: any[] = [];

  // BU Dropdown Settings
  buDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'bu_name',
    selectAllText: 'เลือกทั้งหมด',
    unSelectAllText: 'ยกเลิกทั้งหมด',
    allowSearchFilter: true,
    noDataAvailablePlaceholderText: 'ไม่พบข้อมูล',
    searchPlaceholderText: 'ค้นหา'
  };

  // Project Dropdown Settings
  projectDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'project_name_th',
    selectAllText: 'เลือกทั้งหมด',
    unSelectAllText: 'ยกเลิกทั้งหมด',
    allowSearchFilter: true,
    noDataAvailablePlaceholderText: 'ไม่พบข้อมูล',
    searchPlaceholderText: 'ค้นหา'
  };

  // Statistics
  totalOpen = 0;
  totalInProgress = 0;
  totalCompleted = 0;
  totalToday = 0;
  totalAll = 0;

  // Top 5 Projects
  topProjects: { name: string; count: number }[] = [];

  // Problem Categories
  problemCategories: { name: string; count: number }[] = [];

  // Chart Options
  monthlyChartOptions: any;
  speedChartOptions: any;
  typeChartOptions: any;
  typeChartData: { name: string; count: number; color: string }[] = [];

  // Insights
  insights: string[] = [];

  // Month names in Thai
  monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  monthOptions = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  availableYears: number[] = [];

  constructor(
    private complaintService: ComplaintService,
    private projectService: ProjectService,
    private businessUnitService: BusinessUnitService
  ) {}

  ngOnInit(): void {
    this.user = Auth.user;
    this.initAvailableYears();
    Auth.userEmitter.subscribe((res: any) => {
      this.user = res;
      this.loadData();
    });
    this.loadProjects();
    this.loadBusinessUnits();
    this.loadData();
  }

  initAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    this.availableYears = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
      this.availableYears.push(y);
    }
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (res: any) => {
        this.projects = res?.data || res || [];
        this.updateFilteredProjects();
      },
      error: (err) => console.error(err)
    });
  }

  loadBusinessUnits(): void {
    this.businessUnitService.getAll().subscribe({
      next: (res: any) => {
        this.businessUnits = Array.isArray(res) ? res : (res?.data || []);
      },
      error: (err) => console.error(err)
    });
  }

  updateFilteredProjects(): void {
    this.filteredProjects = [...this.projects];

    // Reset selected projects if they are not in filtered list
    if (this.selectedProjects && this.selectedProjects.length > 0) {
      const projectIds = this.filteredProjects.map(p => p.id);
      this.selectedProjects = this.selectedProjects.filter(p => projectIds.includes(p.id));
    }
  }

  loadData(): void {
    this.loading = true;
    const filterData = {
      job_departments_id: this.user?.jobDepartment?.job_departments_id || null
    };

    this.complaintService.getByDepartment(filterData).subscribe({
      next: (res: any) => {
        this.complaints = Array.isArray(res) ? res : (res?.data || []);
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        this.complaints = [];
        this.applyFilters();
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.complaints];

    // Apply year/month filter
    if (this.filterYear) {
      filtered = filtered.filter(w => {
        const created = new Date(w.created_at);
        return created.getFullYear() === Number(this.filterYear);
      });
    }
    if (this.filterMonth !== '' && this.filterMonth !== null) {
      filtered = filtered.filter(w => {
        const created = new Date(w.created_at);
        return created.getMonth() === Number(this.filterMonth);
      });
    }

    // Apply BU filter (multi-select)
    if (this.selectedBUs && this.selectedBUs.length > 0) {
      const selectedIds = this.selectedBUs.map(bu => bu.id);
      filtered = filtered.filter(w => selectedIds.includes(w.businessUnit?.id) || selectedIds.includes(w.businessUnitId));
    }

    // Apply project filter (multi-select)
    if (this.selectedProjects && this.selectedProjects.length > 0) {
      const selectedIds = this.selectedProjects.map(p => p.id);
      filtered = filtered.filter(w => selectedIds.includes(w.project?.id));
    }

    this.calculateStatistics(filtered);
    this.calculateTopProjects(filtered);
    this.calculateProblemCategories(filtered);
    this.initMonthlyChart(filtered);
    this.initSpeedChart(filtered);
    this.initTypeChart(filtered);
    this.generateInsights(filtered);
  }

  onFilterChange(): void {
    this.updateFilteredProjects();
    this.applyFilters();
  }

  onBUSelect(item: any): void {
    this.onFilterChange();
  }

  onBUDeselect(item: any): void {
    this.onFilterChange();
  }

  onSelectAllBU(items: any[]): void {
    this.onFilterChange();
  }

  onDeselectAllBU(items: any[]): void {
    this.onFilterChange();
  }

  onProjectSelect(item: any): void {
    this.onFilterChange();
  }

  onProjectDeselect(item: any): void {
    this.onFilterChange();
  }

  onSelectAllProject(items: any[]): void {
    this.onFilterChange();
  }

  onDeselectAllProject(items: any[]): void {
    this.onFilterChange();
  }

  calculateStatistics(data: any[]): void {
    const today = new Date().toDateString();

    this.totalOpen = data.filter(w => w.status === 'open').length;
    this.totalInProgress = data.filter(w => w.status === 'inprogress').length;
    this.totalCompleted = data.filter(w => w.status === 'completed').length;
    this.totalToday = data.filter(w => new Date(w.created_at).toDateString() === today).length;
    this.totalAll = data.length;
  }

  calculateTopProjects(data: any[]): void {
    const projectCounts: Record<string, number> = {};

    data.forEach(item => {
      const projectName = item.project?.project_name_th || 'ไม่ระบุ';
      projectCounts[projectName] = (projectCounts[projectName] || 0) + 1;
    });

    this.topProjects = Object.entries(projectCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  calculateProblemCategories(data: any[]): void {
    const categoryCounts: Record<string, number> = {};

    data.forEach(item => {
      const categoryName = item.complaintJobCatagory?.catagory_name || 'ไม่ระบุ';
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });

    this.problemCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  initMonthlyChart(data: any[]): void {
    const now = new Date();
    const months: { label: string; year: number; month: number }[] = [];

    // Get last 3 months
    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: `${this.monthNames[date.getMonth()]}-${(date.getFullYear() + 543) % 100}`,
        year: date.getFullYear(),
        month: date.getMonth()
      });
    }

    const completedData: number[] = [];
    const inProgressData: number[] = [];

    months.forEach(m => {
      const monthData = data.filter(w => {
        const created = new Date(w.created_at);
        return created.getFullYear() === m.year && created.getMonth() === m.month;
      });

      completedData.push(monthData.filter(w => w.status === 'completed').length);
      inProgressData.push(monthData.filter(w => w.status === 'inprogress' || w.status === 'open').length);
    });

    // Calculate max value for Y-axis with padding
    const allData = [...completedData, ...inProgressData];
    const maxTotal = Math.max(...completedData.map((c, i) => c + inProgressData[i]));
    const yAxisMax = Math.ceil(maxTotal * 1.15); // Add 15% padding

    this.monthlyChartOptions = {
      series: [
        { name: 'เสร็จสิ้น (Complete)', data: completedData },
        { name: 'กำลังดำเนินการ (Inprogress)', data: inProgressData }
      ],
      chart: {
        type: 'bar',
        height: 380,
        stacked: true,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '45%',
          borderRadius: 6,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'last',
          dataLabels: {
            total: {
              enabled: true,
              offsetY: -2,
              style: {
                fontSize: '14px',
                fontWeight: 700,
                color: '#333'
              },
              formatter: (val: number) => val > 0 ? val.toString() : ''
            }
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val > 0 ? val.toString() : '',
        style: {
          fontSize: '13px',
          fontWeight: 'bold',
          colors: ['#fff']
        }
      },
      xaxis: {
        categories: months.map(m => m.label),
        labels: {
          style: {
            fontSize: '13px',
            fontWeight: 600
          }
        }
      },
      yaxis: {
        min: 0,
        max: yAxisMax,
        tickAmount: 5,
        title: {
          text: 'จำนวน (เรื่อง)',
          style: { fontSize: '12px' }
        },
        labels: {
          formatter: (val: number) => Math.round(val).toString()
        }
      },
      colors: ['#4CAF50', '#FF9800'], // Green for complete, Orange for inprogress
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '12px',
        markers: {
          radius: 4
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: (val: number) => val + ' เรื่อง'
        }
      },
      grid: {
        borderColor: '#e7e7e7',
        strokeDashArray: 4
      }
    };
  }

  initSpeedChart(data: any[]): void {
    const completedItems = data.filter(w => w.status === 'completed' && w.date_job_completed);

    let fast = 0;   // Within 24 hours
    let onTime = 0; // 2-3 days
    let slow = 0;   // More than 3 days

    completedItems.forEach(item => {
      const created = new Date(item.created_at);
      const completed = new Date(item.date_job_completed);
      const diffHours = (completed.getTime() - created.getTime()) / (1000 * 60 * 60);

      if (diffHours <= 24) {
        fast++;
      } else if (diffHours <= 72) {
        onTime++;
      } else {
        slow++;
      }
    });

    const total = fast + onTime + slow || 1;

    this.speedChartOptions = {
      series: [fast, onTime, slow],
      chart: {
        type: 'donut',
        height: 300
      },
      labels: [
        `Fast (ภายใน 24 ชั่วโมง)`,
        `On-Time (2-3 วัน)`,
        `Slow (มากกว่า 3 วัน)`
      ],
      colors: ['#90EE90', '#FFD700', '#FF6B6B'],
      legend: {
        position: 'bottom',
        fontSize: '12px'
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: { show: true },
              value: { show: true },
              total: {
                show: true,
                label: 'รวม',
                formatter: () => completedItems.length + ' เคส'
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => Math.round(val) + '%'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { width: 280 },
          legend: { position: 'bottom' }
        }
      }]
    };
  }

  initTypeChart(data: any[]): void {
    const typeCounts: Record<string, number> = {};

    data.forEach(item => {
      const typeName = item.complaintJobCatagory?.catagory_name || 'ยังไม่ระบุ';
      typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
    });

    const sorted = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Store for legend display
    this.typeChartData = sorted.map(([name, count], index) => ({
      name,
      count,
      color: ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#4D96FF'][index] || '#999'
    }));

    const total = sorted.reduce((sum, s) => sum + s[1], 0);

    this.typeChartOptions = {
      series: sorted.map(s => s[1]),
      chart: {
        type: 'pie',
        height: 280,
        toolbar: { show: false }
      },
      labels: sorted.map(s => s[0]),
      colors: ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#4D96FF'],
      legend: {
        show: false // Hide default legend, we'll create custom one
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => Math.round(val) + '%',
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#fff']
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 1,
          opacity: 0.5
        }
      },
      plotOptions: {
        pie: {
          expandOnClick: true,
          donut: {
            size: '0%'
          }
        }
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['#fff']
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number) => val + ' เรื่อง (' + Math.round((val / total) * 100) + '%)'
        }
      },
      responsive: [{
        breakpoint: 768,
        options: {
          chart: { height: 250 }
        }
      }]
    };
  }

  generateInsights(data: any[]): void {
    this.insights = [];

    // Find most common category
    if (this.problemCategories.length > 0) {
      const topCategory = this.problemCategories[0];
      this.insights.push(
        `ประเภทปัญหาที่พบมากที่สุด: "${topCategory.name}" มีจำนวน ${topCategory.count} เรื่อง`
      );
    }

    // Find most complained project
    if (this.topProjects.length > 0) {
      const topProject = this.topProjects[0];
      this.insights.push(
        `โครงการที่มีเรื่องร้องเรียนมากที่สุด: "${topProject.name}" มีจำนวน ${topProject.count} เรื่อง`
      );
    }

    // Calculate completion rate
    if (data.length > 0) {
      const completionRate = Math.round((this.totalCompleted / data.length) * 100);
      this.insights.push(
        `อัตราการปิดงานสำเร็จ: ${completionRate}% จากทั้งหมด ${data.length} เรื่อง`
      );
    }

    // Check for pending items older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oldPending = data.filter(w =>
      (w.status === 'open' || w.status === 'inprogress') &&
      new Date(w.created_at) < sevenDaysAgo
    ).length;

    if (oldPending > 0) {
      this.insights.push(
        `มีงานค้างเกิน 7 วัน จำนวน ${oldPending} เรื่อง ควรเร่งดำเนินการ`
      );
    }
  }

  // Get color class for project rank
  getRankColor(index: number): string {
    const colors = ['text-danger', 'text-warning', 'text-info', 'text-secondary', 'text-muted'];
    return colors[index] || 'text-muted';
  }

  // Get bullet color for project rank
  getBulletColor(index: number): string {
    const colors = ['#FF6B6B', '#FFD700', '#4ECDC4', '#45B7D1', '#96CEB4'];
    return colors[index] || '#6c757d';
  }
}
