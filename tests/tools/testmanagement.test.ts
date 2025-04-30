import { createProjectOrFolderTool } from '../../src/tools/testmanagement';
import { createProjectOrFolder } from '../../src/tools/testmanagement-utils/create-project-folder';
import { createTestCaseTool } from '../../src/tools/testmanagement';
import { createTestCase, sanitizeArgs, TestCaseCreateRequest } from '../../src/tools/testmanagement-utils/create-testcase';
import { updateTestCaseTool, listTestCasesTool } from '../../src/tools/testmanagement';
import { updateTestCase } from '../../src/tools/testmanagement-utils/update-testcase';
import { listTestCases } from '../../src/tools/testmanagement-utils/list-testcases';

// Mock dependencies
jest.mock('../../src/tools/testmanagement-utils/create-project-folder', () => ({
  createProjectOrFolder: jest.fn(),
  CreateProjFoldSchema: {
    parse: (args: any) => args,
    shape: {},
  },
}));
jest.mock('../../src/tools/testmanagement-utils/create-testcase', () => ({
  createTestCase: jest.fn(),
  sanitizeArgs: jest.fn((args) => args),
}));
jest.mock('../../src/config', () => ({
  __esModule: true,
  default: {
    browserstackUsername: 'fake-user',
    browserstackAccessKey: 'fake-key',
  },
}));

  // Mock dependencies
  jest.mock('../../src/tools/testmanagement-utils/update-testcase', () => ({
    updateTestCase: jest.fn(),
    UpdateTestCaseSchema: {
      parse: (args: any) => args,
      shape: {},
    },
  }));
  jest.mock('../../src/tools/testmanagement-utils/list-testcases', () => ({
    listTestCases: jest.fn(),
    ListTestCasesSchema: {
      parse: (args: any) => args,
      shape: {},
    },
  }));


describe('createTestCaseTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validArgs: TestCaseCreateRequest = {
    project_identifier: 'proj-123',
    folder_id: 'fold-456',
    name: 'Sample Test Case',
    description: 'Test case description',
    owner: 'user@example.com',
    preconditions: 'Some precondition',
    test_case_steps: [
      { step: 'Step 1', result: 'Result 1' },
      { step: 'Step 2', result: 'Result 2' },
    ],
    issues: ['JIRA-1'],
    issue_tracker: { name: 'jira', host: 'https://jira.example.com' },
    tags: ['smoke'],
    custom_fields: { priority: 'high' },
  };

  const mockTestCaseResponse = {
    data: {
      success: true,
      test_case: {
        identifier: 'TC-001',
        title: 'Sample Test Case',
        // additional fields omitted for brevity
      },
    },
  };

  it('should successfully create a test case', async () => {
    (createTestCase as jest.Mock).mockResolvedValue(mockTestCaseResponse);

    const result = await createTestCaseTool(validArgs);

    expect(sanitizeArgs).toHaveBeenCalledWith(validArgs);
    expect(createTestCase).toHaveBeenCalledWith(validArgs);
    expect(result.content[0].text).toContain('Successfully created test case TC-001');
    expect(result.content[1].text).toContain('"title": "Sample Test Case"');
  });

  it('should handle API errors while creating test case', async () => {
    (createTestCase as jest.Mock).mockRejectedValue(new Error('API Error'));

    const result = await createTestCaseTool(validArgs);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Failed to create test case: API Error');
  });

  it('should handle unknown error while creating test case', async () => {
    (createTestCase as jest.Mock).mockRejectedValue('unexpected');

    const result = await createTestCaseTool(validArgs);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Unknown error');
  });
});

describe('createProjectOrFolderTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validProjectArgs = {
    project_name: 'My New Project',
    project_description: 'This is a test project',
  };

  const validFolderArgs = {
    project_identifier: 'proj-123',
    folder_name: 'My Test Folder',
    folder_description: 'This is a folder under project',
  };

  const mockProjectResponse = {
    content: [{ type: 'text', text: 'Project created with identifier=proj-123' }],
  };

  const mockFolderResponse = {
    content: [{ type: 'text', text: 'Folder created: ID=fold-123, name="My Folder" in project proj-123' }],
  };

  it('should successfully create a project', async () => {
    (createProjectOrFolder as jest.Mock).mockResolvedValue(mockProjectResponse);

    const result = await createProjectOrFolderTool(validProjectArgs);

    expect(createProjectOrFolder).toHaveBeenCalledWith(validProjectArgs);
    expect(result.content[0].text).toContain('Project created with identifier=proj-123');
  });

  it('should successfully create a folder', async () => {
    (createProjectOrFolder as jest.Mock).mockResolvedValue(mockFolderResponse);

    const result = await createProjectOrFolderTool(validFolderArgs);

    expect(createProjectOrFolder).toHaveBeenCalledWith(validFolderArgs);
    expect(result.content[0].text).toContain('Folder created: ID=fold-123');
  });

  it('should handle error while creating project or folder', async () => {
    (createProjectOrFolder as jest.Mock).mockRejectedValue(new Error('Failed to create project/folder'));

    const result = await createProjectOrFolderTool(validProjectArgs);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Failed to create project/folder: Failed to create project/folder');
  });

  it('should handle unknown error while creating project or folder', async () => {
    (createProjectOrFolder as jest.Mock).mockRejectedValue('some unknown error');

    const result = await createProjectOrFolderTool(validProjectArgs);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Failed to create project/folder: Unknown error');
  });

  describe('updateTestCaseTool', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const validUpdateArgs = {
      project_identifier: 'proj-123',
      test_case_id: 'TC-001',
      name: 'Updated Test Case',
      description: 'Updated description',
      owner: 'user@example.com',
      preconditions: 'Updated precondition',
      test_case_steps: [
        { step: 'Updated Step 1', result: 'Updated Result 1' },
      ],
      tags: ['regression'],
      custom_fields: { priority: 'medium' },
    };

    const mockUpdateResponse = {
      content: [{ type: 'text', text: 'Test case updated successfully' }],
    };

    it('should successfully update a test case', async () => {
      (updateTestCase as jest.Mock).mockResolvedValue(mockUpdateResponse);

      const result = await updateTestCaseTool(validUpdateArgs);

      expect(updateTestCase).toHaveBeenCalledWith(validUpdateArgs);
      expect(result.content[0].text).toContain('Test case updated successfully');
    });

    it('should handle error while updating a test case', async () => {
      (updateTestCase as jest.Mock).mockRejectedValue(new Error('Failed to update test case'));

      const result = await updateTestCaseTool(validUpdateArgs);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to update test case: Failed to update test case');
    });

    it('should handle unknown error while updating a test case', async () => {
      (updateTestCase as jest.Mock).mockRejectedValue('unexpected error');

      const result = await updateTestCaseTool(validUpdateArgs);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to update test case: Unknown error');
    });
  });

  describe('listTestCasesTool', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const validListArgs = {
      project_identifier: 'proj-123',
      folder_id: ['fold-456'],
      filters: { tags: ['smoke'] },
    };

    const mockListResponse = {
      content: [
        { type: 'text', text: 'Test cases fetched successfully' },
        { type: 'text', text: JSON.stringify([{ id: 'TC-001', name: 'Test Case 1' }], null, 2) },
      ],
    };

    it('should successfully list test cases', async () => {
      (listTestCases as jest.Mock).mockResolvedValue(mockListResponse);

      const result = await listTestCasesTool(validListArgs);

      expect(listTestCases).toHaveBeenCalledWith(validListArgs);
      expect(result.content[0].text).toContain('Test cases fetched successfully');
      expect(result.content[1].text).toContain('"id": "TC-001"');
    });

    it('should handle error while listing test cases', async () => {
      (listTestCases as jest.Mock).mockRejectedValue(new Error('Failed to list test cases'));

      const result = await listTestCasesTool(validListArgs);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to list test cases: Failed to list test cases');
    });

    it('should handle unknown error while listing test cases', async () => {
      (listTestCases as jest.Mock).mockRejectedValue('unexpected error');

      const result = await listTestCasesTool(validListArgs);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to list test cases: Unknown error');
    });
  });
});
