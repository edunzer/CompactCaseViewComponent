public with sharing class CompactCaseViewController {
    @AuraEnabled(cacheable=true)
    public static List<Case> getUserCases() {
        if (!Schema.sObjectType.Case.isAccessible()) {
            throw new AuraHandledException('You do not have permission to access Case records.');
        }

        // Check read access for specific fields
        if (!Schema.sObjectType.Case.fields.CaseNumber.isAccessible() || 
            !Schema.sObjectType.Case.fields.Subject.isAccessible() ||
            !Schema.sObjectType.Case.fields.OwnerId.isAccessible() || 
            !Schema.sObjectType.Case.fields.RecordTypeId.isAccessible() || 
            !Schema.sObjectType.Case.fields.Status.isAccessible()) {
            throw new AuraHandledException('You do not have permission to access required Case fields.');
        }

        Id currentUserId = UserInfo.getUserId();
        
        try {
            List<Case> cases = [
                SELECT CaseNumber, Subject, Owner.Name, RecordType.Name, Status, SuppliedEmail
                FROM Case
                WHERE Id IN (SELECT ParentId FROM CaseTeamMember WHERE MemberId = :currentUserId AND TeamRole.Name = 'Case Submitter')
                AND Status != 'Closed'
                ORDER BY CreatedDate DESC
                LIMIT 100
            ];

            return cases;
        } catch (Exception e) {
            throw new AuraHandledException('An error occurred while retrieving cases: ' + e.getMessage());
        }
    }
}
