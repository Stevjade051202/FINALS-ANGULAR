import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../_services';

@Component({
  templateUrl: 'list.component.html',
  standalone: false
})
export class ListComponent implements OnInit {
  employees: any[] = [];

  constructor(private employeeService: EmployeeService) { }

  ngOnInit() {
    this.employeeService.getAll()
      .subscribe(employees => this.employees = employees);
  }

  deleteEmployee(id: number) {
    const employee = this.employees.find(x => x.id === id);
    employee.isDeleting = true;
    this.employeeService.delete(id)
      .subscribe(() => this.employees = this.employees.filter(x => x.id !== id));
  }
}