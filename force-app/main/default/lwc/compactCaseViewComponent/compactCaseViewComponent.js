import { LightningElement, wire, track } from 'lwc';
import getUserCases from '@salesforce/apex/CompactCaseViewController.getUserCases';

const columns = [
    { label: 'Case Number', fieldName: 'CaseNumber', type: 'text', initialWidth: 100 }, // Smaller width
    { label: 'Subject', fieldName: 'Subject', type: 'text', initialWidth: 300 }, // Larger width
    { label: 'Owner', fieldName: 'OwnerName', type: 'text' },
    { label: 'Status', fieldName: 'Status', type: 'text' },
];

export default class CompactCaseViewComponent extends LightningElement {
    @track cases = [];
    @track errorMessage = ''; // Track for error message
    columns = columns;

    @wire(getUserCases)
    wiredCases({ error, data }) {
        if (data) {
            console.log('Cases retrieved successfully:', data);
            // Map data to include Owner's name
            this.cases = data.map(caseRecord => ({
                ...caseRecord,
                OwnerName: caseRecord.Owner.Name,
            }));
            this.errorMessage = ''; // Clear any previous error message

            // Check if no cases were returned
            if (this.cases.length === 0) {
                this.errorMessage = 'You have no cases';
            }
        } else if (error) {
            console.error('Error retrieving cases:', error);
            // Parse error message and store it in errorMessage to display on screen
            this.errorMessage = error.body ? error.body.message : 'An unknown error occurred';
            this.cases = []; // Clear cases if there's an error
        }
    }
}
