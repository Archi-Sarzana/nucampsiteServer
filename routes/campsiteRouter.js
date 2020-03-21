const express = require("express");
const Campsite = require("../models/campsite");
const campsiteRouter = express.Router();

campsiteRouter
  .route("/")
  .get((req, res, next) => {
    Campsite.find()
      .then(campsites => {
        res.json(campsites);
      })
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    Campsite.create(req.body)
      .then(campsite => {
        res.json(campsite);
      })
      .catch(err => next(err));
  })
  .put((req, res) => {
    res.statusCode = 403;
    res.end("put not supported on /campsites");
  })
  .delete((req, res, next) => {
    Campsite.deleteMany()
      .then(response => {
        res.send(response);
      })
      .catch(err => next(err));
  });

campsiteRouter
  .route("/:campsiteId")
  .get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        res.send(campsite);
      })
      .catch(err => next(err));
  })
  .post((req, res) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /campsites/${req.params.campsiteId}`
    );
  })
  .put((req, res, next) => {
    Campsite.findByIdAndUpdate(
      req.params.campsiteId,
      {
        $set: req.body
      },
      { new: true }
    )
      .then(campsite => {
        res.send(campsite);
      })
      .catch(err => next(err));
  })
  .delete((req, res, next) => {
    Campsite.findByIdAndDelete(req.params.campsiteId)
      .then(campsite => {
        res.send(campsite);
      })
      .catch(err => next(err));
  });

campsiteRouter
  .route("/:campsiteId/comments")
  .get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        if (campsite) {
          res.send(campsite.comments);
        } else {
          err = new Error(`Campsite ${req.params.campsiteId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        if (campsite) {
          campsite.comments.push(req.body);
          campsite
            .save()
            .then(campsite => {
              res.send(campsite);
            })
            .catch(err => {
              next(err);
            });
        } else {
          err = new Error(`Campsite ${req.params.campsiteId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch(err => next(err));
  })
  .put((req, res) => {
    res.statusCode = 403;
    res.end(
      `put not supported on /campsites/${req.params.campsiteId}/comments`
    );
  })
  .delete((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        if (campsite) {
          campsite.comments = [];

          campsite
            .save()
            .then(campsite => {
              res.send(campsite);
            })
            .catch(err => {
              next(err);
            });
        } else {
          err = new Error(`Campsite ${req.params.campsiteId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch(err => next(err));
  });

campsiteRouter
  .route("/:campsiteId/comments/:commentId")
  .get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
          res.send(campsite.comments.id(req.params.commentId));
        } else if (!campsite) {
          err = new Error(`Campsite ${req.params.campsiteId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch(err => next(err));
  })
  .post((req, res) => {
    res
      .status(403)
      .send(
        `POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`
      );
  })
  .put((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
          if (req.body.rating) {
            campsite.comments.id(req.params.commentId).rating = req.body.rating;
          }

          if (req.body.text) {
            campsite.comments.id(req.params.commentId).text = req.body.text;
          }

          campsite
            .save()
            .then(campsite => {
              res.send(campsite);
            })
            .catch(err => next(err));
        } else if (!campsite) {
          err = new Error(`Campsite ${req.params.campsiteId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch(err => next(err));
  })
  .delete((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
          campsite.comments.pull(req.params.commentId);

          campsite
            .save()
            .then(campsite => {
              res.send(campsite);
            })
            .catch(err => next(err));
        } else if (!campsite) {
          err = new Error(`Campsite ${req.params.campsiteId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch(err => next(err));
  });

module.exports = campsiteRouter;