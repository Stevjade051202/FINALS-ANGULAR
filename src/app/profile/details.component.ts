import { Component } from '@angular/core';

import { AccountService } from '@app/_services';

@Component({
    templateUrl: 'details.component.html',
    standalone: false
})
export class DetailsComponent {
    account = this.accountService.accountValue;

    constructor(private accountService: AccountService) { }
}