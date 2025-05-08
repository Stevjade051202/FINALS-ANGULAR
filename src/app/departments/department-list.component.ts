import { Component, OnInit } from '@angular/core';
import { DepartmentService } from '../_services/department.service';

@Component({
  templateUrl: 'department-list.component.html',
  standalone: false
})
export class DepartmentListComponent implements OnInit {
  departments: any[] = [];

  constructor(private departmentService: DepartmentService) { }

  ngOnInit() {
    this.departmentService.getAll()
      .subscribe(depts => this.departments = depts);
  }

  deleteDepartment(id: number) {
    const dept = this.departments.find(x => x.id === id);
    dept.isDeleting = true;
    this.departmentService.delete(id)
      .subscribe(() => this.departments = this.departments.filter(x => x.id !== id));
  }
}