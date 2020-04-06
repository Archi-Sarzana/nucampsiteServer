const { Router } = require("express");
const Partner = require("../models/partners");
const authenticate = require("../authenticate");
const cors = require("./cors");
const router = Router();

router.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
});

router.get("/", cors.cors, (req, res) => {
  Partner.find()
    .then((partners) => {
      res.send(partners);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.post(
  "/",
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (req, res) => {
    Partner.create(req.body)
      .then((partner) => {
        res.send(partner);
      })
      .catch((err) => res.status(400).send(err));
  }
);

router.put(
  "/",
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (req, res) => {
    res.statusCode = 403;
    res.end("put not supported");
  }
);

router.delete(
  "/",
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (req, res) => {
    Partner.deleteMany()
      .then((response) => {
        res.send(response);
      })
      .catch((err) => res.status(400).send(err));
  }
);

router.get("/:partnerId", cors.cors, (req, res) => {
  Partner.findById(req.params.partnerId)
    .then((partner) => {
      res.send(partner);
    })
    .catch((err) => res.status(400).send(err));
});

router.post(
  "/:partnerId",
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (req, res) => {
    res
      .status(403)
      .send(
        `POST operation not supported on /partners/${req.params.partnerId}`
      );
  }
);

router.put(
  "/:partnerId",
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (req, res) => {
    Partner.findByIdAndUpdate(
      req.params.partnerId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then((partner) => {
        res.send(partner);
      })
      .catch((err) => res.status(400).send(err));
  }
);

router.delete(
  "/:partnerId",
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (req, res) => {
    Partner.findByIdAndDelete(req.params.partnerId)
      .then((partner) => {
        res.send(partner);
      })
      .catch((err) => res.status(400).send(err));
  }
);

module.exports = router;
