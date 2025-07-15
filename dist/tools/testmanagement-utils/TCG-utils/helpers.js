import { randomUUID } from "node:crypto";
/**
 * Build mappings for default fields for priority, status, and case type.
 */
export function buildDefaultFieldMaps(defaultFields) {
    const priority = Object.fromEntries(defaultFields.priority.values.map((v) => [
        v.name.toLowerCase(),
        v.value,
    ]));
    const status = Object.fromEntries(defaultFields.status.values.map((v) => [v.internal_name, v.value]));
    const caseType = Object.fromEntries(defaultFields.case_type.values.map((v) => [v.internal_name, v.value]));
    return { priority, status, caseType };
}
/**
 * Find a boolean custom field ID if present.
 */
export function findBooleanFieldId(customFields) {
    const boolField = customFields.find((f) => f.field_type === "field_boolean");
    return boolField?.id;
}
/**
 * Construct payload for creating a single test case in bulk.
 */
export function createTestCasePayload(tc, scenarioId, folderId, fieldMaps, documentId, booleanFieldId, traceId) {
    const pri = tc.priority ?? "Medium";
    const stat = fieldMaps.status["active"];
    const ct = fieldMaps.caseType["functional"];
    return {
        attachments: [documentId],
        name: tc.name,
        description: tc.description,
        test_case_folder_id: folderId,
        priority: pri,
        status: stat,
        case_type: ct,
        automation_status: "not_automated",
        fetch_ai_test_case_details: true,
        template: "test_case_steps",
        metadata: JSON.stringify({
            ai_prompt: {
                attachment_id: documentId,
                rich_text_id: null,
                scenario: scenarioId,
                test_case_count: tc.test_case_count || 1,
                uuid: tc.uuid || randomUUID() || "unknown-uuid",
                "x-bstack-traceRequestId": traceId,
            },
        }),
        tags: ["AI Generated", "MCP Generated"],
        custom_fields: booleanFieldId ? { [booleanFieldId]: false } : undefined,
        test_case_steps: tc.steps,
        preconditions: tc.preconditions,
    };
}
