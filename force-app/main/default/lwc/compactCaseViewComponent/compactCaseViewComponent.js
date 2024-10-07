import { LightningElement, wire, track } from 'lwc';
import getUserCases from '@salesforce/apex/CompactCaseViewController.getUserCases';
import getCaseEmails from '@salesforce/apex/CompactCaseViewController.getCaseEmails';

const columns = [
    { 
        label: 'Case #', 
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
        type: 'text', // Change type to 'text' to prevent wrapping
        initialWidth: 400 
    },
    { label: 'Case Agent', fieldName: 'OwnerName', type: 'text' },
    { label: 'Status', fieldName: 'Status', type: 'text' }
];



export default class CompactCaseViewComponent extends LightningElement {
    @track cases = [];
    @track errorMessage = '';
    @track isModalOpen = false;
    @track selectedCase = {};
    @track emails = [];
    @track pathStages = [
        { label: 'New', value: 'New' },
        { label: 'Being Reviewed', value: 'Being Reviewed' },
        { label: 'On Hold', value: 'On Hold' },
        { label: 'Closed', value: 'Closed' }
    ];

    columns = columns;

    @wire(getUserCases)
    wiredCases({ error, data }) {
        if (data) {
            this.cases = data.map(caseRecord => ({
                ...caseRecord,
                OwnerName: caseRecord.Owner.Name,
                caseNumber: caseRecord.CaseNumber,
                subject: caseRecord.Subject,
                Status: caseRecord.Status, 
                RecordTypeName: caseRecord.RecordType.Name
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
                caseId: row.Id,
                caseNumber: row.CaseNumber,
                ownerName: row.OwnerName,
                recordTypeName: row.RecordTypeName,
                subject: row.Subject,
                status: row.Status
            };
            this.fetchEmails(row.Id);
            this.isModalOpen = true;
        }
    }

    fetchEmails(caseId) {
        getCaseEmails({ caseId })
            .then((result) => {
                this.emails = result.map(email => ({
                    ...email,
                    body: this.extractLatestEmailContent(email.HtmlBody), // Use HtmlBody instead of TextBody
                    formattedLabel: 'From: ' + email.FromAddress
                }));

                // If no emails are found, set an empty message
                if (this.emails.length === 0) {
                    this.emails = [{ formattedLabel: 'No emails found for this case.', body: '' }];
                }
            })
            .catch((error) => {
                console.error('Error fetching emails:', error);
            });
    }

    extractLatestEmailContent(emailBody) {
        // Regular expression to match common markers that indicate the start of a quoted message
        const regex = /(\r?\n|\r)?(?:From:|On .*? wrote:|Sent:|--- Original Message ---|____ Forwarded message ____)/i;
        
        // Use the regular expression to split the content and get the first part (new content)
        const newContentArray = emailBody ? emailBody.split(regex) : [''];
        
        // Return the first part, which is assumed to be the latest email content
        return newContentArray[0].trim();
    }

    closeModal() {
        this.isModalOpen = false;
        this.emails = [];
    }

    get currentStep() {
        return this.selectedCase.status || 'New';
    }
}
