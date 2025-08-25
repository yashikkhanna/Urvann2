import express from "express";
import { addPlant ,updatePlant,getPlants, deletePlant} from "../controllers/plantController.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/addPlant", isAdminAuthenticated, addPlant);
router.post("/updatePlant/:id",isAdminAuthenticated,updatePlant);
router.get("/getPlants",getPlants);
router.delete("/deletePlant/:id",isAdminAuthenticated, deletePlant);
export default router;
