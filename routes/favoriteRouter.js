const express = require("express");
const bodyParser = require("body-parser");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const favoriteRouter = express.Router();
const cors = require("./cors");

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  //before running the request
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    console.log(`Getting favorites for user id: ${req.user._id}`);
    Favorite.findOne({ user: req.user._id })
      .populate("user campsites")
      .then((favorite) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorite);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //search for existing user fav campsites in doc
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        //if user has a fav doc already, only add new fav campsite/s
        if (favorite) {
          let userFavs = favorite.campsites;
          for (i = 0; i <= req.body.length - 1; i++) {
            if (!userFavs.includes(req.body[i]._id)) {
              favorite.campsites.push(req.body[i]._id);
            }
          }
          favorite.save().then((favorite) => {
            Favorite.findById(favorite._id)
              .populate("user campsites")
              .then((favorite) => {
                console.log("New Favorite Added ", favorite);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              });
          });
          //create fav doc for user and add all campsiteIDs from req.body
        } else {
          const newFavorite = new Favorite({
            campsites: req.body,
            user: req.user._id,
          });
          newFavorite.save().then((favorite) => {
            //if new fav doc created successfully, then continue
            if (favorite) {
              Favorite.findById(favorite._id)
                .populate("user campsites")
                .then((favorite) => {
                  console.log("Favorite Created ", favorite);
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                });
            } else {
              err = new Error("Error creating new favorite document!");
              err.status = 404;
              return next(err);
            }
          });
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //delete the favorite document for this user
    Favorite.findOneAndRemove({ user: req.user._id })
      .then((response) => {
        console.log("Favorite Campsite Deleted!", response);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => next(err));
  });
//Handle fav campsite/s specified in URL
favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `GET operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then((campsite) => {
        //if campsiteId in URL parameter is valid, then continue
        if (campsite) {
          console.log("Campsite ", campsite.name);
          //search for existing user fav campsites in doc
          Favorite.findOne({ user: req.user._id }).then((favorite) => {
            //if fav doc exists for user, then continue
            if (favorite) {
              let userFavs = favorite.campsites;
              console.log("User Favorites: ", userFavs);
              console.log("Param: ", req.params.campsiteId);
              //if campsiteId param is not in favorite doc, then add it to db
              if (!userFavs.includes(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId);
                favorite.save().then((favorite) => {
                  Favorite.findById(favorite._id)
                    .populate("user campsites")
                    .then((favorite) => {
                      console.log("New Favorite Added ", favorite);
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorite);
                    });
                });
              } else {
                //existing fav campsite cannot be added again
                err = new Error(
                  `The ${campsite.name} campsite is already in the list of favorites!`
                );
                err.status = 404;
                return next(err);
              }
            } else {
              //create new favs doc for user and add campsite
              Favorite.create({
                user: req.user._id,
                campsites: req.params.campsiteId,
              }).then((favorite) => {
                //if new favorite doc created successfully, then continue
                if (favorite) {
                  Favorite.findById(favorite._id)
                    .populate("user campsites")
                    .then((favorite) => {
                      console.log("Favorite Created ", favorite);
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorite);
                    });
                } else {
                  err = new Error("Error creating new favorite document!");
                  err.status = 404;
                  return next(err);
                }
              });
            }
          });
        } else {
          //invalid campsite can't be added to user favs
          err = new Error(`Campsite ${req.params.campsiteId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //searching for the existing user's fav campsite/s
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        //if fav doc exists for user, then continue
        if (favorite) {
          //find position of campsiteId in the campsite array
          let index = favorite.campsites.indexOf(req.params.campsiteId);
          if (index >= 0) {
            //if campsiteId exists, then remove from the array
            favorite.campsites.splice(index, 1);
          }
          favorite
            .save()
            .then((favorite) => {
              Favorite.findById(favorite._id)
                .populate("user campsites")
                .then((favorite) => {
                  console.log("Favorite Campsite Deleted!", favorite);
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                });
            })
            .catch((err) => next(err));
        } else {
          //user doesn't have any favs to delete
          err = new Error(`You have no favorite campsites to delete!`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;

// ObjectId("5e88c97c0256a0e3804def37"),
//     ObjectId("5e88c97c0256a0e3804def38"),
//     ObjectId("5e88c97c0256a0e3804def39")
