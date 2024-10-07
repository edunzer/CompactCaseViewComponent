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
    { label: 'Status', fieldName: 'Status', type: 'text' },
];

export default class CompactCaseViewComponent extends LightningElement {
    @track cases = [];
    @track errorMessage = '';
    @track isModalOpen = false; // Track modal visibility
    @track selectedCase = {}; // Store details of the selected case
    columns = columns;

    @wire(getUserCases)
    wiredCases({ error, data }) {
        if (data) {
            this.cases = data.map(caseRecord => ({
                ...caseRecord,
                OwnerName: caseRecord.Owner.Name,
                caseNumber: caseRecord.CaseNumber, // Add case number to be used for the button
                subject: caseRecord.Subject // Add subject to be used for the button
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

    // Handle row action
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'view_case_details') {
            // Set the selected case details
            this.selectedCase = {
                caseNumber: row.CaseNumber,
                ownerName: row.OwnerName,
                status: row.Status,
                subject: row.Subject
            };
            // Open the modal
            this.isModalOpen = true;
        }
    }

    // Close the modal
    closeModal() {
        this.isModalOpen = false;
    }
}
