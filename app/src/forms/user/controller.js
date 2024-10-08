const service = require('./service');

module.exports = {
  //
  // User
  //
  list: async (req, res, next) => {
    try {
      const response = await service.list(req.query);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  read: async (req, res, next) => {
    try {
      const response = await service.readSafe(req.params.userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const response = await service.update(req.params.userId, req.body, req.currentUser);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  readUserLabels: async (req, res, next) => {
    try {
      const response = await service.readUserLabels(req.currentUser);
      const labelText = response.map((label) => label.labelText);
      res.status(200).json(labelText);
    } catch (error) {
      next(error);
    }
  },

  updateUserLabels: async (req, res, next) => {
    try {
      const response = await service.updateUserLabels(req.currentUser, req.body);
      const labelText = response.map((label) => label.labelText);
      res.status(200).json(labelText);
    } catch (error) {
      next(error);
    }
  },

  //
  // User Preferences
  //
  deleteUserPreferences: async (req, res, next) => {
    try {
      await service.deleteUserPreferences(req.currentUser);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },

  readUserPreferences: async (req, res, next) => {
    try {
      const response = await service.readUserPreferences(req.currentUser);
      res.status(200).json({
        forms: response,
        preferences: {},
      });
    } catch (error) {
      next(error);
    }
  },

  updateUserPreferences: async (req, res, next) => {
    try {
      const response = await service.updateUserPreferences(req.currentUser, req.body);
      res.status(200).json({
        forms: response,
        preferences: {},
      });
    } catch (error) {
      next(error);
    }
  },

  //
  // User Form Preferences
  //
  deleteUserFormPreferences: async (req, res, next) => {
    try {
      await service.deleteUserFormPreferences(req.currentUser, req.params.formId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },

  readUserFormPreferences: async (req, res, next) => {
    try {
      const response = await service.readUserFormPreferences(req.currentUser, req.params.formId);
      res.status(200).json(response || {});
    } catch (error) {
      next(error);
    }
  },

  updateUserFormPreferences: async (req, res, next) => {
    try {
      const response = await service.updateUserFormPreferences(req.currentUser, req.params.formId, req.body);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
