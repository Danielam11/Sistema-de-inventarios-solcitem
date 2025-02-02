const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

router.get("/", userController.getUsers);
router.post("/login", userController.loginUser);
router.post("/register", userController.registerUser);
router.put("/:usuario_id", userController.editUser);
router.delete("/:usuario_id", userController.deleteUser);

module.exports = router;
 