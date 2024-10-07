import { LightningElement, wire, track } from 'lwc';
import getUserCases from '@salesforce/apex/CompactCaseViewController.getUserCases';

const columns = [
    { 
        label: 'Case Number', 
        fieldName: 'caseNumber', 
        type: 'button', 
        typeAttributes: { 
            label: { fieldName: 'CaseNumber' }, 
            name: 'view_case_details',
            variant: 'base'
        }, 
        initialWidth: 100 
    },
    { 
        label: 'Subject', 
        fieldName: 'subject', 
        type: 'button', 
        typeAttributes: { 
            label: { fieldName: 'Subject' }, 
            name: 'view_case_details',
            variant: 'base'
        }, 
        initialWidth: 400 
    },
    { label: 'Owner', fieldName: 'OwnerName', type: 'text' },
    { label: 'Status', fieldName: 'Status', type: 'text' } // Keep status in the datatable
];

export default class CompactCaseViewComponent extends LightningElement {
    @track cases = [];
    @track errorMessage = '';
    @track isModalOpen = false;
    @track selectedCase = {};
    columns = columns;

    @wire(getUserCases)
    wiredCases({ error, data }) {
        if (data) {
            this.cases = data.map(caseRecord => ({
                ...caseRecord,
                OwnerName: caseRecord.Owner.Name,
                caseNumber: caseRecord.CaseNumber,
                subject: caseRecord.Subject,
                Status: caseRecord.Status, // Map Status for the datatable
                RecordTypeName: caseRecord.RecordType.Name // Map RecordType.Name for the modal
            }));
            this.errorMessage = '';

            if (this.cases.length === 0) {
                this.errorMessage = 'You have no cases';
            }
        } else if (error) {
            this.errorMessage = error.body ? error.body.message : 'An unknown error occurred';
            this.cases = [];
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'view_case_details') {
            this.selectedCase = {
                caseNumber: row.CaseNumber,
                ownerName: row.OwnerName,
                recordTypeName: row.RecordTypeName, // Use RecordType.Name for modal
                subject: row.Subject
            };
            this.isModalOpen = true;
        }
    }

    closeModal() {
        this.isModalOpen = false;
    }
}
