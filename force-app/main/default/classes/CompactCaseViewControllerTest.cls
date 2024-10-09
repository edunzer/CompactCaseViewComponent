@IsTest
public class CompactCaseViewControllerTest {
    @IsTest
    static void testGetUserCases() {
        // Create a test Case record
        Case testCase = new Case(
            Subject = 'Test Case',
            Status = 'New',
            Origin = 'Web'
        );
        insert testCase;

        // Add the current user as a CaseTeamMember
        CaseTeamRole caseTeamRole = [SELECT Id FROM CaseTeamRole WHERE Name = 'Case Submitter' LIMIT 1];
        CaseTeamMember caseTeamMember = new CaseTeamMember(
            ParentId = testCase.Id,
            MemberId = UserInfo.getUserId(),
            TeamRoleId = caseTeamRole.Id
        );
        insert caseTeamMember;

        // Call the method being tested
        List<Case> cases = CompactCaseViewController.getUserCases();

        // Assert that the method returns the expected Case record
        System.assertEquals(1, cases.size());
        System.assertEquals(testCase.Id, cases[0].Id);
    }

    @IsTest
    static void testNoPermission() {
        // Create a test Case record
        Case testCase = new Case(
            Subject = 'Test Case',
            Status = 'New',
            Origin = 'Web'
        );
        insert testCase;

        // Add the current user as a CaseTeamMember
        CaseTeamRole caseTeamRole = [SELECT Id FROM CaseTeamRole WHERE Name = 'Case Submitter' LIMIT 1];
        CaseTeamMember caseTeamMember = new CaseTeamMember(
            ParentId = testCase.Id,
            MemberId = UserInfo.getUserId(),
            TeamRoleId = caseTeamRole.Id
        );
        insert caseTeamMember;

        // Remove read access for specific fields
        FieldDefinition caseNumberFieldDef = [SELECT Id, DurableId, EntityDefinitionId, NamespacePrefix FROM FieldDefinition WHERE EntityDefinitionId = 'Case' AND DeveloperName = 'CaseNumber' LIMIT 1];
        FieldDefinition subjectFieldDef = [SELECT Id, DurableId, EntityDefinitionId, NamespacePrefix FROM FieldDefinition WHERE EntityDefinitionId = 'Case' AND DeveloperName = 'Subject' LIMIT 1];
        FieldDefinition ownerIdFieldDef = [SELECT Id, DurableId, EntityDefinitionId, NamespacePrefix FROM FieldDefinition WHERE EntityDefinitionId = 'Case' AND DeveloperName = 'OwnerId' LIMIT 1];
        FieldDefinition recordTypeIdFieldDef = [SELECT Id, DurableId, EntityDefinitionId, NamespacePrefix FROM FieldDefinition WHERE EntityDefinitionId = 'Case' AND DeveloperName = 'RecordTypeId' LIMIT 1];
        FieldDefinition statusFieldDef = [SELECT Id, DurableId, EntityDefinitionId, NamespacePrefix FROM FieldDefinition WHERE EntityDefinitionId = 'Case' AND DeveloperName = 'Status' LIMIT 1];
        List<FieldDefinition> fieldDefs = new List<FieldDefinition>{caseNumberFieldDef, subjectFieldDef, ownerIdFieldDef, recordTypeIdFieldDef, statusFieldDef};
        for (FieldDefinition fieldDef : fieldDefs) {
            PermissionSet permissionSet = new PermissionSet(
                Name = 'NoAccess' + fieldDef.DurableId,
                Label = 'NoAccess' + fieldDef.DurableId
            );
            insert permissionSet;

            ObjectPermissions objectPermissions = new ObjectPermissions(
                ParentId = permissionSet.Id,
                SobjectType = 'Case',
                PermissionsRead = false
            );
            insert objectPermissions;

            FieldPermissions fieldPermissions = new FieldPermissions(
                ParentId = objectPermissions.Id,
                Field = fieldDef.DurableId,
                SobjectType = 'Case',
                PermissionsRead = false
            );
            insert fieldPermissions;

            PermissionSetAssignment permissionSetAssignment = new PermissionSetAssignment(
                AssigneeId = UserInfo.getUserId(),
                PermissionSetId = permissionSet.Id
            );
            insert permissionSetAssignment;
        }

        // Call the method being tested
        try {
            List<Case> cases = CompactCaseViewController.getUserCases();
            System.assert(false, 'An exception should have been thrown.');
        } catch (AuraHandledException e) {
            // Assert that the method throws an AuraHandledException with the expected message
            System.assertEquals('You do not have permission to access required Case fields.', e.getMessage());
        }
    }
}
