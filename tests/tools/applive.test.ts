import fs from 'fs';
import { startSession } from '../../src/tools/applive-utils/start-session';
import { uploadApp } from '../../src/tools/applive-utils/upload-app';
import logger from '../../src/logger';
import { startAppLiveSession } from '../../src/tools/applive';
import { beforeEach, it, expect, describe, vi, Mock } from 'vitest'

// Mock the dependencies
vi.mock('fs');
vi.mock('../../src/tools/applive-utils/upload-app', () => ({
  uploadApp: vi.fn()
}));
vi.mock('../../src/tools/applive-utils/start-session', () => ({
  startSession: vi.fn()
}));

vi.mock('../../src/lib/instrumentation', () => ({
  trackMCP: vi.fn()
}));

vi.mock('../../src/logger', () => {
  return {
    default: {
      error: vi.fn(),
      info: vi.fn(),
      debug: vi.fn()
    }
  }
});

describe('startAppLiveSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    (fs.existsSync as Mock).mockReturnValue(true);
    (fs.accessSync as Mock).mockReturnValue(undefined);
    (uploadApp as Mock).mockResolvedValue({ app_url: 'bs://123456' });
    (startSession as Mock).mockResolvedValue('https://app-live.browserstack.com/123456');
  });

  const validAndroidArgs = {
    desiredPlatform: 'android',
    desiredPlatformVersion: '12.0',
    appPath: '/path/to/app.apk',
    desiredPhone: 'Samsung Galaxy S20'
  };

  const validiOSArgs = {
    desiredPlatform: 'ios',
    desiredPlatformVersion: '16.0',
    appPath: '/path/to/app.ipa',
    desiredPhone: 'iPhone 12 Pro'
  };

  const mockConfig = { 
    getClientVersion: () => "test-version",
    "browserstack-username": "test-username",
    "browserstack-access-key": "test-access-key"
  };

  it('should successfully start an Android app live session', async () => {
    const result = await startAppLiveSession(validAndroidArgs, mockConfig);

    expect(startSession).toHaveBeenCalledWith({
      appPath: '/path/to/app.apk',
      desiredPlatform: 'android',
      desiredPhone: validAndroidArgs.desiredPhone,
      desiredPlatformVersion: validAndroidArgs.desiredPlatformVersion
    }, { config: mockConfig });
    expect(result.content?.[0]?.text).toContain('Successfully started a session');
  });

  it('should successfully start an iOS app live session', async () => {
    const result = await startAppLiveSession(validiOSArgs, mockConfig);

    expect(startSession).toHaveBeenCalledWith({
      appPath: '/path/to/app.ipa',
      desiredPlatform: 'ios',
      desiredPhone: validiOSArgs.desiredPhone,
      desiredPlatformVersion: validiOSArgs.desiredPlatformVersion
    }, { config: mockConfig });
    expect(result.content?.[0]?.text).toContain('Successfully started a session');
  });

  it('should fail if platform is not provided', async () => {
    const args = { ...validAndroidArgs, desiredPlatform: '' };
    await expect(startAppLiveSession(args, mockConfig)).rejects.toThrow('You must provide a desiredPlatform');
  });

  it('should fail if app path is not provided', async () => {
    const args = { ...validAndroidArgs, appPath: '' };
    await expect(startAppLiveSession(args, mockConfig)).rejects.toThrow('You must provide either appPath or browserstackAppUrl.');
  });

  it('should fail if phone is not provided', async () => {
    const args = { ...validAndroidArgs, desiredPhone: '' };
    await expect(startAppLiveSession(args, mockConfig)).rejects.toThrow('You must provide a desiredPhone');
  });

  it('should fail if Android app path does not end with .apk', async () => {
    const args = { ...validAndroidArgs, appPath: '/path/to/app.ipa' };
    await expect(startAppLiveSession(args, mockConfig)).rejects.toThrow('You must provide a valid Android app path');
  });

  it('should fail if iOS app path does not end with .ipa', async () => {
    const args = { ...validiOSArgs, appPath: '/path/to/app.apk' };
    await expect(startAppLiveSession(args, mockConfig)).rejects.toThrow('You must provide a valid iOS app path');
  });

  it('should fail if app file does not exist', async () => {
    (fs.existsSync as Mock).mockReturnValue(false);
    await expect(startAppLiveSession(validAndroidArgs, mockConfig)).rejects.toThrow('The app path does not exist');
    expect(logger.error).toHaveBeenCalled();
  });

  it('should fail if app file is not readable', async () => {
    (fs.accessSync as Mock).mockImplementation(() => {
      throw new Error('EACCES: permission denied');
    });
    await expect(startAppLiveSession(validAndroidArgs, mockConfig)).rejects.toThrow('The app path does not exist or is not readable');
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle session start failure', async () => {
    (startSession as Mock).mockRejectedValue(new Error('Session start failed'));
    await expect(startAppLiveSession(validAndroidArgs, mockConfig)).rejects.toThrow('Session start failed');
  });
});
