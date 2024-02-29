const { getMockReq, getMockRes } = require('@jest-mock/express');
const uuid = require('uuid');

const userAccess = require('../../../../../src/forms/auth/middleware/userAccess');
const { Permissions } = require('../../../../../src/forms/common/constants');
const filePermissions = require('../../../../../src/forms/file/middleware/filePermissions');
const service = require('../../../../../src/forms/file/service');

const fileId = uuid.v4();
const formSubmissionId = uuid.v4();
const userId = uuid.v4();
const username = 'jsmith@idir';

// External dependencies used by the implementation are:
//  - service.read: to read the file
//
describe('currentFileRecord', () => {
  // Default mock of the service read
  const mockFile = { id: fileId };
  service.read = jest.fn().mockReturnValue(mockFile);

  describe('403 response when', () => {
    const expectedStatus = { status: 403 };

    test('no current user', async () => {
      const req = getMockReq({
        params: {
          id: fileId,
        },
      });
      const { res, next } = getMockRes();

      await filePermissions.currentFileRecord(req, res, next);

      expect(service.read).toHaveBeenCalledTimes(0);
      expect(req.currentFileRecord).toEqual(undefined);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.objectContaining(expectedStatus));
    });

    test('no file id', async () => {
      const req = getMockReq({
        currentUser: {
          idpUserId: userId,
          username: username,
        },
      });
      const { res, next } = getMockRes();

      await filePermissions.currentFileRecord(req, res, next);

      expect(service.read).toHaveBeenCalledTimes(0);
      expect(req.currentFileRecord).toEqual(undefined);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.objectContaining(expectedStatus));
    });

    test('file record not found', async () => {
      service.read.mockReturnValueOnce(undefined);
      const req = getMockReq({
        currentUser: {
          idpUserId: userId,
          username: username,
        },
        params: { id: fileId },
      });
      const { res, next } = getMockRes();

      await filePermissions.currentFileRecord(req, res, next);

      expect(service.read).toHaveBeenCalledTimes(1);
      expect(service.read).toHaveBeenCalledWith(fileId);
      expect(req.currentFileRecord).toEqual(undefined);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.objectContaining(expectedStatus));
    });

    test('exception in file lookup', async () => {
      const error = new Error();
      service.read.mockRejectedValueOnce(error);
      const req = getMockReq({
        currentUser: {
          idpUserId: userId,
          username: username,
        },
        params: { id: fileId },
      });
      const { res, next } = getMockRes();

      await filePermissions.currentFileRecord(req, res, next);

      expect(service.read).toHaveBeenCalledTimes(1);
      expect(service.read).toHaveBeenCalledWith(fileId);
      expect(req.currentFileRecord).toEqual(undefined);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.objectContaining(expectedStatus));
    });
  });

  describe('allows', () => {
    test('api key user', async () => {
      const req = getMockReq({
        apiUser: true,
        params: { id: fileId },
      });
      const { res, next } = getMockRes();

      await filePermissions.currentFileRecord(req, res, next);

      expect(service.read).toHaveBeenCalledTimes(1);
      expect(service.read).toHaveBeenCalledWith(fileId);
      expect(req.currentFileRecord).toEqual(mockFile);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    test('authenticated user', async () => {
      const req = getMockReq({
        currentUser: {
          idpUserId: userId,
          username: username,
        },
        params: { id: fileId },
      });
      const { res, next } = getMockRes();

      await filePermissions.currentFileRecord(req, res, next);

      expect(service.read).toHaveBeenCalledTimes(1);
      expect(service.read).toHaveBeenCalledWith(fileId);
      expect(req.currentFileRecord).toEqual(mockFile);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    test('public user', async () => {
      const req = getMockReq({
        currentUser: {
          username: 'public',
        },
        params: { id: fileId },
      });
      const { res, next } = getMockRes();

      await filePermissions.currentFileRecord(req, res, next);

      expect(service.read).toHaveBeenCalledTimes(1);
      expect(service.read).toHaveBeenCalledWith(fileId);
      expect(req.currentFileRecord).toEqual(mockFile);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });
  });
});

// Has no external dependencies to test.
describe('hasFileCreate', () => {
  describe('403 response when', () => {
    const expectedStatus = { status: 403 };

    test('api key user', async () => {
      const req = getMockReq({
        apiUser: true,
      });
      const { res, next } = getMockRes();

      await filePermissions.hasFileCreate(req, res, next);

      expect(req.currentFileRecord).toEqual(undefined);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.objectContaining(expectedStatus));
    });

    test('no current user', async () => {
      const req = getMockReq();
      const { res, next } = getMockRes();

      await filePermissions.hasFileCreate(req, res, next);

      expect(req.currentFileRecord).toEqual(undefined);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.objectContaining(expectedStatus));
    });

    test('public user', async () => {
      const req = getMockReq({
        currentUser: {
          username: 'public',
        },
      });
      const { res, next } = getMockRes();

      await filePermissions.hasFileCreate(req, res, next);

      expect(req.currentFileRecord).toEqual(undefined);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.objectContaining(expectedStatus));
    });
  });

  describe('allows', () => {
    it('authenticated user', async () => {
      const req = getMockReq({
        currentUser: {
          idpUserId: userId,
          username: username,
        },
      });
      const { res, next } = getMockRes();

      await filePermissions.hasFileCreate(req, res, next);

      expect(req.currentFileRecord).toEqual(undefined);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });
  });
});

// External dependencies used by the implementation are:
//  - userAccess.hasSubmissionPermissions
//
describe('hasFilePermissions', () => {
  // Default mock of the submission permissions
  const mockPermission = [Permissions.SUBMISSION_READ];
  userAccess.hasSubmissionPermissions = jest.fn().mockReturnValue((_req, _res, next) => {
    next();
  });

  describe('403 response when', () => {
    const expectedStatus = { status: 403 };

    test('no current user', async () => {
      const req = getMockReq();
      const { res, next } = getMockRes();

      filePermissions.hasFilePermissions(mockPermission)(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.objectContaining(expectedStatus));
    });

    test('public user', async () => {
      const req = getMockReq({
        currentUser: {
          username: 'public',
        },
      });
      const { res, next } = getMockRes();

      filePermissions.hasFilePermissions(mockPermission)(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.objectContaining(expectedStatus));
    });
  });

  describe('500 response when', () => {
    const expectedStatus = { status: 500 };

    test('no current file record', async () => {
      const req = getMockReq({
        currentUser: {
          idpUserId: userId,
          username: username,
        },
      });
      const { res, next } = getMockRes();

      filePermissions.hasFilePermissions(mockPermission)(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.objectContaining(expectedStatus));
    });
  });

  describe('allows', () => {
    test('api key user', async () => {
      const req = getMockReq({
        apiUser: true,
      });
      const { res, next } = getMockRes();

      filePermissions.hasFilePermissions(mockPermission)(req, res, next);

      expect(userAccess.hasSubmissionPermissions).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    test('authenticated user', async () => {
      const req = getMockReq({
        currentUser: {
          idpUserId: userId,
          username: username,
        },
        currentFileRecord: {
          formSubmissionId: formSubmissionId,
          name: 'submitted_file.pdf',
        },
      });
      const { res, next } = getMockRes();

      filePermissions.hasFilePermissions(mockPermission)(req, res, next);

      expect(userAccess.hasSubmissionPermissions).toHaveBeenCalledTimes(1);
      expect(userAccess.hasSubmissionPermissions).toHaveBeenCalledWith(mockPermission);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    test('authenticated user with undefined form submission id', async () => {
      const req = getMockReq({
        currentUser: {
          idpUserId: userId,
          username: username,
        },
        currentFileRecord: {
          name: 'unsubmitted_file.pdf',
        },
      });
      const { res, next } = getMockRes();

      filePermissions.hasFilePermissions(mockPermission)(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });
  });
});
